/**
 * When the OpenRouter insights call fails or is skipped, we still show the
 * Analysis tab with timeline + chart derived only from the journey list.
 */
import type { CareerInsights, CareerJourney } from '@/lib/types';
import { estimateYearsFromEmployers } from '@/lib/career/tenure';

function yearsForJourney(j: CareerJourney): number | null {
  const fromJobs = estimateYearsFromEmployers(j.profile.all_employers);
  const raw = j.profile.years_of_experience_raw;
  const ph = j.path_highlights?.total_years;
  const n =
    (fromJobs > 0 ? fromJobs : null) ??
    (typeof raw === 'number' && raw > 0 ? Math.round(raw) : null) ??
    (typeof ph === 'number' && ph > 0 ? Math.round(ph) : null);
  if (n == null || n <= 0 || n > 45) return null;
  return n;
}

export function buildFallbackInsights(
  journeys: CareerJourney[],
  goalTitle: string
): CareerInsights {
  const years = journeys.map(yearsForJourney).filter((y): y is number => y != null);

  if (years.length === 0) {
    return {
      common_steps: [],
      alternative_routes: [],
      key_transitions: [],
      timeline: { min_years: 0, avg_years: 0, max_years: 0 },
      company_progression_patterns: [],
      skills_progression: { early_career: [], mid_career: [], senior: [] },
      success_factors: [
        journeys.length === 0
          ? 'No journeys to analyze yet.'
          : 'AI narrative insights were unavailable. Add OPENROUTER_API_KEY or try again.',
      ],
    };
  }

  const min_years = Math.min(...years);
  const max_years = Math.max(...years);
  const avg_years = Math.round(years.reduce((a, b) => a + b, 0) / years.length);

  const tierLabel = (t: number) => {
    switch (t) {
      case 1:
        return 'Same company + similar role';
      case 2:
        return 'Same company';
      case 3:
        return 'Same school + degree';
      case 4:
        return 'Same school';
      case 5:
        return 'Same metro + role';
      default:
        return 'Broad match';
    }
  };

  const tierCounts = new Map<number, number>();
  for (const j of journeys) {
    const t = j.source_tier?.tier;
    if (t != null) tierCounts.set(t, (tierCounts.get(t) ?? 0) + 1);
  }
  const sortedTiers = [...tierCounts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sortedTiers[0];
  const common_steps: string[] = [];
  if (top) {
    common_steps.push(
      `${top[1]} of ${journeys.length} paths came from tier ${top[0]} (${tierLabel(top[0])} → ${goalTitle || 'goal'}).`
    );
  }

  return {
    common_steps,
    alternative_routes: [],
    key_transitions: [],
    timeline: { min_years, avg_years, max_years },
    company_progression_patterns: [],
    skills_progression: { early_career: [], mid_career: [], senior: [] },
    success_factors: [
      'AI-generated patterns were unavailable — numbers below are computed from this result set only.',
    ],
  };
}
