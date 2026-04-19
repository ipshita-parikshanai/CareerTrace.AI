/**
 * Alternate spellings of well-known schools (IIIT / IIT / BITS) — shared by
 * CrustData search helpers and client-side journey overlap. Lives here so
 * client components never import `lib/api/crustdata.ts` (which touches env).
 */
export function schoolSearchVariants(label: string): string[] {
  const raw = label.trim();
  if (!raw.length) return [];
  const out: string[] = [];
  const push = (s: string) => {
    const x = s.trim();
    if (x.length < 3 || out.some((o) => o.toLowerCase() === x.toLowerCase())) return;
    out.push(x);
  };
  push(raw);

  if (
    /\biiit\b/i.test(raw) &&
    /hyderabad|iiith/i.test(raw.replace(/\s+/g, ' ').toLowerCase())
  ) {
    push('International Institute of Information Technology Hyderabad');
    push('IIIT Hyderabad');
    push('IIITH');
  }
  if (/international\s+institute\s+of\s+information\s+technology/i.test(raw)) {
    push('IIIT Hyderabad');
    push('IIITH');
  }

  const iit = raw.match(
    /Indian\s+Institute\s+of\s+Technology\s*,?\s*([A-Za-z][A-Za-z\s]{0,40})/i
  );
  if (iit?.[1]) {
    push(`IIT ${iit[1].trim()}`);
  }

  if (/\bbits\s+pilani\b/i.test(raw)) {
    push('BITS Pilani');
    push('Birla Institute of Technology and Science');
  }

  return out;
}
