/**
 * Company tier classifier.
 *
 * The intent is "would two people at companies in the same tier feel
 * comparable on a resume?" — pay scale, brand, prestige, and the kind of
 * problems they were exposed to. We deliberately keep the tiers coarse
 * (5 + other) so we can use them as a soft "comparable shoes" signal
 * without pretending to be precise about salary bands.
 *
 *   tier_1_elite    — FAANG, OpenAI/Anthropic, Stripe, Nvidia, Tesla, Databricks
 *   tier_2_top      — Top SaaS / fintech / consulting / quant / well-known unicorns
 *   tier_3_unicorn  — Regional unicorns & well-known late-stage (Flipkart, Razorpay, Grab…)
 *   tier_4_growth   — Mid-stage / Series-B-C-ish (best-effort; weak heuristic)
 *   tier_5_services — IT services & Big-4 advisory (TCS, Infy, Accenture, Deloitte…)
 *   tier_other      — Couldn't classify
 */
export type CompanyTier =
  | 'tier_1_elite'
  | 'tier_2_top'
  | 'tier_3_unicorn'
  | 'tier_4_growth'
  | 'tier_5_services'
  | 'tier_other';

interface TierDef {
  id: CompanyTier;
  label: string;
  pattern: RegExp;
}

const TIERS: TierDef[] = [
  {
    id: 'tier_1_elite',
    label: 'FAANG / elite tech',
    pattern:
      /\b(google|alphabet|deepmind|meta|facebook|instagram|whatsapp|amazon|aws|apple|microsoft|netflix|openai|anthropic|nvidia|stripe|tesla|spacex|databricks)\b/i,
  },
  {
    id: 'tier_2_top',
    label: 'Top tech / SaaS / consulting',
    pattern:
      /\b(linkedin|uber|lyft|airbnb|pinterest|twitter|x\s*corp|snap|snapchat|spotify|adobe|salesforce|atlassian|datadog|snowflake|hubspot|zoom|shopify|notion|figma|airtable|asana|slack|coinbase|square|block|plaid|robinhood|brex|ramp|adyen|chime|klarna|wise|booking|expedia|paypal|ebay|intuit|mongodb|elastic|cloudflare|twilio|okta|workday|servicenow|palantir|samsara|rivian|mckinsey|bain|bcg|boston\s+consulting|goldman\s+sachs|morgan\s+stanley|jpmorgan|citadel|two\s+sigma|jane\s+street|rippling|squarespace|github|gitlab|hashicorp|confluent|reddit|cloudkitchens|doordash|instacart|peloton|zillow|opendoor|coursera|udemy|robinhood|samsung\s+research|qualcomm|intel\s+labs)\b/i,
  },
  {
    id: 'tier_3_unicorn',
    label: 'Unicorn / regional leader',
    pattern:
      /\b(flipkart|myntra|swiggy|zomato|ola|paytm|phonepe|cred|razorpay|nykaa|meesho|udaan|cars24|byju|unacademy|dunzo|urban\s+company|oyo|policybazaar|zerodha|grofers|blinkit|delhivery|freshworks|zoho|postman|chargebee|browserstack|innovaccer|shaadi|naukri|info\s*edge|grab|gojek|sea\b|shopee|kakao|line\s+corp|mercadolibre|nubank|rappi|gopuff|getir|bolt|revolut|n26|ginkgo|klaviyo|plaid|miro|gusto|toast|carta|deel|alan|qonto|deliveroo|cazoo|monzo|starling)\b/i,
  },
  {
    id: 'tier_5_services',
    label: 'IT services / advisory',
    pattern:
      /\b(tcs|tata\s+consultancy|infosys|wipro|hcl|cognizant|tech\s+mahindra|capgemini|mindtree|ltimindtree|ibm|accenture|deloitte|kpmg|ey\b|ernst\s*&?\s*young|pwc|pricewaterhouse|mphasis|persistent\s+systems|larsen|l\s*&\s*t)\b/i,
  },
];

export function companyTier(name?: string | null): CompanyTier {
  if (!name) return 'tier_other';
  for (const t of TIERS) {
    if (t.pattern.test(name)) return t.id;
  }
  return 'tier_other';
}

export function tierLabel(tier: CompanyTier): string {
  return TIERS.find((t) => t.id === tier)?.label ?? 'Other / unknown';
}

/**
 * Subjective "tier distance" between two companies. Used to award partial
 * points when companies are not the same but operate at a similar level.
 *   0   = same tier
 *   1   = adjacent tier (e.g. tier 1 vs tier 2)
 *   2+  = far apart (FAANG vs IT services)
 *
 * tier_other and tier_4_growth are treated as "unknown" — we return Infinity
 * because they're noisy signals (a "startup" job tells us very little).
 */
export function tierDistance(a: CompanyTier, b: CompanyTier): number {
  if (a === 'tier_other' || b === 'tier_other') return Infinity;
  if (a === 'tier_4_growth' || b === 'tier_4_growth') return Infinity;
  const order: CompanyTier[] = ['tier_1_elite', 'tier_2_top', 'tier_3_unicorn', 'tier_5_services'];
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia < 0 || ib < 0) return Infinity;
  return Math.abs(ia - ib);
}
