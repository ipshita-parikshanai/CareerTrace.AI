/**
 * High-level CrustData wrappers used by the rest of the app.
 *
 * As of 2026-04, all network calls go through the **v2 Person API**
 * (`/person/enrich` and `/person/search`) via `crustdata-v2.ts`. The legacy
 * `/screener/...` endpoints have been removed.
 *
 * Public surface (do not break — referenced from `route.ts`, similarity, etc.):
 *
 *   enrichLinkedInProfile, enrichLinkedInProfiles
 *   searchPeople, searchPeopleAdvanced
 *   searchPeopleForGoalRole, searchPeopleSharingAnchor (kept for back-compat;
 *     the cascade engine in `cascade-search.ts` is the new primary surface)
 *   goalTitleSearchVariants, schoolSearchVariants
 *   buildUserAnchors
 *   extractLinkedInSlug, isValidLinkedInUrl
 */

import type { LinkedInProfile } from '@/lib/types';
import { normalizeLinkedInProfile, sortEducationByRecency } from '@/lib/api/normalize-profile';
import { goalTitleSearchPhrases } from '@/lib/career/title-normalize';
import { schoolSearchVariants } from '@/lib/career/school-variants';
import {
  combineAnd,
  enrichPersonV2,
  mapV2PersonToLinkedInProfile,
  regexOne,
  searchPersonV2,
  type V2Condition,
  type V2Filter,
  DEFAULT_SEARCH_FIELDS,
} from '@/lib/api/crustdata-v2';

export { schoolSearchVariants };

if (!process.env.CRUSTDATA_API_KEY) {
  console.warn('CRUSTDATA_API_KEY is not set. CrustData calls will fail.');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Enrich (single + batch)
// ---------------------------------------------------------------------------

const ENRICH_FIELDS = [
  'basic_profile',
  'experience',
  'education',
  'skills',
  'social_handles',
  'professional_network',
];

export type EnrichLinkedInFailureReason =
  | 'not_in_index'
  | 'payment_required'
  | 'rate_limited'
  | 'error';

export type EnrichLinkedInResult =
  | { ok: true; profile: LinkedInProfile }
  | { ok: false; reason: EnrichLinkedInFailureReason; httpStatus: number };

/**
 * Enrich with explicit failure reason. Use this in API routes so you can
 * return **404** when CrustData has no row for that URL (not indexed) vs
 * **402** when billing/quota actually failed.
 */
export async function enrichLinkedInProfileResult(
  linkedinUrl: string,
  _realtimeEnrich: boolean = false
): Promise<EnrichLinkedInResult> {
  let lastHttpStatus = 200;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { entries, httpStatus } = await enrichPersonV2([linkedinUrl], { fields: ENRICH_FIELDS });
    lastHttpStatus = httpStatus;

    if (httpStatus === 402 || httpStatus === 401) {
      return { ok: false, reason: 'payment_required', httpStatus };
    }
    if (httpStatus === 429) {
      return { ok: false, reason: 'rate_limited', httpStatus };
    }
    if (httpStatus === 0) {
      return { ok: false, reason: 'error', httpStatus: 0 };
    }
    if (httpStatus !== 200) {
      return { ok: false, reason: 'error', httpStatus };
    }

    const match = entries[0]?.matches?.[0];
    if (match?.person_data) {
      const mapped = mapV2PersonToLinkedInProfile(match.person_data);
      if (!mapped.linkedin_profile_url) {
        mapped.linkedin_profile_url = linkedinUrl;
      }
      return { ok: true, profile: normalizeLinkedInProfile(mapped) };
    }

    if (attempt < maxAttempts) {
      await sleep(750 * attempt);
    }
  }

  if (lastHttpStatus === 200) {
    console.warn(`[crustdata] enrich: no profile match in index for ${linkedinUrl}`);
    return { ok: false, reason: 'not_in_index', httpStatus: 200 };
  }
  return { ok: false, reason: 'error', httpStatus: lastHttpStatus };
}

/**
 * Enrich a LinkedIn profile by URL. Returns null on any failure (legacy).
 * Prefer `enrichLinkedInProfileResult` when you need to distinguish quota vs not indexed.
 */
export async function enrichLinkedInProfile(
  linkedinUrl: string,
  _realtimeEnrich: boolean = false
): Promise<LinkedInProfile | null> {
  const r = await enrichLinkedInProfileResult(linkedinUrl, _realtimeEnrich);
  return r.ok ? r.profile : null;
}

/** Batch enrich (v2 supports up to 25 URLs per request). */
export async function enrichLinkedInProfiles(
  linkedinUrls: string[],
  _realtimeEnrich: boolean = false
): Promise<LinkedInProfile[]> {
  const urls = linkedinUrls.slice(0, 25);
  const { entries } = await enrichPersonV2(urls, { fields: ENRICH_FIELDS });
  const out: LinkedInProfile[] = [];
  for (const entry of entries) {
    const m = entry.matches?.[0]?.person_data;
    if (!m) continue;
    const mapped = mapV2PersonToLinkedInProfile(m);
    if (!mapped.linkedin_profile_url) {
      mapped.linkedin_profile_url = entry.matched_on;
    }
    out.push(normalizeLinkedInProfile(mapped));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Search (high-level + advanced)
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper for simple title / company / location filters.
 * Used by the legacy goal-role search; new code should use the cascade engine.
 */
export async function searchPeople(
  filters: {
    current_title?: string;
    current_company?: string;
    education?: string;
    location?: string;
    industry?: string;
    years_of_experience?: { min?: number; max?: number };
  },
  limit: number = 50
): Promise<LinkedInProfile[]> {
  const conds: V2Condition[] = [];
  if (filters.current_title) {
    conds.push(regexOne('experience.employment_details.current.title', filters.current_title));
  }
  if (filters.current_company) {
    conds.push(regexOne('experience.employment_details.current.company_name', filters.current_company));
  }
  if (filters.location) {
    conds.push(regexOne('basic_profile.location.full_location', filters.location));
  }
  if (filters.years_of_experience?.min != null) {
    conds.push({ field: 'years_of_experience_raw', type: '>=', value: filters.years_of_experience.min });
  }
  if (filters.years_of_experience?.max != null) {
    conds.push({ field: 'years_of_experience_raw', type: '<=', value: filters.years_of_experience.max });
  }
  if (conds.length === 0) return [];

  const { profiles } = await searchPersonV2({
    filters: combineAnd(conds),
    fields: DEFAULT_SEARCH_FIELDS,
    limit: Math.min(limit, 100),
  });
  return profiles.map(mapV2PersonToLinkedInProfile).map(normalizeLinkedInProfile);
}

/** Legacy filter-clause shape kept so older call sites keep compiling. */
export interface CrustDataFilterClause {
  column: string;
  type: '=' | '(.)' | '>=' | '<=' | 'in';
  value: string | number | string[];
}

export interface CrustDataSearchAdvancedResult {
  count: number;
  profiles: LinkedInProfile[];
}

/** Map our legacy `column` names to v2 dot paths. */
function legacyColumnToV2Field(column: string): string {
  const map: Record<string, string> = {
    'current_employers.title': 'experience.employment_details.current.title',
    'current_employers.name': 'experience.employment_details.current.company_name',
    'current_employers.company_name': 'experience.employment_details.current.company_name',
    'past_employers.name': 'experience.employment_details.past.company_name',
    'past_employers.company_name': 'experience.employment_details.past.company_name',
    'past_employers.title': 'experience.employment_details.past.title',
    'all_employers.name': 'experience.employment_details.company_name',
    'all_employers.title': 'experience.employment_details.title',
    'education_background.institute_name': 'education.schools.school',
    'education_background.degree_name': 'education.schools.degree',
    'education_background.field_of_study': 'education.schools.field_of_study',
    headline: 'basic_profile.headline',
    summary: 'basic_profile.summary',
    region: 'basic_profile.location.full_location',
    location: 'basic_profile.location.full_location',
    name: 'basic_profile.name',
    years_of_experience_raw: 'years_of_experience_raw',
  };
  return map[column] ?? column;
}

/**
 * Low-level filter-array search. Returns `{ count, profiles }` so callers can
 * surface the population stat alongside a few preview profiles.
 */
export async function searchPeopleAdvanced(
  filters: CrustDataFilterClause[],
  options: { limit?: number; previewLimit?: number } = {}
): Promise<CrustDataSearchAdvancedResult> {
  if (filters.length === 0) return { count: 0, profiles: [] };
  const { limit = 1, previewLimit = 4 } = options;

  const v2Conds: V2Condition[] = filters.map((f) => ({
    field: legacyColumnToV2Field(f.column),
    type: f.type,
    value: f.value,
  }));

  const fetchSize = Math.max(limit, previewLimit, 1);
  const { profiles, total_count } = await searchPersonV2({
    filters: combineAnd(v2Conds),
    fields: DEFAULT_SEARCH_FIELDS,
    limit: Math.min(fetchSize, 100),
  });

  const mapped = profiles
    .slice(0, previewLimit)
    .map(mapV2PersonToLinkedInProfile)
    .map(normalizeLinkedInProfile);

  return {
    count: total_count || profiles.length,
    profiles: mapped,
  };
}

// ---------------------------------------------------------------------------
// Goal-title and school search variants (used by route + cascade engine)
// ---------------------------------------------------------------------------

/**
 * Broader title strings to search PersonDB with — broad variants first so we
 * don't miss "Software Engineer III" matches when the user typed "SDE 3".
 */
export function goalTitleSearchVariants(goalTitle: string): string[] {
  const t = goalTitle.trim();
  if (!t) return [];
  const ordered: string[] = [];
  const push = (s: string) => {
    const x = s.trim();
    if (x.length < 2 || ordered.some((o) => o.toLowerCase() === x.toLowerCase())) return;
    ordered.push(x);
  };

  for (const phrase of goalTitleSearchPhrases(t)) {
    push(phrase);
  }

  const deLeveled = t
    .replace(
      /^(senior|staff|principal|lead|associate|junior|intern|vp|vice president|director|head of|chief|sr\.?|jr\.?|group|global)\s+/gi,
      ''
    )
    .replace(/\s+(i{1,3}|iv|v|vi{0,3}|ix|x|xi{0,3})\s*$/i, '')
    .replace(/\s+(i{1,3}|iv|v)\b\s*$/i, '')
    .trim();

  if (/software\s+engineer|full[\s-]?stack|swe\b|backend\s+engineer|frontend\s+engineer/i.test(t)) {
    push('Software Engineer');
  }
  if (/full[\s-]?stack/i.test(t)) {
    push('Full Stack Engineer');
  }
  if (/product\s+manager|product\s+owner/i.test(t)) {
    push('Product Manager');
  }
  if (/data\s+scientist/i.test(t)) {
    push('Data Scientist');
  }
  if (/engineering\s+manager|\beng\.?\s+manager/i.test(t)) {
    push('Engineering Manager');
  }

  if (deLeveled) push(deLeveled);

  const stripped = t
    .replace(
      /^(senior|staff|principal|lead|associate|junior|intern|vp|vice president|director|head of|chief|sr\.?|jr\.?|group|global)\s+/gi,
      ''
    )
    .trim();
  if (stripped) push(stripped);

  const beforeComma = t.split(',')[0]?.trim();
  if (beforeComma) push(beforeComma);

  const words = t.split(/[\s,]+/).filter((w) => w.length > 1);
  if (words.length >= 2) push(words.slice(-2).join(' '));
  if (words.length >= 3) push(words.slice(-3).join(' '));

  push(t);
  return ordered;
}

/** Headline/summary fallback when structured education is stale or missing. */
export function extractSchoolHintsFromProfile(user: LinkedInProfile): string[] {
  const text = [user.headline, user.summary].filter(Boolean).join('\n');
  if (!text.trim()) return [];
  const hints: string[] = [];
  const push = (s: string) => {
    const x = s.trim();
    if (x.length < 3 || hints.some((h) => h.toLowerCase() === x.toLowerCase())) return;
    hints.push(x);
  };

  const patterns: { re: RegExp; canonical: string }[] = [
    { re: /\bIIIT\s*[-]?\s*Hyderabad\b/i, canonical: 'IIIT Hyderabad' },
    { re: /\bIIIT\s*[-]?\s*H\b(?![a-z])/i, canonical: 'IIIT Hyderabad' },
    { re: /\bBITS\s+Pilani\b/i, canonical: 'BITS Pilani' },
    { re: /\bISB\b.*Hyderabad/i, canonical: 'Indian School of Business' },
  ];
  for (const { re, canonical } of patterns) {
    if (re.test(text)) push(canonical);
  }
  return hints;
}

// ---------------------------------------------------------------------------
// User anchors (kept for back-compat; cascade engine builds its own)
// ---------------------------------------------------------------------------

export type AnchorKind = 'school' | 'employer';

export interface UserAnchor {
  kind: AnchorKind;
  /** Stable id for telemetry / dedupe (lowercased) */
  id: string;
  /** Pretty label as it appeared on the user profile (for the chip / log) */
  label: string;
}

export interface AnchoredHit {
  profile: LinkedInProfile;
  via: UserAnchor;
}

function mergeSchoolNamesForAnchors(user: LinkedInProfile): string[] {
  const seen = new Set<string>();
  const push = (inst: string, list: string[]) => {
    const k = inst.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    list.push(inst);
  };

  const front: string[] = [];
  for (const h of extractSchoolHintsFromProfile(user)) {
    push(h, front);
  }

  const rest: string[] = [];
  const eduSorted = sortEducationByRecency(user.education_background ?? []);
  for (const e of eduSorted) {
    const inst = e.institute_name?.trim();
    if (inst) push(inst, rest);
  }
  for (const s of user.all_schools ?? []) {
    const t = s?.trim();
    if (t) push(t, rest);
  }
  return [...front, ...rest];
}

export function buildUserAnchors(
  user: LinkedInProfile,
  options?: { maxSchools?: number; maxEmployers?: number }
): UserAnchor[] {
  const maxSchools = options?.maxSchools ?? 6;
  const maxEmployers = options?.maxEmployers ?? 4;
  const out: UserAnchor[] = [];
  const seen = new Set<string>();

  const schoolNames = mergeSchoolNamesForAnchors(user);
  for (const inst of schoolNames.slice(0, maxSchools)) {
    const id = inst.toLowerCase();
    const key = `school:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: 'school', id, label: inst });
  }

  for (const emp of (user.all_employers ?? []).slice(0, maxEmployers)) {
    const name = emp?.name?.trim();
    if (!name) continue;
    const id = name.toLowerCase();
    const key = `employer:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: 'employer', id, label: name });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Legacy goal/anchor search (kept as fallbacks; cascade engine is preferred)
// ---------------------------------------------------------------------------

function dedupeProfilesByUrl(profiles: LinkedInProfile[]): LinkedInProfile[] {
  const seen = new Set<string>();
  const out: LinkedInProfile[] = [];
  for (const p of profiles) {
    const key = (p.linkedin_profile_url || p.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/**
 * Broad goal-title search across multiple title variants. Useful as a
 * last-resort fallback when the cascade returns too few matches.
 */
export async function searchPeopleForGoalRole(
  goalTitle: string,
  options: { goalCompany?: string; limit?: number } = {}
): Promise<LinkedInProfile[]> {
  const { goalCompany, limit = 30 } = options;
  const variants = goalTitleSearchVariants(goalTitle).slice(0, 4);
  if (variants.length === 0) return [];

  const titleClause: V2Condition = {
    field: 'experience.employment_details.current.title',
    type: '(.)',
    value: variants.map((v) => v.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join('|'),
  };

  const conds: V2Filter[] = [titleClause];
  if (goalCompany?.trim()) {
    conds.push(regexOne('experience.employment_details.current.company_name', goalCompany.trim()));
  }

  const { profiles } = await searchPersonV2({
    filters: combineAnd(conds),
    fields: DEFAULT_SEARCH_FIELDS,
    limit: Math.min(Math.max(limit, 10), 100),
  });

  return dedupeProfilesByUrl(profiles.map(mapV2PersonToLinkedInProfile).map(normalizeLinkedInProfile));
}

/**
 * Back-compat: per-anchor goal search. The new cascade engine in
 * `cascade-search.ts` is more precise; this is kept as a fallback path.
 */
export async function searchPeopleSharingAnchor(
  user: LinkedInProfile,
  goalTitle: string,
  options: { perAnchorLimit?: number; maxAnchors?: number } = {}
): Promise<AnchoredHit[]> {
  const goal = goalTitle.trim();
  if (!goal) return [];

  const anchors = buildUserAnchors(user).slice(0, options.maxAnchors ?? 6);
  if (anchors.length === 0) return [];

  const perAnchorLimit = Math.min(options.perAnchorLimit ?? 8, 25);
  const titleVariants = goalTitleSearchVariants(goal).slice(0, 5);
  const titleClause: V2Condition = {
    field: 'experience.employment_details.current.title',
    type: '(.)',
    value: titleVariants.map((v) => v.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join('|'),
  };

  const queries = anchors.map(async (a) => {
    const variants =
      a.kind === 'school' ? schoolSearchVariants(a.label).slice(0, 3) : [a.label];

    for (const anchorValue of variants) {
      const anchorClause: V2Condition =
        a.kind === 'school'
          ? regexOne('education.schools.school', anchorValue)
          : regexOne('experience.employment_details.company_name', anchorValue);

      const { profiles } = await searchPersonV2({
        filters: combineAnd([anchorClause, titleClause]),
        fields: DEFAULT_SEARCH_FIELDS,
        limit: perAnchorLimit,
      });
      if (profiles.length > 0) {
        return profiles.map((p) => ({
          profile: normalizeLinkedInProfile(mapV2PersonToLinkedInProfile(p)),
          via: a,
        }));
      }
    }
    return [] as AnchoredHit[];
  });

  const groups = await Promise.all(queries);
  const merged = groups.flat();

  const seen = new Set<string>();
  const out: AnchoredHit[] = [];
  for (const hit of merged) {
    const key = (hit.profile.linkedin_profile_url || hit.profile.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
  }
  return out;
}

// ---------------------------------------------------------------------------
// LinkedIn URL helpers
// ---------------------------------------------------------------------------

export function extractLinkedInSlug(url: string): string {
  try {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
}

export function isValidLinkedInUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
  return pattern.test(url);
}
