/**
 * Semantic job-title normalization so wording differences don't break matching:
 * "Software Engineer III", "SDE III", "Senior Software Developer", "SWE 3" → same tier.
 */

function squash(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clipAtCompany(s: string): string {
  const i = s.search(/\s+at\s+[A-Z]/i);
  return i > 0 ? s.slice(0, i).trim() : s;
}

function expandAbbreviations(t: string): string {
  let s = t;
  s = s.replace(/\bsoftware\s+development\s+engineer\b/gi, 'software engineer');
  s = s.replace(/\bsoftware\s+dev\s+engineer\b/gi, 'software engineer');
  s = s.replace(/\bsoftware\s+developer\b/gi, 'software engineer');
  s = s.replace(/\bapplication\s+developer\b/gi, 'software engineer');
  s = s.replace(/\bfull\s*stack\s+developer\b/gi, 'full stack engineer');
  s = s.replace(/\bfront[\s-]?end\s+developer\b/gi, 'frontend engineer');
  s = s.replace(/\bback[\s-]?end\s+developer\b/gi, 'backend engineer');
  s = s.replace(/\bswe\b/gi, 'software engineer');
  s = s.replace(/\bsde\b/gi, 'software engineer');
  s = s.replace(/\bsr\.?\b/gi, 'senior');
  s = s.replace(/\bjr\.?\b/gi, 'junior');
  s = s.replace(/\bpm\b/gi, 'product manager');
  return s;
}

function romanToDigit(word: string): string | null {
  const w = word.toLowerCase();
  const map: Record<string, string> = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7' };
  return map[w] ?? null;
}

function normalizeLevels(t: string): string {
  let s = ` ${t} `;
  s = s.replace(/\b([ivx]{1,4})\b/gi, (m) => {
    const d = romanToDigit(m);
    return d ? ` ${d} ` : m;
  });
  return s.replace(/\s+/g, ' ').trim();
}

type TitleFamily =
  | 'swe'
  | 'fullstack'
  | 'frontend'
  | 'backend'
  | 'pm'
  | 'ds'
  | 'em'
  | 'design'
  | 'other';

type TitleBand = 'low' | 'mid' | 'high' | 'any';

function detectFamily(t: string): TitleFamily {
  if (/\bproduct\s+manager\b|\bproduct\s+owner\b/.test(t)) return 'pm';
  if (/\bdata\s+scientist\b|\bmachine\s+learning\s+engineer\b|\bml\s+engineer\b/.test(t)) return 'ds';
  if (/\bengineering\s+manager\b|\beng(?:ineering)?\s+manager\b|\bvp\s+engineering\b|\bhead\s+of\s+engineering\b/.test(t))
    return 'em';
  if (/\bux\s+designer\b|\bproduct\s+designer\b/.test(t)) return 'design';
  if (/\bfull[\s-]?stack\b/.test(t)) return 'fullstack';
  if (/\bfront[\s-]?end\b/.test(t)) return 'frontend';
  if (/\bback[\s-]?end\b/.test(t)) return 'backend';
  if (/\bsoftware\s+engineer\b/.test(t) || /\bdeveloper\b/.test(t) || /\bprogrammer\b/.test(t)) return 'swe';
  return 'other';
}

function sweLikeBand(t: string): TitleBand {
  if (
    /\b(senior|staff|principal|distinguished|fellow|architect)\b/.test(t) ||
    /\blead\s+(software|engineer|developer|fullstack)\b/.test(t)
  )
    return 'high';
  if (/\b(maintenance|junior|intern|graduate|trainee)\b/.test(t)) return 'low';
  const maxN = (() => {
    const nums = t.match(/\b([1-9])\b/g);
    if (!nums?.length) return 0;
    return Math.max(...nums.map((x) => parseInt(x, 10)));
  })();
  if (maxN >= 3) return 'high';
  if (maxN === 2) return 'mid';
  if (maxN === 1) return 'low';
  if (/\b(iii|iv|v|vi|vii)\b/.test(t)) return 'high';
  if (/\b(ii)\b/.test(t)) return 'mid';
  return 'mid';
}

/** User typed a role without level (matches any SWE/FE/BE tier for "reached goal"). */
function isGenericEngineeringIcGoal(t: string): boolean {
  const fam = detectFamily(t);
  if (fam !== 'swe' && fam !== 'fullstack' && fam !== 'frontend' && fam !== 'backend') return false;
  return (
    !/\b(senior|staff|principal|junior|intern|iii|ii|iv|architect|lead|sr)\b/.test(t) &&
    !/\b[2-9]\b/.test(t)
  );
}

function pmBand(t: string): TitleBand {
  if (/\b(group|principal|lead|staff|senior)\b/.test(t)) return 'high';
  if (/\b(associate|junior)\b/.test(t)) return 'low';
  return 'mid';
}

/**
 * Stable semantic key: same key ⇒ same role tier for matching.
 * `swe:any` = user typed a generic "Software Engineer" style goal (no level).
 */
export function jobTitleSemanticKey(raw: string): string {
  const t = normalizeLevels(expandAbbreviations(squash(clipAtCompany(raw))));
  if (!t) return 'other:';

  const fam = detectFamily(t);
  if (fam === 'pm') return `pm:${pmBand(t)}`;
  if (fam === 'ds') return 'ds:mid';
  if (fam === 'em') return 'em:mid';
  if (fam === 'design') return 'design:mid';
  if (fam === 'other') return `other:${t.slice(0, 40)}`;

  if (fam === 'swe' || fam === 'fullstack' || fam === 'frontend' || fam === 'backend') {
    if (isGenericEngineeringIcGoal(t)) return `${fam}:any`;
    const b = sweLikeBand(t);
    const prefix = fam === 'swe' ? 'swe' : fam;
    return `${prefix}:${b}`;
  }

  return `other:${t.slice(0, 40)}`;
}

export function jobTitlesSemanticallyMatch(a: string, b: string): boolean {
  const ka = jobTitleSemanticKey(a);
  const kb = jobTitleSemanticKey(b);
  if (ka === kb) return true;

  const [fa, ba] = ka.split(':');
  const [fb, bb] = kb.split(':');
  const eng = new Set(['swe', 'fullstack', 'frontend', 'backend']);

  if (eng.has(fa) && eng.has(fb)) {
    if (ba === 'any' || bb === 'any') return true;
    if (ba === bb) return true;
  }

  if (fa === fb && fa !== 'other') {
    if (ba === 'any' || bb === 'any') return true;
    if (fa === 'pm' && ba === bb) return true;
  }

  const g = normalizeLevels(expandAbbreviations(squash(clipAtCompany(a))));
  const p = normalizeLevels(expandAbbreviations(squash(clipAtCompany(b))));
  if (g.length >= 10 && p.length >= 10 && (p.includes(g) || g.includes(p))) return true;

  return false;
}

/**
 * Whether a profile's current title counts as "having reached" the user's goal.
 */
export function goalMatchesProfileTitle(goal: string, profileTitle: string): boolean {
  if (!goal?.trim() || !profileTitle?.trim()) return false;
  if (jobTitlesSemanticallyMatch(goal, profileTitle)) return true;

  const g = normalizeLevels(expandAbbreviations(squash(clipAtCompany(goal))));
  const p = normalizeLevels(expandAbbreviations(squash(clipAtCompany(profileTitle))));
  if (
    isGenericEngineeringIcGoal(g) &&
    (detectFamily(p) === 'swe' ||
      detectFamily(p) === 'fullstack' ||
      detectFamily(p) === 'frontend' ||
      detectFamily(p) === 'backend')
  )
    return true;

  return goalTitleSearchPhrases(goal).some(
    (phrase) => phrase.length >= 6 && p.toLowerCase().includes(phrase.toLowerCase())
  );
}

/** Extra PersonDB search phrases (merged with existing variants). */
export function goalTitleSearchPhrases(goal: string): string[] {
  const t = squash(clipAtCompany(goal));
  if (!t) return [];
  const out: string[] = [];
  const push = (s: string) => {
    const x = s.trim();
    if (x.length < 2 || out.some((o) => o.toLowerCase() === x.toLowerCase())) return;
    out.push(x);
  };

  const e = normalizeLevels(expandAbbreviations(t));
  const fam = detectFamily(e);

  if (fam === 'swe' || fam === 'fullstack' || fam === 'frontend' || fam === 'backend') {
    push('Software Engineer');
    push('Senior Software Engineer');
    push('Software Development Engineer');
    push('Senior Software Developer');
    if (sweLikeBand(e) === 'high') {
      push('Software Engineer III');
      push('SDE III');
      push('Software Development Engineer III');
      push('Staff Software Engineer');
    }
  }

  if (fam === 'pm') {
    push('Product Manager');
    push('Senior Product Manager');
  }

  push(t);
  return out;
}
