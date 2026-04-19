'use client';

import { useMemo } from 'react';
import { CareerInsights, CareerJourney } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { estimateYearsFromEmployers } from '@/lib/career/tenure';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, Compass, Lightbulb, Sparkles } from 'lucide-react';

interface InsightsPanelProps {
  insights: CareerInsights;
  journeys?: CareerJourney[];
  goalTitle?: string;
}

/**
 * Build a histogram of total years-of-experience across all mentor profiles.
 * We use this as the single hero chart — it's easy to read at a glance ("most
 * people made it in ~X years").
 */
function buildYearsDistribution(journeys: CareerJourney[]): { year: number; count: number }[] {
  const yearCounts = new Map<number, number>();
  for (const j of journeys) {
    const fromJobs = estimateYearsFromEmployers(j.profile.all_employers);
    const raw = j.profile.years_of_experience_raw;
    const n =
      (fromJobs > 0 ? fromJobs : null) ??
      (typeof raw === 'number' && raw > 0 ? Math.round(raw) : null) ??
      (typeof j.path_highlights?.total_years === 'number' && j.path_highlights.total_years > 0
        ? Math.round(j.path_highlights.total_years)
        : null);
    if (n == null || n <= 0 || n > 35) continue;
    yearCounts.set(n, (yearCounts.get(n) ?? 0) + 1);
  }
  if (yearCounts.size === 0) return [];

  const minYear = Math.max(1, Math.min(...yearCounts.keys()) - 1);
  const maxYear = Math.min(30, Math.max(...yearCounts.keys()) + 1);
  const data: { year: number; count: number }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    data.push({ year: y, count: yearCounts.get(y) ?? 0 });
  }
  return data;
}

interface KeyPoint {
  Icon: typeof Sparkles;
  title: string;
  body: string;
  accent: 'teal' | 'sky' | 'amber';
}

/**
 * Boil the (often noisy) AI insights into 3–5 short, plain-English takeaways.
 * Anything longer than ~140 chars gets dropped — this UI is for skim-reading.
 */
function buildKeyPoints(
  insights: CareerInsights,
  goalTitle: string | undefined
): KeyPoint[] {
  const points: KeyPoint[] = [];
  const goal = goalTitle?.trim() || 'this role';

  const timeline = insights.timeline;
  if (timeline?.avg_years && timeline.avg_years > 0) {
    points.push({
      Icon: Clock,
      title: `~${timeline.avg_years} years on average`,
      body: `Most mentors reached ${goal} in ${timeline.min_years || '?'}\u2013${timeline.max_years || '?'} years total.`,
      accent: 'teal',
    });
  }

  const firstStep = insights.common_steps?.[0];
  if (firstStep && firstStep.length < 160) {
    points.push({
      Icon: Compass,
      title: 'Most common first move',
      body: firstStep,
      accent: 'sky',
    });
  }

  const topRoute = insights.alternative_routes?.[0];
  if (topRoute?.route_name) {
    points.push({
      Icon: Sparkles,
      title: `${topRoute.percentage ?? 0}% took the "${topRoute.route_name}" route`,
      body:
        topRoute.description && topRoute.description.length < 160
          ? topRoute.description
          : `Most popular alternative route to ${goal}.`,
      accent: 'amber',
    });
  }

  const factor = insights.success_factors?.[0];
  if (factor && factor.length < 160) {
    points.push({
      Icon: Lightbulb,
      title: 'What set them apart',
      body: factor,
      accent: 'teal',
    });
  }

  // Cap at 4 — anything more becomes scroll noise
  return points.slice(0, 4);
}

const ACCENT_STYLES: Record<KeyPoint['accent'], { wrap: string; iconBg: string; icon: string }> = {
  teal: {
    wrap: 'border-teal-200 bg-gradient-to-br from-teal-50/80 to-white dark:border-teal-900/50 dark:from-teal-950/30 dark:to-slate-900',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
    icon: 'text-teal-700 dark:text-teal-300',
  },
  sky: {
    wrap: 'border-sky-200 bg-gradient-to-br from-sky-50/80 to-white dark:border-sky-900/50 dark:from-sky-950/30 dark:to-slate-900',
    iconBg: 'bg-sky-100 dark:bg-sky-900/50',
    icon: 'text-sky-700 dark:text-sky-300',
  },
  amber: {
    wrap: 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    icon: 'text-amber-700 dark:text-amber-300',
  },
};

export function InsightsPanel({ insights, journeys = [], goalTitle }: InsightsPanelProps) {
  const yearsData = useMemo(() => buildYearsDistribution(journeys), [journeys]);
  const hasYearsChart = yearsData.length > 0;
  const points = useMemo(() => buildKeyPoints(insights, goalTitle), [insights, goalTitle]);
  const timeline = insights.timeline ?? { min_years: 0, avg_years: 0, max_years: 0 };

  return (
    <div className="space-y-6">
      {/* Hero: years-to-goal distribution chart + 3 stats */}
      <Card className="border border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
            <Clock className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            How long it usually takes{goalTitle ? ` to reach ${goalTitle}` : ''}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Distribution of total years of experience across the mentor pool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/50 dark:bg-teal-950/30">
              <div className="font-heading text-3xl font-bold text-teal-700 dark:text-teal-300">
                {timeline.min_years || '\u2014'}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Fastest (yrs)</div>
            </div>
            <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 dark:border-sky-900/50 dark:from-sky-950/30 dark:to-blue-950/30">
              <div className="font-heading text-3xl font-bold text-sky-700 dark:text-sky-300">
                {timeline.avg_years || '\u2014'}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Typical (yrs)</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="font-heading text-3xl font-bold text-slate-700 dark:text-slate-200">
                {timeline.max_years || '\u2014'}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Slowest (yrs)</div>
            </div>
          </div>

          {hasYearsChart ? (
            <div className="mt-5 w-full min-w-0">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={yearsData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="yearsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: 'Years of experience',
                      position: 'insideBottom',
                      offset: -2,
                      fill: '#64748b',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(20, 184, 166, 0.06)' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      `${value as number} mentor${(value as number) === 1 ? '' : 's'}`,
                      'Reached goal',
                    ]}
                    labelFormatter={(label) => `${label} years of experience`}
                  />
                  {timeline.avg_years > 0 ? (
                    <ReferenceLine
                      x={timeline.avg_years}
                      stroke="#0d9488"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Typical',
                        position: 'top',
                        fill: '#0d9488',
                        fontSize: 10,
                      }}
                    />
                  ) : null}
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#yearsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 3–4 plain-English key takeaways */}
      {points.length > 0 ? (
        <Card className="border border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
              <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              Key takeaways
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              The patterns that show up most across these journeys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {points.map((p, idx) => {
                const styles = ACCENT_STYLES[p.accent];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 ${styles.wrap}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
                    >
                      <p.Icon className={`h-4.5 w-4.5 ${styles.icon}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {p.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{p.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
