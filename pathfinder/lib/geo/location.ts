import type { CareerJourney } from '@/lib/types';

const COUNTRY_TOKENS = new Set([
  'india',
  'united states',
  'usa',
  'u.s.',
  'u.s.a.',
  'uk',
  'united kingdom',
  'canada',
  'australia',
  'germany',
  'france',
  'singapore',
  'japan',
  'china',
  'uae',
  'netherlands',
  'ireland',
]);

const KNOWN_METRO_TOKENS: readonly string[] = [
  'bengaluru',
  'bangalore',
  'mumbai',
  'delhi',
  'new delhi',
  'hyderabad',
  'chennai',
  'pune',
  'kolkata',
  'ahmedabad',
  'jaipur',
  'surat',
  'lucknow',
  'kochi',
  'indore',
  'nagpur',
  'san francisco',
  'new york',
  'london',
  'toronto',
  'seattle',
  'boston',
];

const METRO_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bengaluru: 'bengaluru',
  gurgaon: 'gurugram',
  gurugram: 'gurugram',
};

function normalizeSpaces(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function splitSegments(s: string): string[] {
  return s.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
}

function stripTrailingCountry(segments: string[]): string[] {
  if (segments.length === 0) return segments;
  const last = segments[segments.length - 1]!.replace(/\./g, '');
  if (COUNTRY_TOKENS.has(last)) return segments.slice(0, -1);
  return [...segments];
}

function canonicalCity(token: string): string {
  const t = token.replace(/\./g, '').trim().toLowerCase();
  return METRO_ALIASES[t] ?? t;
}

function metroRegex(metro: string): RegExp {
  return new RegExp(`(^|[,\\s])${metro.replace(/\s+/g, '\\s+')}([,\\s]|$)`, 'i');
}

/**
 * Shared implementation: same city, same state (non-country segment), or same known metro in both strings.
 * Never matches on "India" / country alone.
 */
function sameRegionCore(a: string, b: string): boolean {
  const na = normalizeSpaces(a);
  const nb = normalizeSpaces(b);
  if (na === nb) return true;

  const sa = stripTrailingCountry(splitSegments(na));
  const sb = stripTrailingCountry(splitSegments(nb));
  if (sa.length === 0 || sb.length === 0) return false;

  const cityA = sa[0] ? canonicalCity(sa[0]) : '';
  const cityB = sb[0] ? canonicalCity(sb[0]) : '';
  if (cityA && cityB && cityA === cityB) return true;

  if (sa.length >= 2 && sb.length >= 2) {
    const stateA = sa[sa.length - 1]!;
    const stateB = sb[sb.length - 1]!;
    if (stateA === stateB && !COUNTRY_TOKENS.has(stateA)) return true;
  }

  for (const metro of KNOWN_METRO_TOKENS) {
    const re = metroRegex(metro);
    if (re.test(na) && re.test(nb)) return true;
  }

  return false;
}

export function locationsLikelySameRegion(a: string | undefined, b: string | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return sameRegionCore(a.trim(), b.trim());
}

/**
 * Human-readable chip when {@link locationsLikelySameRegion} is true (city > state > metro).
 */
export function regionAnchorLabel(userLoc: string | undefined, candLoc: string | undefined): string {
  if (!userLoc?.trim() || !candLoc?.trim()) return 'Same area';
  const rawU = userLoc.trim();
  const rawC = candLoc.trim();
  const na = normalizeSpaces(rawU);
  const nb = normalizeSpaces(rawC);

  const su = stripTrailingCountry(splitSegments(na));
  const sc = stripTrailingCountry(splitSegments(nb));
  if (su.length === 0 || sc.length === 0) return 'Same area';

  const cityU = su[0] ? canonicalCity(su[0]) : '';
  const cityC = sc[0] ? canonicalCity(sc[0]) : '';
  if (cityU && cityC && cityU === cityC) {
    const pretty = rawU.split(',')[0]?.trim() || rawC.split(',')[0]?.trim();
    return `Same city: ${pretty}`;
  }

  if (su.length >= 2 && sc.length >= 2) {
    const stateU = su[su.length - 1]!;
    const stateC = sc[sc.length - 1]!;
    if (stateU === stateC && !COUNTRY_TOKENS.has(stateU)) {
      const title = stateU
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return `Same state: ${title}, India`;
    }
  }

  for (const metro of KNOWN_METRO_TOKENS) {
    const re = metroRegex(metro);
    if (re.test(na) && re.test(nb)) {
      const pretty = metro
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return `Same area: ${pretty}`;
    }
  }

  return 'Same area';
}

/**
 * Put up to `sameRegionSlots` journeys that match the user's location first; preserve similarity order within each group.
 */
export function prioritizeSameRegionFirst(
  journeys: CareerJourney[],
  userLocation: string | undefined,
  userRegion: string | undefined,
  sameRegionSlots: number = 2
): CareerJourney[] {
  const userHint = userRegion?.trim() || userLocation?.trim();
  if (!userHint || journeys.length === 0) return journeys;

  const withFlag = journeys.map((j) => {
    const cand = j.profile.region?.trim() || j.profile.location?.trim() || '';
    const same = locationsLikelySameRegion(userHint, cand);
    return { journey: j, same, score: j.similarity.overall_score };
  });

  const sameRegion = withFlag.filter((x) => x.same).sort((a, b) => b.score - a.score);
  const other = withFlag.filter((x) => !x.same).sort((a, b) => b.score - a.score);

  const head = sameRegion.slice(0, sameRegionSlots).map((x) => x.journey);
  const sameRest = sameRegion.slice(sameRegionSlots).map((x) => x.journey);
  const rest = other.map((x) => x.journey);

  const seen = new Set<string>();
  const out: CareerJourney[] = [];
  for (const j of [...head, ...sameRest, ...rest]) {
    const key = j.profile.linkedin_profile_url || j.profile.name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}
