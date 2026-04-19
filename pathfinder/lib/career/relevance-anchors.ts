/**
 * Relevance anchors — concrete overlaps between user and candidate.
 *
 * The goal is the user's gut-feel test: "this person was once in my shoes
 * because we [went to the same college / both worked at FAANG / both started
 * as engineers / are both in Bangalore]." If we can't honestly state ONE such
 * sentence, the candidate shouldn't be in the results — no matter how high
 * their path-similarity score is.
 *
 * `relevanceAnchors(user, candidate)` returns every applicable anchor.
 * Callers can:
 *   - drop candidates with zero anchors (hard floor for "in our shoes")
 *   - render the labels as chips on the result card
 *   - sum strengths into the combined ranking score
 */

import type { Education, Employer, LinkedInProfile, RelevanceAnchor } from '@/lib/types';
import { companyTier, tierDistance, tierLabel, type CompanyTier } from '@/lib/career/company-tier';
import { locationsLikelySameRegion, regionAnchorLabel } from '@/lib/geo/location';

// ---------- normalization helpers (mirrors affinity.ts to avoid coupling) ----------

function norm(s?: string | null): string {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normCompany(name?: string | null): string {
  return norm(name)
    .replace(
      /\b(the|inc|inc\.|llc|ltd|ltd\.|co|co\.|company|corp|corporation|technologies|tech|services|labs|software|solutions|holdings|gmbh|pvt|private|limited)\b/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function normInstitute(name?: string | null): string {
  return norm(name)
    .replace(
      /\b(the|university|college|institute|of|technology|technological|sciences?|school|academy|polytechnic)\b/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(s.split(' ').filter((t) => t.length > 1));
}

function sameish(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) && b.length >= 3) return true;
  if (b.includes(a) && a.length >= 3) return true;
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return false;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  if (shared < 2 && Math.max(ta.size, tb.size) > 1) return false;
  const jacc = shared / (ta.size + tb.size - shared);
  return jacc >= 0.6;
}

// ---------- school tier (mirrors affinity.ts) ----------

const SCHOOL_TIERS: { id: string; label: string; patterns: RegExp[] }[] = [
  { id: 'iit', label: 'IIT system', patterns: [/\biit[\s.,-]/i, /indian\s+institute\s+of\s+technology/i] },
  { id: 'iim', label: 'IIM system', patterns: [/\biim[\s.,-]/i, /indian\s+institute\s+of\s+management/i] },
  { id: 'nit', label: 'NIT system', patterns: [/\bnit[\s.,-]/i, /national\s+institute\s+of\s+technology/i] },
  { id: 'iiit', label: 'IIIT system', patterns: [/\biiit[\s.,-]/i] },
  { id: 'isb', label: 'ISB', patterns: [/\bisb\b/i, /indian\s+school\s+of\s+business/i] },
  { id: 'bits', label: 'BITS Pilani system', patterns: [/\bbits\s+pilani\b/i] },
  { id: 'ivy', label: 'Ivy League', patterns: [/\b(harvard|yale|princeton|columbia|cornell|dartmouth|brown|u\.?\s?penn|university\s+of\s+pennsylvania)\b/i] },
  { id: 'top_us', label: 'Top US tech', patterns: [/\b(mit|stanford|carnegie\s+mellon|cmu|berkeley|caltech|georgia\s+tech|umich|university\s+of\s+michigan|university\s+of\s+washington|ucla)\b/i] },
  { id: 'top_uk', label: 'Oxbridge / top UK', patterns: [/\b(oxford|cambridge|imperial\s+college|lse|london\s+school\s+of\s+economics|ucl)\b/i] },
];

function schoolTier(name?: string | null): { id: string; label: string } | null {
  if (!name) return null;
  for (const t of SCHOOL_TIERS) {
    if (t.patterns.some((re) => re.test(name))) return { id: t.id, label: t.label };
  }
  return null;
}

// ---------- degree level (mirrors affinity.ts) ----------

type DegreeLevel = 'high_school' | 'associate' | 'bachelor' | 'master' | 'mba' | 'phd' | 'other';

function degreeLevel(degree?: string | null): DegreeLevel {
  const d = norm(degree);
  if (!d) return 'other';
  if (/(phd|ph\.d|doctor|doctorate)/.test(d)) return 'phd';
  if (/(mba|master\s+of\s+business)/.test(d)) return 'mba';
  if (/(master|m\.tech|m\.s|msc|mca|m\.eng|m\.a)/.test(d)) return 'master';
  if (/(bachelor|b\.tech|b\.e\b|b\.s|bsc|bca|b\.eng|b\.a)/.test(d)) return 'bachelor';
  if (/(associate|diploma)/.test(d)) return 'associate';
  if (/(high\s+school|secondary)/.test(d)) return 'high_school';
  return 'other';
}

// ---------- role family (mirrors affinity.ts) ----------

const ROLE_FAMILIES: { id: string; pattern: RegExp; label: string }[] = [
  { id: 'engineering', pattern: /(software|swe|sde|developer|engineer|engineering|backend|frontend|fullstack|full.stack|mobile|ios|android|devops|sre|platform|infra)/i, label: 'engineering' },
  { id: 'data', pattern: /(data\s+scientist|data\s+engineer|machine\s+learning|ml\s+engineer|ai\s+engineer|analytics|statistician|quant)/i, label: 'data/ML' },
  { id: 'product', pattern: /(product\s+manager|product\s+management|\bpm\b|product\s+lead|product\s+owner|product\s+marketing|technical\s+pm|chief\s+product)/i, label: 'product' },
  { id: 'design', pattern: /(designer|design|ux|ui\s+designer|product\s+designer|creative)/i, label: 'design' },
  { id: 'em', pattern: /(engineering\s+manager|head\s+of\s+engineering|director\s+of\s+engineering|vp\s+of\s+engineering|cto|chief\s+technology)/i, label: 'engineering leadership' },
  { id: 'sales', pattern: /(sales|account\s+executive|account\s+manager|business\s+development|bdr|sdr)/i, label: 'sales' },
  { id: 'marketing', pattern: /(marketing|growth|brand|content)/i, label: 'marketing' },
  { id: 'consulting', pattern: /(consultant|consulting|associate|analyst.*consult)/i, label: 'consulting' },
  { id: 'finance', pattern: /(investment|banker|trader|equity|finance|cfo|controller|treasurer)/i, label: 'finance' },
];

function roleFamily(title?: string | null): { id: string; label: string } | null {
  if (!title) return null;
  for (const r of ROLE_FAMILIES) if (r.pattern.test(title)) return { id: r.id, label: r.label };
  return null;
}

function userLatestTitle(user: LinkedInProfile): string {
  return [user.current_title, user.title, user.headline].filter(Boolean).join(' ');
}

// ---------- main API ----------

export function relevanceAnchors(
  user: LinkedInProfile,
  candidate: LinkedInProfile
): RelevanceAnchor[] {
  const out: RelevanceAnchor[] = [];

  // 1) Same exact employer (any time in either career).
  const sameEmp = findSameEmployer(user.all_employers, candidate.all_employers);
  if (sameEmp) {
    out.push({
      kind: 'same_employer',
      label: `Both worked at ${sameEmp}`,
      strength: 90,
    });
  }

  // 2) Same employer TIER. Only fires if no exact-employer match — otherwise
  //    the chip would be redundant.
  if (!sameEmp) {
    const tier = sharedSignificantTier(user.all_employers, candidate.all_employers);
    if (tier) {
      out.push({
        kind: 'employer_tier',
        label: `Both spent time at ${tierLabel(tier)}`,
        strength: 55,
      });
    }
  }

  // 3) Starting tier — their first job tier matches the user's first job tier.
  //    This is the "started in similar shoes" signal.
  const startMatch = startingTierMatch(user, candidate);
  if (startMatch) {
    out.push({
      kind: 'starting_tier',
      label: `Both started at ${tierLabel(startMatch)}`,
      strength: 60,
    });
  }

  // 4) Same school (specific institute name).
  const sameSchool = findSameSchool(user.education_background, candidate.education_background);
  if (sameSchool) {
    out.push({
      kind: 'same_school',
      label: `Same school: ${sameSchool.label}${sameSchool.level ? ` (${sameSchool.level})` : ''}`,
      strength: 85,
    });
  }

  // 5) Same school TIER + same degree level (e.g. both did B.Tech at IIT).
  if (!sameSchool) {
    const tierLevel = sharedSchoolTierAtLevel(
      user.education_background,
      candidate.education_background
    );
    if (tierLevel) {
      out.push({
        kind: 'school_tier_level',
        label: `Both did ${tierLevel.level} from ${tierLevel.tierLabel}`,
        strength: 55,
      });
    }
  }

  // 6) Same field at same degree level (CS B.Tech == CS B.Tech).
  const fieldLevel = sharedFieldAtLevel(user.education_background, candidate.education_background);
  if (fieldLevel) {
    out.push({
      kind: 'field_at_level',
      label: `Both studied ${fieldLevel.field} (${fieldLevel.level})`,
      strength: 35,
    });
  }

  // 7) Same role family — user's CURRENT role vs candidate's EARLY roles.
  //    "I'm an engineer; they were once an engineer."
  const userFam = roleFamily(userLatestTitle(user));
  const earlyTitles = (candidate.all_employers ?? []).slice(0, 3).map((e) => e.title || '').join(' ');
  const earlyFam = roleFamily(earlyTitles);
  if (userFam && earlyFam && userFam.id === earlyFam.id) {
    out.push({
      kind: 'role_family',
      label: `Both started in ${earlyFam.label}`,
      strength: 50,
    });
  }

  // 8) Same region / city.
  const userRegion = user.region || user.location || '';
  const candRegion = candidate.region || candidate.location || '';
  if (userRegion && candRegion && locationsLikelySameRegion(userRegion, candRegion)) {
    out.push({
      kind: 'same_region',
      label: regionAnchorLabel(userRegion, candRegion),
      strength: 30,
    });
  }

  return out;
}

/**
 * Primary ranking key: explicit priority — same institute (school/college) → similar
 * college tier/field → overlapping occupation (role family) → same company.
 * Higher = show first. Add small fractional from anchor.strength for ties.
 */
export function anchorTierSortScore(user: LinkedInProfile, candidate: LinkedInProfile): number {
  const anchors = relevanceAnchors(user, candidate);
  let score = 0;
  for (const a of anchors) {
    switch (a.kind) {
      case 'same_school':
        score += 100_000_000;
        break;
      case 'school_tier_level':
        score += 10_000_000;
        break;
      case 'field_at_level':
        score += 1_000_000;
        break;
      case 'role_family':
        score += 100_000;
        break;
      case 'same_employer':
        score += 10_000;
        break;
      case 'employer_tier':
        score += 5_000;
        break;
      case 'starting_tier':
        score += 500;
        break;
      case 'same_region':
        score += 50;
        break;
      default:
        break;
    }
    score += (a.strength ?? 0) / 10_000;
  }
  return score;
}

/** True if the candidate has at least one strong "we once shared this" anchor. */
export function hasMeaningfulOverlap(
  user: LinkedInProfile,
  candidate: LinkedInProfile
): boolean {
  return relevanceAnchors(user, candidate).length > 0;
}

// ---------- internal sub-checks ----------

function findSameEmployer(
  userJobs?: Employer[] | null,
  candJobs?: Employer[] | null
): string | null {
  const u = userJobs ?? [];
  const c = candJobs ?? [];
  for (const uj of u) {
    const un = normCompany(uj.name);
    if (!un) continue;
    for (const cj of c) {
      const cn = normCompany(cj.name);
      if (!cn) continue;
      if (sameish(un, cn)) {
        // Prefer the prettier of the two display names.
        return cj.name || uj.name || un;
      }
    }
  }
  return null;
}

function sharedSignificantTier(
  userJobs?: Employer[] | null,
  candJobs?: Employer[] | null
): CompanyTier | null {
  const significant: CompanyTier[] = ['tier_1_elite', 'tier_2_top', 'tier_3_unicorn', 'tier_5_services'];
  const userTiers = new Set<CompanyTier>();
  for (const e of userJobs ?? []) userTiers.add(companyTier(e.name));
  for (const e of candJobs ?? []) {
    const t = companyTier(e.name);
    if (significant.includes(t) && userTiers.has(t)) return t;
  }
  return null;
}

function startingTierMatch(user: LinkedInProfile, candidate: LinkedInProfile): CompanyTier | null {
  const uFirst = (user.all_employers ?? [])[0];
  const cFirst = (candidate.all_employers ?? [])[0];
  if (!uFirst || !cFirst) return null;
  const ut = companyTier(uFirst.name);
  const ct = companyTier(cFirst.name);
  if (ut === 'tier_other' || ct === 'tier_other') return null;
  if (tierDistance(ut, ct) === 0) return ut;
  return null;
}

/** Stopwords removed for token overlap — avoids "Institute of Technology" matching two different schools. */
const INSTITUTE_STOPWORDS = new Set([
  'the',
  'of',
  'and',
  'for',
  'in',
  'at',
  'institute',
  'university',
  'college',
  'school',
  'national',
  'indian',
  'international',
  'deemed',
  'sciences',
  'technology',
  'technological',
]);

function instituteDistinctiveTokens(s: string): Set<string> {
  return new Set(
    s
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && !INSTITUTE_STOPWORDS.has(t))
  );
}

/**
 * Stricter than generic `sameish`: needs exact normalized institute line, substring
 * of a long name, or ≥2 overlapping distinctive tokens with decent Jaccard.
 */
function institutesAligned(un: string, cn: string): boolean {
  if (!un || !cn) return false;
  if (un === cn) return true;
  if (un.length >= 12 && cn.length >= 12 && (un.includes(cn) || cn.includes(un))) return true;

  const tu = instituteDistinctiveTokens(un);
  const tv = instituteDistinctiveTokens(cn);
  if (tu.size === 0 || tv.size === 0) return false;
  if (tu.size === 1 && tv.size === 1 && [...tu][0] === [...tv][0]) return true;

  let shared = 0;
  for (const t of tu) if (tv.has(t)) shared++;
  if (shared < 2) return false;
  const union = tu.size + tv.size - shared;
  return union > 0 && shared / union >= 0.45;
}

function findSameSchool(
  userEdu?: Education[] | null,
  candEdu?: Education[] | null
): { label: string; level: string | null } | null {
  for (const u of userEdu ?? []) {
    const rawU = norm(u.institute_name || '');
    for (const c of candEdu ?? []) {
      const rawC = norm(c.institute_name || '');
      if (rawU.length >= 10 && rawC.length >= 10 && rawU === rawC) {
        const uLvl = degreeLevel(u.degree_name);
        const cLvl = degreeLevel(c.degree_name);
        const sameLevel = uLvl !== 'other' && uLvl === cLvl;
        return {
          label: u.institute_name || c.institute_name || rawU,
          level: sameLevel ? prettyLevel(uLvl) : null,
        };
      }

      const un = normInstitute(u.institute_name);
      const cn = normInstitute(c.institute_name);
      if (!un || !cn) continue;
      if (!institutesAligned(un, cn)) continue;

      const uLvl = degreeLevel(u.degree_name);
      const cLvl = degreeLevel(c.degree_name);
      const sameLevel = uLvl !== 'other' && uLvl === cLvl;
      return {
        label: c.institute_name || u.institute_name || un,
        level: sameLevel ? prettyLevel(uLvl) : null,
      };
    }
  }
  return null;
}

function sharedSchoolTierAtLevel(
  userEdu?: Education[] | null,
  candEdu?: Education[] | null
): { tierLabel: string; level: string } | null {
  for (const u of userEdu ?? []) {
    const ut = schoolTier(u.institute_name);
    if (!ut) continue;
    const uLvl = degreeLevel(u.degree_name);
    if (uLvl === 'other') continue;
    for (const c of candEdu ?? []) {
      const ct = schoolTier(c.institute_name);
      if (!ct || ct.id !== ut.id) continue;
      const cLvl = degreeLevel(c.degree_name);
      if (cLvl === uLvl) {
        return { tierLabel: ct.label, level: prettyLevel(uLvl) };
      }
    }
  }
  return null;
}

function sharedFieldAtLevel(
  userEdu?: Education[] | null,
  candEdu?: Education[] | null
): { field: string; level: string } | null {
  for (const u of userEdu ?? []) {
    const uf = norm(u.field_of_study);
    if (!uf || uf.length < 3) continue;
    const uLvl = degreeLevel(u.degree_name);
    if (uLvl === 'other') continue;
    for (const c of candEdu ?? []) {
      const cf = norm(c.field_of_study);
      if (!cf || cf.length < 3) continue;
      if (degreeLevel(c.degree_name) !== uLvl) continue;
      if (sameish(uf, cf)) {
        return { field: c.field_of_study || u.field_of_study || uf, level: prettyLevel(uLvl) };
      }
    }
  }
  return null;
}

function prettyLevel(l: DegreeLevel): string {
  switch (l) {
    case 'bachelor':
      return 'Bachelors';
    case 'master':
      return 'Masters';
    case 'mba':
      return 'MBA';
    case 'phd':
      return 'PhD';
    case 'associate':
      return 'Associate';
    case 'high_school':
      return 'High School';
    default:
      return '';
  }
}

