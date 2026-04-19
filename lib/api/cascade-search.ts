/**
 * Cascade ("funnel") search for similar career paths.
 *
 * The principle: search in **descending precision** and stop as soon as we
 * have enough relevant matches. Each tier returns its own population count
 * (`total_count`) so the UI can show "Of 4,812 people who matched, here are
 * the top 8" — the honest answer to "from how many people are we searching?".
 *
 * Tier order (highest precision first):
 *
 *   T1 — Same recent employer + same role family → goal
 *   T2 — Same recent employer → goal
 *   T3 — Same school + same degree → goal
 *   T4 — Same school → goal
 *   T5 — Same metro + same role family → goal
 *   T6 — Broad goal title (last-resort fallback)
 *
 * IMPORTANT: company / role-family lookups use `experience.employment_details.*`
 * (NOT `.past.*`) so they match anyone who held the company/role at ANY point —
 * including people still currently at the company. Per CrustData docs, the
 * top-level path covers BOTH current and past employment rows. The goal-title
 * filter stays on `experience.employment_details.current.title` because we
 * specifically want people who have **reached** the goal, not just held it
 * once.
 *
 * Each profile we return is tagged with the tier that surfaced it, so the UI
 * can render an explainable "Found via: same college (IIIT Hyderabad)" badge.
 */

import type { Education, LinkedInProfile } from '@/lib/types';
import { sortEducationByRecency } from '@/lib/api/normalize-profile';
import {
  combineAnd,
  DEFAULT_SEARCH_FIELDS,
  geoDistance,
  mapV2PersonToLinkedInProfile,
  regexOne,
  searchPersonV2,
  type V2Filter,
} from '@/lib/api/crustdata-v2';
import {
  extractSchoolHintsFromProfile,
  goalTitleSearchVariants,
  schoolSearchVariants,
} from '@/lib/api/crustdata';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CascadeTierKey =
  | 'same_employer_role_to_goal'
  | 'same_employer_to_goal'
  | 'same_school_degree_to_goal'
  | 'same_school_to_goal'
  | 'same_metro_role_to_goal'
  | 'broad_goal';

export interface CascadeTierResult {
  tier: number;
  key: CascadeTierKey;
  /** Short human label, e.g. "Same company + same role" */
  label: string;
  /** Longer explanation for tooltips / search-stats panel */
  description: string;
  /** Sum of `total_count` across all sub-queries this tier ran */
  totalCount: number;
  /** Number of unique candidate profiles surfaced by this tier (after this-tier dedupe) */
  uniqueCandidatesAdded: number;
  /** True if at least one sub-query returned rows */
  ran: boolean;
  /** True if we executed any sub-query for this tier (false = skipped by early-stop) */
  attempted: boolean;
  /** Free-form notes for the search-stats panel ("Tried 2 schools × 3 spelling variants"). */
  notes: string[];
}

export interface CascadeProfileHit {
  profile: LinkedInProfile;
  tierKey: CascadeTierKey;
  tier: number;
  tierLabel: string;
  tierDescription: string;
  /** Raw "via" string for the chip on the card, e.g. "Flipkart" or "IIIT Hyderabad". */
  viaLabel?: string;
}

export interface CascadeSearchResult {
  /** Per-tier diagnostic info, in priority order */
  tiers: CascadeTierResult[];
  /** Profiles in priority order (T1 first), deduped by linkedin URL */
  hits: CascadeProfileHit[];
  /** True if we stopped early because we hit `desiredCandidates`. */
  stoppedEarly: boolean;
  /** Diagnostic params actually used. */
  params: {
    desiredCandidates: number;
    perQueryLimit: number;
    schoolsConsidered: string[];
    employersConsidered: string[];
    goalVariants: string[];
    userRoleVariants: string[];
    metro?: string;
  };
}

export interface CascadeSearchOptions {
  /** Stop early once cumulative unique candidates reach this many. Default 12. */
  desiredCandidates?: number;
  /** Per CrustData call. Default 10 (max 100). */
  perQueryLimit?: number;
}

// ---------------------------------------------------------------------------
// Helpers — picking what to search on
// ---------------------------------------------------------------------------

function uniq<T>(arr: T[], key: (v: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const v of arr) {
    const k = key(v);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

/** Take the user's most recent (likely current) employer for tier 1/2 anchors. */
function pickRecentEmployers(user: LinkedInProfile, max = 2): string[] {
  const cur = (user.current_employers ?? [])
    .map((e) => e.name?.trim() ?? '')
    .filter(Boolean);
  const all = (user.all_employers ?? [])
    .map((e) => e.name?.trim() ?? '')
    .filter(Boolean);
  const merged = uniq([...cur, ...all], (s) => s.toLowerCase());
  return merged.slice(0, max);
}

/** Most recent education row (for the "same school" anchor). */
function pickTopSchool(user: LinkedInProfile): { school?: string; degree?: string } {
  const eduRaw = user.education_background ?? [];
  if (eduRaw.length === 0) {
    const hint = extractSchoolHintsFromProfile(user)[0];
    return { school: hint };
  }
  const sorted: Education[] = sortEducationByRecency(eduRaw);
  const top = sorted[0];
  return { school: top?.institute_name?.trim(), degree: top?.degree_name?.trim() };
}

/** Title strings to use as the user's "current role family" filter. */
function userRoleVariants(user: LinkedInProfile): string[] {
  const seed = user.current_title?.trim() || user.title?.trim() || user.headline?.trim() || '';
  if (!seed) return [];
  // Reuse the same de-leveling/canonicalization we use for goal titles —
  // "SDE III" should match anyone whose past title is "Software Engineer".
  return goalTitleSearchVariants(seed).slice(0, 5);
}

/** Pull out a clean city/metro string for geo_distance — prefer city over country. */
function pickUserMetro(user: LinkedInProfile): string | undefined {
  const raw = (user.region || user.location || '').trim();
  if (!raw) return undefined;
  const firstSeg = raw.split(',')[0]?.trim();
  return firstSeg || raw;
}

function escapeForRegex(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/** Build a multi-spelling regex value for a single school anchor. */
function schoolValueAlternation(school: string): string {
  const variants = schoolSearchVariants(school);
  return variants.map(escapeForRegex).join('|');
}

// ---------------------------------------------------------------------------
// Core: runCascadeSearch
// ---------------------------------------------------------------------------

const TIER_DEFS: Record<CascadeTierKey, { tier: number; label: string; description: string }> = {
  same_employer_role_to_goal: {
    tier: 1,
    label: 'Same company + same role',
    description: 'Worked at your current company in the same role family, now at the goal title.',
  },
  same_employer_to_goal: {
    tier: 2,
    label: 'Same company',
    description: 'Worked at your current company (any role), now at the goal title.',
  },
  same_school_degree_to_goal: {
    tier: 3,
    label: 'Same college + same degree',
    description: 'Same alma mater and the same degree as you, now at the goal title.',
  },
  same_school_to_goal: {
    tier: 4,
    label: 'Same college',
    description: 'Alumni of your most recent college, now at the goal title.',
  },
  same_metro_role_to_goal: {
    tier: 5,
    label: 'Same city + same role',
    description: 'Lives in your metro and was in your role family, now at the goal title.',
  },
  broad_goal: {
    tier: 6,
    label: 'Broad goal-title match',
    description: 'Anyone currently at the goal title — used only as a last-resort fallback.',
  },
};

function makeTier(key: CascadeTierKey): CascadeTierResult {
  const def = TIER_DEFS[key];
  return {
    key,
    tier: def.tier,
    label: def.label,
    description: def.description,
    totalCount: 0,
    uniqueCandidatesAdded: 0,
    ran: false,
    attempted: false,
    notes: [],
  };
}

export async function runCascadeSearch(
  user: LinkedInProfile,
  goalTitle: string,
  options: CascadeSearchOptions = {}
): Promise<CascadeSearchResult> {
  const desiredCandidates = options.desiredCandidates ?? 12;
  const perQueryLimit = Math.min(options.perQueryLimit ?? 10, 25);

  const goalVariants = goalTitleSearchVariants(goalTitle).slice(0, 5);
  const goalRegex = goalVariants.map(escapeForRegex).join('|');
  const goalCurrentClause = { field: 'experience.employment_details.current.title', type: '(.)' as const, value: goalRegex };

  const employers = pickRecentEmployers(user, 2);
  const top = pickTopSchool(user);
  const roleVariants = userRoleVariants(user);
  const roleRegex = roleVariants.map(escapeForRegex).join('|');
  const metro = pickUserMetro(user);

  const tiers: CascadeTierResult[] = [
    makeTier('same_employer_role_to_goal'),
    makeTier('same_employer_to_goal'),
    makeTier('same_school_degree_to_goal'),
    makeTier('same_school_to_goal'),
    makeTier('same_metro_role_to_goal'),
    makeTier('broad_goal'),
  ];

  const hits: CascadeProfileHit[] = [];
  const seen = new Set<string>();

  function addProfiles(
    profiles: ReturnType<typeof mapV2PersonToLinkedInProfile>[],
    tierKey: CascadeTierKey,
    viaLabel?: string
  ): number {
    const def = TIER_DEFS[tierKey];
    let added = 0;
    for (const p of profiles) {
      const key = (p.linkedin_profile_url || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      hits.push({
        profile: p,
        tierKey,
        tier: def.tier,
        tierLabel: def.label,
        tierDescription: def.description,
        viaLabel,
      });
      added++;
    }
    return added;
  }

  const stoppedEarlyAt = (): boolean => hits.length >= desiredCandidates;

  // ---------- T1: same employer + same role → goal ----------
  // Match company anywhere in employment history (current OR past), and the
  // user's role family anywhere in titles. Goal stays as current.title so we
  // only surface people who've actually reached the goal.
  if (employers.length && roleRegex && goalRegex) {
    const t = tiers[0]!;
    t.attempted = true;
    const t1Results = await Promise.all(
      employers.map(async (company) => {
        const filters: V2Filter = combineAnd([
          regexOne('experience.employment_details.company_name', company),
          { field: 'experience.employment_details.title', type: '(.)', value: roleRegex },
          goalCurrentClause,
        ]);
        const r = await searchPersonV2({ filters, fields: DEFAULT_SEARCH_FIELDS, limit: perQueryLimit });
        return { company, ...r };
      })
    );
    for (const r of t1Results) {
      t.totalCount += r.total_count || r.profiles.length;
      t.notes.push(`Company "${r.company}" → ${r.total_count} matches`);
      if (r.profiles.length > 0) t.ran = true;
      const added = addProfiles(
        r.profiles.map(mapV2PersonToLinkedInProfile),
        'same_employer_role_to_goal',
        r.company
      );
      t.uniqueCandidatesAdded += added;
      if (stoppedEarlyAt()) break;
    }
  }

  // ---------- T2: same employer → goal ----------
  // Same as T1 but without the role-family filter. Captures people who
  // pivoted from a different IC role (e.g. designer → PM) at the same company.
  if (!stoppedEarlyAt() && employers.length && goalRegex) {
    const t = tiers[1]!;
    t.attempted = true;
    const t2Results = await Promise.all(
      employers.map(async (company) => {
        const filters: V2Filter = combineAnd([
          regexOne('experience.employment_details.company_name', company),
          goalCurrentClause,
        ]);
        const r = await searchPersonV2({ filters, fields: DEFAULT_SEARCH_FIELDS, limit: perQueryLimit });
        return { company, ...r };
      })
    );
    for (const r of t2Results) {
      t.totalCount += r.total_count || r.profiles.length;
      t.notes.push(`Company "${r.company}" → ${r.total_count} matches`);
      if (r.profiles.length > 0) t.ran = true;
      const added = addProfiles(
        r.profiles.map(mapV2PersonToLinkedInProfile),
        'same_employer_to_goal',
        r.company
      );
      t.uniqueCandidatesAdded += added;
      if (stoppedEarlyAt()) break;
    }
  }

  // ---------- T3: same school + same degree → goal ----------
  if (!stoppedEarlyAt() && top.school && top.degree && goalRegex) {
    const t = tiers[2]!;
    t.attempted = true;
    const schoolValue = schoolValueAlternation(top.school);
    const filters: V2Filter = combineAnd([
      { field: 'education.schools.school', type: '(.)', value: schoolValue },
      regexOne('education.schools.degree', top.degree),
      goalCurrentClause,
    ]);
    const { profiles, total_count } = await searchPersonV2({
      filters,
      fields: DEFAULT_SEARCH_FIELDS,
      limit: perQueryLimit,
    });
    t.totalCount += total_count || profiles.length;
    t.notes.push(
      `School "${top.school}" + degree "${top.degree}" → ${total_count} matches`
    );
    if (profiles.length > 0) t.ran = true;
    const added = addProfiles(
      profiles.map(mapV2PersonToLinkedInProfile),
      'same_school_degree_to_goal',
      `${top.school} (${top.degree})`
    );
    t.uniqueCandidatesAdded += added;
  }

  // ---------- T4: same school → goal ----------
  if (!stoppedEarlyAt() && top.school && goalRegex) {
    const t = tiers[3]!;
    t.attempted = true;
    const schoolValue = schoolValueAlternation(top.school);
    const filters: V2Filter = combineAnd([
      { field: 'education.schools.school', type: '(.)', value: schoolValue },
      goalCurrentClause,
    ]);
    const { profiles, total_count } = await searchPersonV2({
      filters,
      fields: DEFAULT_SEARCH_FIELDS,
      limit: perQueryLimit,
    });
    t.totalCount += total_count || profiles.length;
    t.notes.push(`School "${top.school}" → ${total_count} matches`);
    if (profiles.length > 0) t.ran = true;
    const added = addProfiles(
      profiles.map(mapV2PersonToLinkedInProfile),
      'same_school_to_goal',
      top.school
    );
    t.uniqueCandidatesAdded += added;
  }

  // ---------- T5: same metro + same role family → goal ----------
  if (!stoppedEarlyAt() && metro && roleRegex && goalRegex) {
    const t = tiers[4]!;
    t.attempted = true;
    const filters: V2Filter = combineAnd([
      geoDistance('professional_network.location.raw', metro, 50, 'km'),
      { field: 'experience.employment_details.title', type: '(.)', value: roleRegex },
      goalCurrentClause,
    ]);
    const { profiles, total_count } = await searchPersonV2({
      filters,
      fields: DEFAULT_SEARCH_FIELDS,
      limit: perQueryLimit,
    });
    t.totalCount += total_count || profiles.length;
    t.notes.push(`Metro "${metro}" + role family → ${total_count} matches`);
    if (profiles.length > 0) t.ran = true;
    const added = addProfiles(
      profiles.map(mapV2PersonToLinkedInProfile),
      'same_metro_role_to_goal',
      metro
    );
    t.uniqueCandidatesAdded += added;
  }

  // ---------- T6: broad goal-title fallback ----------
  if (!stoppedEarlyAt() && goalRegex) {
    const t = tiers[5]!;
    t.attempted = true;
    const filters: V2Filter = goalCurrentClause;
    const { profiles, total_count } = await searchPersonV2({
      filters,
      fields: DEFAULT_SEARCH_FIELDS,
      limit: Math.max(perQueryLimit, 15),
    });
    t.totalCount += total_count || profiles.length;
    t.notes.push(`Broad goal title → ${total_count} matches`);
    if (profiles.length > 0) t.ran = true;
    const added = addProfiles(
      profiles.map(mapV2PersonToLinkedInProfile),
      'broad_goal',
      undefined
    );
    t.uniqueCandidatesAdded += added;
  }

  return {
    tiers,
    hits,
    stoppedEarly: hits.length >= desiredCandidates,
    params: {
      desiredCandidates,
      perQueryLimit,
      schoolsConsidered: top.school ? [top.school] : [],
      employersConsidered: employers,
      goalVariants,
      userRoleVariants: roleVariants,
      metro,
    },
  };
}

/** Used by the API route + UI search-stats. Pure helpers — no I/O. */
export function summarizeCascade(result: CascadeSearchResult): {
  totalPopulationCount: number;
  ranTiers: number;
  attemptedTiers: number;
  topTier?: CascadeTierResult;
} {
  let totalPopulationCount = 0;
  let ranTiers = 0;
  let attemptedTiers = 0;
  let topTier: CascadeTierResult | undefined;
  for (const t of result.tiers) {
    totalPopulationCount += t.totalCount;
    if (t.attempted) attemptedTiers++;
    if (t.ran) {
      ranTiers++;
      if (!topTier) topTier = t;
    }
  }
  return { totalPopulationCount, ranTiers, attemptedTiers, topTier };
}

