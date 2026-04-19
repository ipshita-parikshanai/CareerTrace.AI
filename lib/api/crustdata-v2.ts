/**
 * Thin client for CrustData v2 Person APIs.
 *
 *   POST /person/search       — structured filters (used by cascade-search)
 *   POST /person/enrich       — get full profile by URL or business email
 *
 * Auth: `Bearer YOUR_API_KEY` + required header `x-api-version: 2025-11-01`.
 *
 * We map the v2 response shape onto our existing internal `LinkedInProfile`
 * so the rest of the app (UI, scoring, anchors) keeps working without a
 * breaking refactor.
 */

import type { Education, Employer, LinkedInProfile } from '@/lib/types';

const CRUSTDATA_API_KEY = process.env.CRUSTDATA_API_KEY;
const CRUSTDATA_API_URL = process.env.CRUSTDATA_API_URL || 'https://api.crustdata.com';
const API_VERSION = '2025-11-01';

if (!CRUSTDATA_API_KEY) {
  console.warn('CRUSTDATA_API_KEY is not set. CrustData v2 calls will fail.');
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${CRUSTDATA_API_KEY ?? ''}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-version': API_VERSION,
  };
}

// ---------------------------------------------------------------------------
// Filter DSL (v2 shape)
// ---------------------------------------------------------------------------

export type V2Operator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'in'
  | 'not_in'
  | '(.)'
  | 'geo_distance'
  | 'contains';

export interface V2Condition {
  field: string;
  type: V2Operator;
  value: unknown;
}

export interface V2ConditionGroup {
  op: 'and' | 'or';
  conditions: V2Filter[];
}

export type V2Filter = V2Condition | V2ConditionGroup;

export interface V2SearchOptions {
  filters: V2Filter;
  fields?: string[];
  limit?: number;
  cursor?: string;
  sorts?: { field: string; order: 'asc' | 'desc' }[];
}

export interface V2SearchResponse {
  profiles: V2PersonRecord[];
  total_count: number;
  next_cursor: string | null;
}

export interface V2EnrichMatch {
  confidence_score?: number;
  person_data: V2PersonRecord;
}

export interface V2EnrichEntry {
  matched_on: string;
  match_type: string;
  matches: V2EnrichMatch[];
}

// ---------------------------------------------------------------------------
// V2 person record (subset of fields we read)
// ---------------------------------------------------------------------------

export interface V2EmploymentRow {
  /** Search response uses `name`. */
  name?: string;
  /** Enrich response uses `company_name`. */
  company_name?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  /** Search response: object `{ raw: "..." }`. Enrich response: string. */
  location?: string | { raw?: string } | null;
  seniority_level?: string;
  function_category?: string;
  years_at_company_raw?: number;
  /** Search response shape. */
  crustdata_company_id?: number | string;
  /** Enrich response shape. */
  company_id?: number | string;
  /** Search response shape. */
  company_professional_network_profile_url?: string;
  /** Enrich response shape. */
  company_linkedin_url?: string;
}

export interface V2SchoolRow {
  school?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
}

export interface V2PersonRecord {
  crustdata_person_id?: number;
  basic_profile?: {
    name?: string;
    first_name?: string;
    last_name?: string;
    headline?: string;
    summary?: string;
    current_title?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      full_location?: string;
      raw?: string;
    };
  };
  experience?: {
    employment_details?: {
      current?: V2EmploymentRow[];
      past?: V2EmploymentRow[];
    };
  };
  education?: {
    schools?: V2SchoolRow[];
  };
  skills?: {
    professional_network_skills?: string[];
  };
  social_handles?: {
    professional_network_identifier?: {
      profile_url?: string;
      slug?: string;
    };
  };
  professional_network?: {
    connections?: number;
    profile_picture_permalink?: string;
    location?: { raw?: string };
  };
}

// ---------------------------------------------------------------------------
// Field group we ask for on `/person/search` to keep payload small.
// ---------------------------------------------------------------------------

export const DEFAULT_SEARCH_FIELDS = [
  'crustdata_person_id',
  'basic_profile.name',
  'basic_profile.headline',
  'basic_profile.summary',
  'basic_profile.current_title',
  'basic_profile.location',
  'experience.employment_details.current',
  'experience.employment_details.past',
  'education.schools',
  'skills.professional_network_skills',
  'social_handles.professional_network_identifier.profile_url',
  'professional_network.profile_picture_permalink',
  'professional_network.location.raw',
];

// ---------------------------------------------------------------------------
// Low-level fetchers
// ---------------------------------------------------------------------------

export async function searchPersonV2(opts: V2SearchOptions): Promise<V2SearchResponse> {
  const body: Record<string, unknown> = {
    filters: opts.filters,
    limit: opts.limit ?? 25,
  };
  if (opts.fields?.length) body.fields = opts.fields;
  if (opts.cursor) body.cursor = opts.cursor;
  if (opts.sorts?.length) body.sorts = opts.sorts;

  try {
    const res = await fetch(`${CRUSTDATA_API_URL}/person/search`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(
        `[v2 search] HTTP ${res.status}: ${text.slice(0, 200)} | filters=${JSON.stringify(opts.filters).slice(0, 200)}`
      );
      return { profiles: [], total_count: 0, next_cursor: null };
    }

    const data = (await res.json()) as Partial<V2SearchResponse>;
    return {
      profiles: data.profiles ?? [],
      total_count: data.total_count ?? 0,
      next_cursor: data.next_cursor ?? null,
    };
  } catch (err) {
    console.warn('[v2 search] network/parse error:', err instanceof Error ? err.message : err);
    return { profiles: [], total_count: 0, next_cursor: null };
  }
}

export interface V2EnrichHttpResult {
  entries: V2EnrichEntry[];
  /** HTTP status from CrustData (use to tell payment vs “not in index”). */
  httpStatus: number;
}

export async function enrichPersonV2(
  linkedinUrls: string[],
  options: { fields?: string[] } = {}
): Promise<V2EnrichHttpResult> {
  const urls = linkedinUrls.filter((u) => typeof u === 'string' && u.trim()).slice(0, 25);
  if (urls.length === 0) return { entries: [], httpStatus: 0 };

  const body: Record<string, unknown> = {
    professional_network_profile_urls: urls,
  };
  if (options.fields?.length) body.fields = options.fields;

  try {
    const res = await fetch(`${CRUSTDATA_API_URL}/person/enrich`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      console.warn('[v2 enrich] rate limited');
      return { entries: [], httpStatus: 429 };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[v2 enrich] HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { entries: [], httpStatus: res.status };
    }

    const data = (await res.json()) as V2EnrichEntry[];
    const entries = Array.isArray(data) ? data : [];
    return { entries, httpStatus: res.status };
  } catch (err) {
    console.warn('[v2 enrich] network/parse error:', err instanceof Error ? err.message : err);
    return { entries: [], httpStatus: 0 };
  }
}

// ---------------------------------------------------------------------------
// V2 → internal LinkedInProfile mapper
// ---------------------------------------------------------------------------

function mapEmploymentRow(row: V2EmploymentRow | undefined): Employer {
  if (!row) return { name: '', title: '' };
  const name = (row.company_name ?? row.name ?? '').trim();
  const locStr =
    typeof row.location === 'string'
      ? row.location
      : typeof row.location === 'object' && row.location?.raw
        ? row.location.raw
        : undefined;
  const companyId =
    typeof row.crustdata_company_id === 'number'
      ? row.crustdata_company_id
      : typeof row.company_id === 'number'
        ? row.company_id
        : undefined;
  return {
    name,
    title: (row.title ?? '').trim(),
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description,
    location: locStr,
    company_linkedin_profile_url:
      row.company_professional_network_profile_url || row.company_linkedin_url,
    company_id: companyId,
    years_at_company_raw:
      typeof row.years_at_company_raw === 'number' ? row.years_at_company_raw : undefined,
  };
}

function mapSchoolRow(row: V2SchoolRow | undefined): Education {
  return {
    institute_name: (row?.school ?? '').trim(),
    degree_name: row?.degree?.trim() ?? undefined,
    field_of_study: row?.field_of_study?.trim() ?? undefined,
    start_date: row?.start_date,
    end_date: row?.end_date,
  };
}

function locationStringFromV2(p: V2PersonRecord): string {
  const loc = p.basic_profile?.location;
  if (loc?.full_location) return loc.full_location;
  if (loc?.raw) return loc.raw;
  const parts = [loc?.city, loc?.state, loc?.country].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return p.professional_network?.location?.raw ?? '';
}

/** Map a CrustData v2 person record onto our internal LinkedInProfile shape. */
export function mapV2PersonToLinkedInProfile(p: V2PersonRecord): LinkedInProfile {
  const basic = p.basic_profile ?? {};
  const profileUrl = p.social_handles?.professional_network_identifier?.profile_url ?? '';
  const currentRows = p.experience?.employment_details?.current ?? [];
  const pastRows = p.experience?.employment_details?.past ?? [];

  const current_employers = currentRows.map(mapEmploymentRow).filter((e) => e.name || e.title);
  const past_employers = pastRows.map(mapEmploymentRow).filter((e) => e.name || e.title);
  const all_employers: Employer[] = [...current_employers, ...past_employers];

  const eduRows = p.education?.schools ?? [];
  const education_background = eduRows.map(mapSchoolRow).filter((e) => e.institute_name);

  const all_schools = education_background.map((e) => e.institute_name).filter(Boolean);
  const all_degrees = education_background
    .map((e) => e.degree_name)
    .filter((d): d is string => Boolean(d));

  const skills = p.skills?.professional_network_skills ?? [];

  const currentRow = current_employers[0];
  const location = locationStringFromV2(p);

  return {
    linkedin_profile_url: profileUrl,
    name: basic.name?.trim() || [basic.first_name, basic.last_name].filter(Boolean).join(' ').trim(),
    title: basic.current_title?.trim() || currentRow?.title || '',
    headline: basic.headline?.trim() || '',
    location,
    region: location,
    summary: basic.summary?.trim() || '',
    current_title: basic.current_title?.trim() || currentRow?.title || '',
    current_company: currentRow?.name || '',
    all_employers,
    current_employers,
    past_employers,
    education_background,
    all_degrees,
    all_schools,
    all_titles: all_employers.map((e) => e.title || ''),
    skills,
    profile_picture_url: p.professional_network?.profile_picture_permalink,
    num_of_connections: p.professional_network?.connections,
    person_id: p.crustdata_person_id,
  };
}

// ---------------------------------------------------------------------------
// Helpers used by cascade-search
// ---------------------------------------------------------------------------

/** Build an `op: "and"` filter from a list of conditions (or return the single condition). */
export function combineAnd(conditions: V2Filter[]): V2Filter {
  if (conditions.length === 1) return conditions[0]!;
  return { op: 'and', conditions };
}

/** Regex/contains match — pipe-joined values are OR'd by the `(.)` operator. */
export function regexAny(field: string, values: string[]): V2Condition {
  const cleaned = values
    .map((v) => v.trim())
    .filter((v) => v.length >= 2)
    .map((v) => v.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'));
  const value = cleaned.length > 0 ? cleaned.join('|') : '';
  return { field, type: '(.)', value };
}

/** Single-value contains match. */
export function regexOne(field: string, value: string): V2Condition {
  return { field, type: '(.)', value: value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') };
}

export function geoDistance(
  field: string,
  location: string,
  distance: number,
  unit: 'mi' | 'km' = 'km'
): V2Condition {
  return { field, type: 'geo_distance', value: { location, distance, unit } };
}
