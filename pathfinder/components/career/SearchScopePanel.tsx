'use client';

import type { CareerPathSearchStats } from '@/lib/types';

interface SearchScopePanelProps {
  stats: CareerPathSearchStats;
}

export function SearchScopePanel({ stats }: SearchScopePanelProps) {
  const tiersRan = stats.cascadeTiers.filter((t) => t.ran).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-5">
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
          Search scope
        </h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          Out of <strong className="text-slate-900 dark:text-slate-100">{stats.totalPopulationCount.toLocaleString()}</strong>{' '}
          people across <strong>{tiersRan}</strong> tier{tiersRan === 1 ? '' : 's'}, we surfaced{' '}
          <strong>{stats.rankedShown}</strong> matches for you.
        </p>
      </div>

      <div className="space-y-2">
        {stats.cascadeTiers.map((t) => (
          <div
            key={t.key}
            className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${
              t.ran
                ? 'bg-rose-50/80 dark:bg-rose-950/30'
                : t.attempted
                  ? 'bg-amber-50/70 dark:bg-amber-950/30'
                  : 'bg-slate-50 dark:bg-slate-800/40 opacity-70'
            }`}
          >
            <span
              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                t.ran
                  ? 'bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              T{t.tier}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.label}
                {t.ran ? (
                  <span className="ml-2 font-normal text-slate-700 dark:text-slate-300">
                    → <strong>{t.totalCount.toLocaleString()}</strong> people,{' '}
                    <strong>{t.uniqueCandidatesAdded}</strong> added
                  </span>
                ) : t.attempted ? (
                  <span className="ml-2 font-normal text-slate-600 dark:text-slate-400">
                    → 0 matches
                  </span>
                ) : (
                  <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                    skipped (already had enough)
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{t.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-slate-200 pt-4 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <span>
          Unique candidates considered: <strong className="text-slate-900 dark:text-slate-100">{stats.uniqueCandidatesConsidered}</strong>
        </span>
        <span>
          Enriched: <strong className="text-slate-900 dark:text-slate-100">{stats.enrichPoolSize}</strong> (
          <strong>{stats.cacheHitsInEnrich}</strong> cache /{' '}
          <strong>{stats.liveEnrichCalls}</strong> live)
        </span>
        <span>
          Passed goal-check: <strong className="text-slate-900 dark:text-slate-100">{stats.profilesPassingGoalCheck}</strong>
        </span>
      </div>

      {stats.stoppedEarly ? (
        <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          ✓ Cascade stopped early — high-precision tiers were enough.
        </p>
      ) : null}

      {(stats.inputs.employersConsidered.length || stats.inputs.schoolsConsidered.length) ? (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Anchors used:</span>{' '}
          {stats.inputs.employersConsidered.join(', ') || '(no employer)'} ·{' '}
          {stats.inputs.schoolsConsidered.join(', ') || '(no school)'}
          {stats.inputs.metro ? ` · metro: ${stats.inputs.metro}` : ''}
        </p>
      ) : null}
    </div>
  );
}
