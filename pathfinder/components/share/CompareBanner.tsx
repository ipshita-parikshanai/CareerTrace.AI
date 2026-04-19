'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftRight, ArrowUpRight, X } from 'lucide-react';
import {
  COMPARE_CONTEXT_KEY,
  type CompareContext,
} from '@/components/share/TraceYourFriendBox';
import type { CareerJourney, LinkedInProfile } from '@/lib/types';

interface CompareBannerProps {
  /** Viewer's own profile (the result currently displayed). */
  viewerProfile: LinkedInProfile;
  /** Viewer's own journeys — used to compute their averages. */
  viewerJourneys: CareerJourney[];
}

/**
 * "You vs. <owner>" banner — only renders when the viewer arrived at /results
 * via a friend-trace (compare context stored in sessionStorage).
 */
export function CompareBanner({
  viewerProfile,
  viewerJourneys,
}: CompareBannerProps) {
  const [ctx, setCtx] = useState<CompareContext | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(COMPARE_CONTEXT_KEY);
      if (raw) setCtx(JSON.parse(raw) as CompareContext);
    } catch {
      // ignore — bad stored context
    }
  }, []);

  const viewerStats = useMemo(() => {
    const totalAnchorStrength = viewerJourneys.reduce(
      (s, j) =>
        s +
        (j.relevance_anchors ?? []).reduce((sum, a) => sum + (a.strength ?? 0), 0),
      0
    );
    const avgAnchors = viewerJourneys.length
      ? Math.round(totalAnchorStrength / viewerJourneys.length)
      : 0;
    return {
      avgPathMatch: viewerJourneys.length
        ? Math.round(
            viewerJourneys.reduce((s, j) => s + (j.similarity?.overall_score ?? 0), 0) /
              viewerJourneys.length
          )
        : 0,
      avgAnchors,
      pathsCount: viewerJourneys.length,
    };
  }, [viewerJourneys]);

  if (!ctx || dismissed) return null;

  const owner = ctx.ownerSnapshot ?? {};
  const rows: Array<{
    label: string;
    you: number | undefined;
    them: number | undefined;
    suffix?: string;
  }> = [
    { label: 'Avg path match', you: viewerStats.avgPathMatch, them: owner.avgPathMatch, suffix: '%' },
    { label: 'Avg shared anchors', you: viewerStats.avgAnchors, them: owner.avgAffinity },
    { label: 'Similar paths', you: viewerStats.pathsCount, them: owner.pathsCount },
  ];

  const initials = (name?: string) =>
    name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <Card className="motion-safe:animate-career-rise relative mb-6 overflow-hidden border border-violet-200 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 shadow-md">
      <div
        className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-violet-200/35 blur-3xl"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.removeItem(COMPARE_CONTEXT_KEY);
          } catch {
            /* ignore */
          }
        }}
        aria-label="Dismiss comparison"
        className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="relative p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md">
            <ArrowLeftRight className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold text-slate-900 md:text-lg">
              You vs. {ctx.ownerName ?? 'their trace'} &mdash; both targeting{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {ctx.goalTitle}
              </span>
            </p>
            <p className="text-xs text-slate-600">
              Same goal, same pipeline. Here&apos;s where your traces line up.
            </p>
          </div>
          <Link
            href={`/trace/${ctx.traceId}`}
            className="font-heading ml-auto inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-50"
          >
            Back to {ctx.ownerName ? `${ctx.ownerName}'s` : 'original'} trace
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Avatars */}
        <div className="mb-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5">
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-8 w-8 border border-violet-200">
                <AvatarImage src={viewerProfile.profile_picture_url} />
                <AvatarFallback className="bg-violet-100 text-[11px] font-bold text-violet-800">
                  {initials(viewerProfile.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-heading text-sm font-semibold text-slate-800">
                You ({viewerProfile.name?.split(' ')[0] || 'You'})
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5">
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-8 w-8 border border-fuchsia-200">
                <AvatarImage src={owner.profilePictureUrl} />
                <AvatarFallback className="bg-fuchsia-100 text-[11px] font-bold text-fuchsia-800">
                  {initials(ctx.ownerName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-heading text-sm font-semibold text-slate-800">
                {ctx.ownerName?.split(' ')[0] || 'Owner'}
              </span>
            </div>
          </div>
        </div>

        {/* Rows of metrics */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/85">
          {rows.map((r, idx) => {
            const you = r.you ?? 0;
            const them = r.them ?? 0;
            const max = Math.max(you, them, 1);
            const youPct = (you / max) * 100;
            const themPct = (them / max) * 100;
            const delta =
              r.you !== undefined && r.them !== undefined ? you - them : null;
            return (
              <div
                key={r.label}
                className={`grid grid-cols-[110px_1fr_60px] items-center gap-3 px-3 py-2.5 text-xs ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                }`}
              >
                <span className="font-medium text-slate-700">{r.label}</span>
                <div className="space-y-1">
                  {/* You */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 shrink-0 text-[10px] font-semibold text-violet-700">YOU</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: `${youPct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-900 tabular-nums">
                      {r.you !== undefined ? `${r.you}${r.suffix ?? ''}` : '—'}
                    </span>
                  </div>
                  {/* Them */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 shrink-0 text-[10px] font-semibold text-slate-500">
                      THEM
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500"
                        style={{ width: `${themPct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-700 tabular-nums">
                      {r.them !== undefined ? `${r.them}${r.suffix ?? ''}` : '—'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {delta === null ? (
                    <span className="text-[10px] text-slate-400">n/a</span>
                  ) : delta === 0 ? (
                    <span className="text-[10px] font-medium text-slate-500">tie</span>
                  ) : delta > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600">
                      +{delta}
                      {r.suffix ?? ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600">
                      {delta}
                      {r.suffix ?? ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] italic text-slate-500">
          A &ldquo;tie&rdquo; means matched headcounts/scores. Greens = you&apos;re ahead on that
          dimension; reds = they&apos;ve got more momentum to learn from.
        </p>
      </CardContent>
    </Card>
  );
}
