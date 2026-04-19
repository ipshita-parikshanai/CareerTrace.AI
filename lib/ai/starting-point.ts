import type { Employer, LinkedInProfile } from '@/lib/types';

function normalizeText(s: string | undefined): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set([
  'the',
  'a',
  'an',
  'at',
  'in',
  'of',
  'and',
  'or',
  'for',
  'to',
  'with',
  'on',
  'as',
  'senior',
  'junior',
  'lead',
  'principal',
  'staff',
  'ii',
  'iii',
  'i',
  'intern',
]);

export function tokenize(s: string): Set<string> {
  const n = normalizeText(s);
  return new Set(n.split(' ').filter((w) => w.length > 1 && !STOP.has(w)));
}

/** Coarse role family for transition vs “already on track” logic */
export function roleFamily(text: string): 'product' | 'engineering' | 'data' | 'design' | 'other' {
  const t = normalizeText(text);
  if (
    /\bproduct\s*(manager|mgmt|owner|lead)\b/.test(t) ||
    /\bapm\b/.test(t) ||
    /\bassociate\s+product\b/.test(t) ||
    /\b(group|vp|head)\s+product\b/.test(t)
  ) {
    return 'product';
  }
  if (
    /\b(software|backend|frontend|fullstack|full.stack)\b/.test(t) ||
    /\b(swe|sre|devops|ml|ai)\s*engineer\b/.test(t) ||
    /\bengineer\b/.test(t) ||
    /\bdeveloper\b/.test(t) ||
    /\bprogrammer\b/.test(t)
  ) {
    return 'engineering';
  }
  if (/\bdata\s*(scientist|analyst|engineer)\b/.test(t) || /\bbusiness\s*analyst\b/.test(t)) {
    return 'data';
  }
  if (/\bdesigner\b/.test(t) || /\bux\b/.test(t) || /\bui\b/.test(t)) {
    return 'design';
  }
  return 'other';
}

export function goalFamily(goalTitle: string): 'product' | 'engineering' | 'data' | 'design' | 'other' {
  return roleFamily(goalTitle);
}

export function latestJobLabel(profile: LinkedInProfile): string {
  return [profile.current_title, profile.title, profile.headline].filter(Boolean).join(' ');
}

/** Oldest roles first (CrustData / normalizer keep chronological order). */
export function earliestJobs(employers: Employer[] | undefined, n: number): Employer[] {
  if (!employers?.length) return [];
  return employers.slice(0, Math.min(n, employers.length));
}

/**
 * 0–100: user’s current situation vs candidate’s *early* roles (not their current title).
 */
export function scoreStartingPointOverlap(user: LinkedInProfile, candidate: LinkedInProfile): number {
  const uText = [
    user.current_title,
    user.title,
    user.headline,
    user.current_company,
  ]
    .filter(Boolean)
    .join(' ');
  const uTokens = tokenize(uText);
  const early = earliestJobs(candidate.all_employers, 3);
  const earlyText = early.map((e) => [e.title, e.name].filter(Boolean).join(' ')).join(' ');
  const cTokens = tokenize(earlyText);

  if (uTokens.size === 0 && cTokens.size === 0) return 32;
  if (uTokens.size === 0 || cTokens.size === 0) return 36;

  let inter = 0;
  for (const t of uTokens) {
    if (cTokens.has(t)) inter++;
  }
  const union = new Set([...uTokens, ...cTokens]).size;
  const jaccard = union > 0 ? inter / union : 0;

  const userFam = roleFamily(latestJobLabel(user));
  const earlyFam = roleFamily(early.map((e) => e.title || '').join(' '));

  let bucket = 0;
  if (userFam !== 'other' && userFam === earlyFam) bucket = 26;
  else if (userFam !== 'other' && earlyFam !== 'other' && userFam !== earlyFam) bucket = -8;

  const raw = 18 + jaccard * 95 + bucket;
  return Math.min(100, Math.max(15, Math.round(raw)));
}

/**
 * 0–100: school / degree / field overlap.
 */
export function scoreEducationOverlap(user: LinkedInProfile, candidate: LinkedInProfile): number {
  const ue = user.education_background ?? [];
  const ce = candidate.education_background ?? [];
  if (!ue.length || !ce.length) return 38;

  let best = 34;
  for (const u of ue) {
    const us = normalizeText(u.institute_name);
    const uf = normalizeText(u.field_of_study);
    const ud = normalizeText(u.degree_name);
    for (const c of ce) {
      const cs = normalizeText(c.institute_name);
      const cf = normalizeText(c.field_of_study);
      const cd = normalizeText(c.degree_name);
      if (us.length > 2 && cs.length > 2 && (us === cs || us.includes(cs) || cs.includes(us))) {
        best = Math.max(best, 96);
      }
      if (uf.length > 2 && cf.length > 2 && (uf === cf || uf.includes(cf) || cf.includes(uf))) {
        best = Math.max(best, 82);
      }
      if (ud.length > 2 && cd.length > 2 && (ud === cd || ud.includes(cd) || cd.includes(ud))) {
        best = Math.max(best, 72);
      }
    }
  }
  return Math.min(100, best);
}

/** 0–85 if any employer name overlaps (incl. current company). */
export function scoreSharedWorkplace(user: LinkedInProfile, candidate: LinkedInProfile): number {
  const names = [
    ...(user.all_employers ?? []).map((e) => normalizeText(e.name)),
    normalizeText(user.current_company),
  ].filter((s) => s && s.length > 2);

  const cand = (candidate.all_employers ?? []).map((e) => normalizeText(e.name)).filter((s) => s.length > 2);
  const set = new Set(cand);

  for (const a of names) {
    for (const b of set) {
      if (a === b || (a.length > 4 && (a.includes(b) || b.includes(a)))) return 82;
    }
  }
  return 0;
}

/**
 * Penalize people who *started* already in the goal profession (e.g. APM → PM) when the user is
 * trying to transition from another track (eng → PM). Returns 0–55 points to subtract.
 */
export function penaltyStartedInGoalTrack(
  user: LinkedInProfile,
  candidate: LinkedInProfile,
  goalTitle: string
): number {
  const g = goalFamily(goalTitle);
  const first = candidate.all_employers?.[0];
  if (!first?.title?.trim() || g === 'other') return 0;

  const startFam = roleFamily(first.title);
  if (startFam === 'other') return 0;

  const userFam = roleFamily(latestJobLabel(user));

  if (g === 'product' && startFam === 'product') {
    if (userFam === 'product') return 10;
    return 48;
  }
  // Engineering / data / design: promotion within the same craft is still a useful path story.
  if (g === 'engineering' || g === 'data' || g === 'design') {
    return 0;
  }
  return 0;
}

/**
 * Extra penalty if first two roles are both in goal family (career-long in-target track).
 */
export function penaltyEarlyGoalTrackLockin(candidate: LinkedInProfile, goalTitle: string): number {
  const g = goalFamily(goalTitle);
  if (g !== 'product') return 0;
  const e0 = candidate.all_employers?.[0];
  const e1 = candidate.all_employers?.[1];
  if (!e0?.title || !e1?.title) return 0;
  const f0 = roleFamily(e0.title);
  const f1 = roleFamily(e1.title);
  if (f0 === 'product' && f1 === 'product') return 20;
  return 0;
}

export function scoreSkillsOverlap(user: LinkedInProfile, candidate: LinkedInProfile): number {
  const userSkills = new Set((user.skills ?? []).map((s) => s.toLowerCase()));
  const cand = candidate.skills ?? [];
  let overlap = 0;
  for (const s of cand) {
    if (userSkills.has(s.toLowerCase())) overlap++;
  }
  return Math.min(95, 34 + overlap * 9);
}
