'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Search, Sparkles, UserCircle2, Users } from 'lucide-react';

interface TracingProgressProps {
  goalTitle?: string;
}

const STEPS = [
  {
    id: 'enrich',
    label: 'Enriching your LinkedIn profile',
    detail: 'Pulling roles, schools, skills from CrustData.',
    icon: UserCircle2,
    minMs: 2200,
  },
  {
    id: 'search',
    label: 'Searching the mentor pool',
    detail: 'Looking for people who already reached this role.',
    icon: Search,
    minMs: 4500,
  },
  {
    id: 'enrich-mentors',
    label: 'Enriching candidate profiles',
    detail: 'CrustData rate-limits us, so we go one at a time.',
    icon: Users,
    minMs: 9000,
  },
  {
    id: 'rank',
    label: 'Ranking transition stories',
    detail: 'Penalizing people who started already in your goal role.',
    icon: Sparkles,
    minMs: 1500,
  },
] as const;

export function TracingProgress({ goalTitle }: TracingProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 250);
    return () => clearInterval(id);
  }, []);

  let cumulative = 0;
  const stepsWithStatus = STEPS.map((s) => {
    const startAt = cumulative;
    cumulative += s.minMs;
    const endAt = cumulative;
    let status: 'pending' | 'active' | 'done' = 'pending';
    if (elapsed >= endAt) status = 'done';
    else if (elapsed >= startAt) status = 'active';
    return { ...s, status };
  });

  // Once past the cumulative budget, leave the last step "active" indefinitely
  const totalBudget = cumulative;
  if (elapsed >= totalBudget) {
    stepsWithStatus[stepsWithStatus.length - 1].status = 'active';
  }

  const percent = Math.min(94, Math.round((elapsed / totalBudget) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-2xl shadow-slate-900/20">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
            <span
              className="absolute inset-0 animate-ping rounded-2xl bg-teal-400/40"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-semibold text-slate-900">
              Tracing your path{goalTitle ? ` to ${goalTitle}` : ''}…
            </h3>
            <p className="text-sm text-slate-600">
              Live data — first paths land in 15–25 seconds, AI scoring follows.
            </p>
          </div>
        </div>

        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ol className="space-y-3">
          {stepsWithStatus.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${
                  step.status === 'done'
                    ? 'border-emerald-100 bg-emerald-50/60'
                    : step.status === 'active'
                      ? 'border-teal-200 bg-teal-50/60 shadow-sm'
                      : 'border-slate-100 bg-slate-50/40'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    step.status === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : step.status === 'active'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step.status === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={`font-heading text-sm font-medium ${
                      step.status === 'pending' ? 'text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-5 text-center text-xs text-slate-500">
          Don&apos;t close this window — the trace is live, not cached.
        </p>
      </div>
    </div>
  );
}
