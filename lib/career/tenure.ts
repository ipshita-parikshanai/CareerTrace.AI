import type { Employer } from '@/lib/types';

/** Parse YYYY-MM-DD or ISO datetime for display / math (local calendar date). */
export function parseCareerDate(s: string | undefined): Date | null {
  if (!s?.trim()) return null;
  const t = s.trim();
  const day = t.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Months between two career dates, using ~30.4375 days per month. */
function monthsBetweenStartEnd(start?: string, end?: string): number {
  const sd = parseCareerDate(start);
  if (!sd) return 0;
  const ed = end?.trim() ? parseCareerDate(end) : new Date();
  if (!ed) return 0;
  const ms = ed.getTime() - sd.getTime();
  if (ms < 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 30.4375);
}

/**
 * Total experience: sum of job tenures. Uses explicit durations when present;
 * otherwise derives tenure from start/end dates (CrustData often omits duration_months).
 */
export function estimateYearsFromEmployers(employers?: Employer[]): number {
  if (!employers?.length) return 0;
  let months = 0;
  for (const e of employers) {
    if (typeof e.duration_months === 'number' && e.duration_months > 0) {
      months += e.duration_months;
    } else if (typeof e.years_at_company_raw === 'number') {
      months += Math.round(e.years_at_company_raw * 12);
    } else {
      months += monthsBetweenStartEnd(e.start_date, e.end_date);
    }
  }
  return months > 0 ? Math.max(1, Math.round(months / 12)) : 0;
}
