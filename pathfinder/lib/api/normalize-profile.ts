import type { Education, Employer, LinkedInProfile } from '@/lib/types';

/** Parse a best-effort year from CrustData date strings (ISO or "Jan 2024"). */
function yearFromEducationDate(s?: string): number {
  if (!s) return 0;
  const m = s.match(/(20\d{2}|19\d{2})/);
  return m ? parseInt(m[1]!, 10) : 0;
}

/**
 * Newest degrees first so anchors & UI prioritize M.Tech / recent school over old BE rows.
 * CrustData often returns education oldest-first, which hid IIIT-style rows behind UG diplomas.
 */
export function sortEducationByRecency(edu: Education[]): Education[] {
  return [...edu].sort((a, b) => {
    const ya = Math.max(yearFromEducationDate(a.end_date), yearFromEducationDate(a.start_date));
    const yb = Math.max(yearFromEducationDate(b.end_date), yearFromEducationDate(b.start_date));
    return yb - ya;
  });
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v == null) continue;
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
  }
  return '';
}

/** CrustData often returns domains as `["acme.com"]`. */
function stringOrFirstArray(v: unknown): string {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (Array.isArray(v) && v.length > 0) {
    const x = v[0];
    if (typeof x === 'string' && x.trim()) return x.trim();
    if (typeof x === 'number' && !Number.isNaN(x)) return String(x);
  }
  return '';
}

function nestedRecord(obj: Record<string, unknown>): Record<string, unknown> | null {
  for (const key of ['company', 'organization', 'org']) {
    const v = obj[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
  }
  return null;
}

export function companyNameFromLinkedInCompanyUrl(url: string): string {
  try {
    const m = url.match(/linkedin\.com\/company\/([^/?#]+)/i);
    if (m) {
      return decodeURIComponent(m[1].replace(/-/g, ' ')).replace(/\s+/g, ' ').trim();
    }
  } catch {
    /* ignore */
  }
  return '';
}

/** Last resort: any string field whose key looks like a company name. */
function guessCompanyFromRow(e: Record<string, unknown>): string {
  for (const [k, v] of Object.entries(e)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    const kl = k.toLowerCase();
    if (/(^|_)(employer|company|organization|org).*name$/.test(kl)) return v.trim();
    if (kl === 'employer_name' || kl === 'company_name') return v.trim();
  }
  return '';
}

/** CrustData sometimes omits typed keys; scan values for a LinkedIn company URL. */
function firstLinkedInCompanyUrlInRecord(e: Record<string, unknown>): string {
  for (const v of Object.values(e)) {
    if (typeof v === 'string' && /linkedin\.com\/company\//i.test(v)) {
      return v.trim();
    }
  }
  return '';
}

function companyIdFallback(e: Record<string, unknown>): string {
  const id =
    typeof e.company_id === 'number' && !Number.isNaN(e.company_id)
      ? e.company_id
      : typeof e.company_id === 'string' && e.company_id.trim()
        ? Number(e.company_id)
        : typeof e.employer_company_id === 'number'
          ? e.employer_company_id
          : undefined;
  if (id != null && !Number.isNaN(id)) return `Company (${id})`;
  return '';
}

function mergeEmployerPreferNonEmpty(a: Employer, b: Employer): Employer {
  return {
    name: (b.name?.trim() || a.name?.trim() || '') as string,
    title: (b.title?.trim() || a.title?.trim() || '') as string,
    start_date: b.start_date || a.start_date,
    end_date: b.end_date || a.end_date,
    duration_months: b.duration_months ?? a.duration_months,
    location: b.location || a.location,
    company_linkedin_profile_url: b.company_linkedin_profile_url || a.company_linkedin_profile_url,
    company_id: b.company_id ?? a.company_id,
    description: b.description || a.description,
    years_at_company_raw: b.years_at_company_raw ?? a.years_at_company_raw,
  };
}

/**
 * Single employer row (no recursion) — CrustData field names vary by endpoint.
 */
function normalizeEmployerFields(e: Record<string, unknown>): Employer {
  const nested = nestedRecord(e);

  let name = pickString(e, [
    'name',
    'employer_name',
    'company_name',
    'organization_name',
    'employer_company_name',
    'org_name',
    'company',
  ]);
  if (!name && typeof e.company === 'string') {
    name = e.company.trim();
  }
  if (!name && nested) {
    name = pickString(nested, ['name', 'employer_name', 'company_name', 'display_name']);
  }
  const domainStr =
    stringOrFirstArray(e.employer_company_website_domain) ||
    stringOrFirstArray(e.company_website_domain) ||
    stringOrFirstArray(e.company_domain);
  if (!name && domainStr) {
    name = domainStr.replace(/^www\./i, '').split('.')[0] || domainStr;
  }
  if (!name && typeof e.company_website_domain === 'string') {
    name = e.company_website_domain.replace(/^www\./i, '').trim();
  }
  if (!name && typeof e.company_linkedin_profile_url === 'string') {
    name = companyNameFromLinkedInCompanyUrl(e.company_linkedin_profile_url);
  }
  if (!name && typeof e.company_linkedin_url === 'string') {
    name = companyNameFromLinkedInCompanyUrl(e.company_linkedin_url);
  }
  if (!name && typeof e.employer_linkedin_url === 'string') {
    name = companyNameFromLinkedInCompanyUrl(e.employer_linkedin_url);
  }
  if (!name && nested) {
    const u = nested.company_linkedin_profile_url ?? nested.linkedin_profile_url;
    if (typeof u === 'string') name = companyNameFromLinkedInCompanyUrl(u);
  }
  if (!name) {
    name = guessCompanyFromRow(e);
  }
  if (!name) {
    const looseUrl = firstLinkedInCompanyUrlInRecord(e);
    if (looseUrl) name = companyNameFromLinkedInCompanyUrl(looseUrl);
  }
  if (!name) {
    name = companyIdFallback(e);
  }

  // (Intentionally silent on missing names — v2 search rows occasionally lack
  // company_name and we don't want to spam the dev console.)

  let title = pickString(e, [
    'title',
    'employee_title',
    'position',
    'job_title',
    'role',
    'designation',
    'job_title_raw',
    'standardized_title',
    'standardized_role',
  ]);
  if (!title && nested) {
    title = pickString(nested, ['title', 'employee_title', 'position', 'job_title', 'role', 'designation']);
  }
  if (!title && typeof e.headline === 'string') {
    title = e.headline.trim();
  }

  let start_date: string | undefined =
    typeof e.start_date === 'string'
      ? e.start_date
      : typeof e.started_on === 'string'
        ? e.started_on
        : typeof e.from === 'string'
          ? e.from
          : undefined;
  let end_date: string | undefined =
    typeof e.end_date === 'string'
      ? e.end_date
      : typeof e.ended_on === 'string'
        ? e.ended_on
        : typeof e.to === 'string'
          ? e.to
          : undefined;

  let duration_months: number | undefined =
    typeof e.duration_months === 'number' ? e.duration_months : undefined;
  if (duration_months == null && typeof e.duration_months === 'string') {
    const n = parseInt(e.duration_months, 10);
    if (!Number.isNaN(n)) duration_months = n;
  }

  let years_at_company_raw: number | undefined =
    typeof e.years_at_company_raw === 'number' ? e.years_at_company_raw : undefined;
  if (years_at_company_raw == null && typeof e.years_at_company_raw === 'string') {
    const y = parseFloat(e.years_at_company_raw);
    if (!Number.isNaN(y)) years_at_company_raw = y;
  }

  if (duration_months == null && years_at_company_raw != null) {
    duration_months = Math.round(years_at_company_raw * 12);
  }

  const company_linkedin_profile_url =
    typeof e.company_linkedin_profile_url === 'string'
      ? e.company_linkedin_profile_url
      : typeof e.company_linkedin_url === 'string'
        ? e.company_linkedin_url
        : undefined;

  return {
    name,
    title,
    start_date,
    end_date,
    duration_months,
    location:
      typeof e.location === 'string'
        ? e.location
        : typeof e.employee_location === 'string'
          ? e.employee_location
          : undefined,
    company_linkedin_profile_url,
    company_id: typeof e.company_id === 'number' ? e.company_id : undefined,
    description:
      typeof e.description === 'string'
        ? e.description
        : typeof e.employee_description === 'string'
          ? e.employee_description
          : undefined,
    years_at_company_raw,
  };
}

/**
 * CrustData uses many shapes (`employer_name`, nested `employer[]`, `employee_title`, etc.).
 */
export function normalizeEmployer(raw: unknown): Employer {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { name: '', title: '' };
  }
  const e = raw as Record<string, unknown>;

  let inner: Employer | null = null;
  if (Array.isArray(e.employer) && e.employer.length > 0) {
    const first = e.employer[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      inner = normalizeEmployerFields(first as Record<string, unknown>);
    }
  }

  const outer = normalizeEmployerFields(e);

  if (inner) {
    return mergeEmployerPreferNonEmpty(inner, outer);
  }
  return outer;
}

/** True if at least one row has a label, link, or date we can show on the timeline. */
function employersArrayHasUsefulRows(employers: Employer[]): boolean {
  return employers.some(
    (row) =>
      Boolean(row.name?.trim()) ||
      Boolean(row.title?.trim()) ||
      Boolean(row.company_linkedin_profile_url) ||
      Boolean(row.start_date?.trim() || row.end_date?.trim()) ||
      typeof row.duration_months === 'number' ||
      typeof row.years_at_company_raw === 'number'
  );
}

/** Company line in the UI — need a name, LinkedIn company URL, or numeric company id. */
function employersMissingCompanyNames(employers: Employer[]): boolean {
  if (employers.length === 0) return true;
  return employers.every(
    (row) =>
      !row.name?.trim() &&
      !row.company_linkedin_profile_url &&
      row.company_id == null
  );
}

/**
 * CrustData sometimes returns `all_employers` as empty { name, title } rows while
 * `past_employers` / `current_employers` still carry real data. Prefer the latter when needed.
 */
function buildEmployersFromCurrentAndPast(profile: LinkedInProfile): Employer[] {
  const past = (profile.past_employers ?? []).map(normalizeEmployer);
  const cur = (profile.current_employers ?? []).map(normalizeEmployer);
  return [...past, ...cur];
}

/** When CrustData returns parallel `all_titles`, align titles to employer rows. */
function applyAllTitlesToEmployers(profile: LinkedInProfile): LinkedInProfile {
  const titles = profile.all_titles;
  if (!titles?.length) return profile;
  const employers = profile.all_employers ?? [];
  if (!employers.length) return profile;

  const merged = employers.map((emp, i) => {
    const t = emp.title?.trim();
    const fromArray = titles[i]?.trim();
    const title = t || fromArray || emp.title;
    return { ...emp, title };
  });

  return { ...profile, all_employers: merged };
}

export function hasEmployerHistory(profile: LinkedInProfile): boolean {
  const a = profile.all_employers?.length ?? 0;
  const c = profile.current_employers?.length ?? 0;
  const p = profile.past_employers?.length ?? 0;
  return a + c + p > 0;
}

/**
 * Ensure `all_employers` is populated for UI + scoring when only current/past arrays exist.
 */
export function normalizeLinkedInProfile(profile: LinkedInProfile): LinkedInProfile {
  let all = (profile.all_employers ?? []).map(normalizeEmployer);
  const fromParts = buildEmployersFromCurrentAndPast(profile);

  if (all.length === 0) {
    all = fromParts;
  } else if (!employersArrayHasUsefulRows(all) && employersArrayHasUsefulRows(fromParts)) {
    all = fromParts;
  } else if (
    all.length === fromParts.length &&
    fromParts.length > 0 &&
    employersArrayHasUsefulRows(fromParts) &&
    employersMissingCompanyNames(all)
  ) {
    // Prefer fields from `all_employers` when set; fill gaps from past/current (mergeEmployerPreferNonEmpty: b wins).
    all = all.map((row, i) => mergeEmployerPreferNonEmpty(fromParts[i]!, row));
  }

  if (!employersArrayHasUsefulRows(all) && (profile.current_company || profile.current_title || profile.title)) {
    all = [
      {
        name: profile.current_company?.trim() || '',
        title: profile.current_title?.trim() || profile.title?.trim() || '',
      },
    ];
  }

  const eduRaw = profile.education_background;
  const education_background =
    eduRaw && eduRaw.length > 0 ? sortEducationByRecency(eduRaw) : eduRaw;

  let next: LinkedInProfile = {
    ...profile,
    all_employers: all,
    current_employers: (profile.current_employers ?? []).map(normalizeEmployer),
    past_employers: (profile.past_employers ?? []).map(normalizeEmployer),
    education_background,
  };

  next = applyAllTitlesToEmployers(next);
  return next;
}
