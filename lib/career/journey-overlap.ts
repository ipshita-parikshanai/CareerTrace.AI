/**
 * Detect "this part of their journey overlaps with the user's" so the UI can
 * highlight matching items in the candidate's full timeline.
 *
 * STRICT MODE: only true same-as-you matches. We deliberately do NOT use the
 * fuzzy "role family" matcher here — calling someone's "Senior Technical Lead"
 * role "same as you" when you've only ever been a "Software Engineer II" is
 * misleading. We require:
 *
 *   - 'employer'   exact company name (after stripping Inc/LLC/Pvt/etc.)
 *   - 'school'     exact institution (using existing spelling variants)
 *   - 'degree'     same school AND same degree bucket (B.Tech / M.S. / MBA / …)
 *   - 'title'      exact job title (normalized: "SDE II" == "Software
 *                  Development Engineer II"), no level fuzzing.
 */
import type { Education, Employer, LinkedInProfile } from '@/lib/types';
import { schoolSearchVariants } from '@/lib/career/school-variants';

export type OverlapKind = 'employer' | 'school' | 'degree' | 'title';

export interface JourneyOverlap {
  kind: OverlapKind;
  /** Human label for the chip ("Same company", "Same school + degree", …). */
  label: string;
  /** What the user has that overlaps (for tooltip). */
  matchedUserValue: string;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function squash(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Strip very common company suffixes so "Atlassian" == "Atlassian, Inc.". */
function normalizeCompanyName(raw: string | undefined): string {
  if (!raw) return '';
  return squash(raw)
    .replace(
      /\b(inc|incorporated|llc|ltd|limited|gmbh|plc|corp|corporation|co|company|holdings?|sa|ag|nv|bv|pvt|private)\b\.?/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build the set of normalized variants we'll consider equivalent for a school. */
function schoolKeys(raw: string | undefined): Set<string> {
  const out = new Set<string>();
  if (!raw) return out;
  for (const v of schoolSearchVariants(raw)) {
    out.add(squash(v));
  }
  out.add(squash(raw));
  return out;
}

/** Coarse degree bucket so "B.Tech" matches "Bachelor of Technology". */
function degreeBucket(raw: string | undefined): string {
  if (!raw) return '';
  const t = squash(raw);
  if (/\b(phd|doctor|doctorate)\b/.test(t)) return 'phd';
  if (/\b(mba|master of business)\b/.test(t)) return 'mba';
  if (/\b(m\s*s|master|msc|m\s*tech|m\s*eng|mphil)\b/.test(t)) return 'masters';
  if (/\b(b\s*s|bachelor|bsc|b\s*tech|b\s*e|btech|beng|ba)\b/.test(t)) return 'bachelors';
  if (/\b(diploma|certificate|cert)\b/.test(t)) return 'cert';
  if (/\b(high school|secondary|hsc|ssc|class\s*\d{1,2})\b/.test(t)) return 'school';
  return t.slice(0, 20);
}

/** Title key for STRICT exact-title comparison. Expands the most common
 *  abbreviations only (SDE/SWE/Sr/Jr) — does NOT fuzz levels. */
function titleKey(raw: string | undefined): string {
  if (!raw) return '';
  return squash(raw)
    .replace(/\bsde\b/g, 'software development engineer')
    .replace(/\bswe\b/g, 'software engineer')
    .replace(/\bsr\b/g, 'senior')
    .replace(/\bjr\b/g, 'junior');
}

// ---------------------------------------------------------------------------
// Per-entry detectors
// ---------------------------------------------------------------------------

function userEmployerKeys(user: LinkedInProfile | null): Map<string, string> {
  const out = new Map<string, string>();
  if (!user) return out;
  const all = [
    ...(user.current_employers ?? []),
    ...(user.all_employers ?? []),
    ...(user.past_employers ?? []),
  ];
  for (const e of all) {
    const k = normalizeCompanyName(e.name);
    if (k && !out.has(k)) out.set(k, e.name);
  }
  return out;
}

function userSchoolEntries(user: LinkedInProfile | null): Education[] {
  if (!user) return [];
  const list = [...(user.education_background ?? [])];
  for (const s of user.all_schools ?? []) {
    if (!list.some((e) => squash(e.institute_name) === squash(s))) {
      list.push({ institute_name: s });
    }
  }
  return list;
}

/** Map of normalized title key → original-cased title (for tooltip). */
function userTitleKeys(user: LinkedInProfile | null): Map<string, string> {
  const out = new Map<string, string>();
  if (!user) return out;
  const push = (s?: string) => {
    if (!s || !s.trim()) return;
    const k = titleKey(s);
    if (k && !out.has(k)) out.set(k, s.trim());
  };
  push(user.current_title);
  push(user.title);
  for (const e of user.all_employers ?? []) push(e.title);
  for (const e of user.current_employers ?? []) push(e.title);
  for (const t of user.all_titles ?? []) push(t);
  return out;
}

/** Overlap between a single CANDIDATE work entry and the USER's profile.
 *  Strict — only same exact company OR same exact title. */
export function overlapForEmployer(
  job: Employer,
  user: LinkedInProfile | null
): JourneyOverlap | null {
  if (!user) return null;
  const compKey = normalizeCompanyName(job.name);
  if (compKey) {
    const map = userEmployerKeys(user);
    if (map.has(compKey)) {
      return {
        kind: 'employer',
        label: 'Same company as you',
        matchedUserValue: map.get(compKey) ?? job.name,
      };
    }
  }

  if (job.title?.trim()) {
    const k = titleKey(job.title);
    if (k) {
      const titles = userTitleKeys(user);
      if (titles.has(k)) {
        return {
          kind: 'title',
          label: 'Same title as you',
          matchedUserValue: titles.get(k) ?? job.title,
        };
      }
    }
  }

  return null;
}

/** Overlap between a single CANDIDATE education entry and the USER's profile. */
export function overlapForEducation(
  edu: Education,
  user: LinkedInProfile | null
): JourneyOverlap | null {
  if (!user) return null;
  const candKeys = schoolKeys(edu.institute_name);
  if (candKeys.size === 0) return null;

  for (const userEdu of userSchoolEntries(user)) {
    const uKeys = schoolKeys(userEdu.institute_name);
    let schoolMatch = false;
    for (const k of uKeys) {
      if (candKeys.has(k)) {
        schoolMatch = true;
        break;
      }
    }
    if (!schoolMatch) continue;

    const sameDegree =
      degreeBucket(edu.degree_name) &&
      degreeBucket(userEdu.degree_name) &&
      degreeBucket(edu.degree_name) === degreeBucket(userEdu.degree_name);

    if (sameDegree) {
      return {
        kind: 'degree',
        label: 'Same school + degree as you',
        matchedUserValue: `${userEdu.institute_name}${userEdu.degree_name ? ` · ${userEdu.degree_name}` : ''}`,
      };
    }
    return {
      kind: 'school',
      label: 'Same school as you',
      matchedUserValue: userEdu.institute_name,
    };
  }
  return null;
}

/** Total count of overlapping items across the candidate's whole timeline. */
export function countOverlaps(
  candidate: LinkedInProfile,
  user: LinkedInProfile | null
): number {
  if (!user) return 0;
  let n = 0;
  for (const j of candidate.all_employers ?? []) {
    if (overlapForEmployer(j, user)) n++;
  }
  for (const e of candidate.education_background ?? []) {
    if (overlapForEducation(e, user)) n++;
  }
  return n;
}
