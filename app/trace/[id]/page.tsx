'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { CareerPathTimeline } from '@/components/career/CareerPathTimeline';
import { InsightsPanel } from '@/components/career/InsightsPanel';
import { SectionNav, SectionAnchor } from '@/components/career/SectionNav';
import { PoweredByCrustData } from '@/components/brand/PoweredByCrustData';
import { TraceYourFriendBox } from '@/components/share/TraceYourFriendBox';
import { SiteHeader } from '@/components/brand/SiteHeader';
import { normalizeLinkedInProfile } from '@/lib/api/normalize-profile';
import { buildFallbackInsights } from '@/lib/career/fallback-insights';
import { Eye, BarChart3, Loader2, TrendingUp } from 'lucide-react';
import type { CareerInsights, CareerJourney, LinkedInProfile } from '@/lib/types';

interface SharedTracePayload {
  userProfile: LinkedInProfile;
  careerJourneys: CareerJourney[];
  insights: CareerInsights | null;
  goalTitle: string;
  goalCompany?: string | null;
  goalIndustry?: string | null;
  userLinkedInUrl?: string;
  createdAt: string;
}

export default function SharedTracePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [trace, setTrace] = useState<SharedTracePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/share/${id}`, { signal: ac.signal });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not load trace');
        const raw = json.data as SharedTracePayload;
        const userProfile = normalizeLinkedInProfile(raw.userProfile);
        const careerJourneys = raw.careerJourneys.map((j) => ({
          ...j,
          profile: normalizeLinkedInProfile(j.profile),
        }));
        setTrace({ ...raw, userProfile, careerJourneys });
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Could not load trace');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-teal-50/30 to-sky-50/40 dark:from-slate-950 dark:via-teal-950/30 dark:to-sky-950/40">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading shared trace…</p>
        </div>
      </div>
    );
  }

  if (error || !trace) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/30 to-sky-50/40 dark:from-slate-950 dark:via-teal-950/30 dark:to-sky-950/40">
        <SiteHeader variant="app" onNewSearch={() => router.push('/', { scroll: true })} />
        <main className="container mx-auto max-w-xl px-4 py-20">
          <div className="rounded-2xl border border-rose-200 bg-white/95 p-8 text-center shadow-md dark:border-rose-900/50 dark:bg-slate-900/90">
            <h2 className="font-heading mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Trace not available
            </h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              {error || 'This shared trace could not be loaded.'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Shared traces are kept for 30 days. Run a new trace from the home page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const userProfile = trace.userProfile;
  const careerJourneys = trace.careerJourneys;
  const goalTitle = trace.goalTitle;
  const insights = trace.insights;
  const analysisInsights: CareerInsights | null =
    careerJourneys.length > 0
      ? insights ?? buildFallbackInsights(careerJourneys, goalTitle)
      : null;
  const insightsFromAi = insights != null;

  const totalAnchorStrength = careerJourneys.reduce(
    (s, j) =>
      s + (j.relevance_anchors ?? []).reduce((sum, a) => sum + (a.strength ?? 0), 0),
    0
  );
  const avgAnchors = careerJourneys.length
    ? Math.round(totalAnchorStrength / careerJourneys.length)
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/35 to-sky-50/50 font-inter dark:from-slate-950 dark:via-teal-950/35 dark:to-sky-950/50">
      <SiteHeader variant="app" onNewSearch={() => router.push('/', { scroll: true })} />

      <main className="relative container mx-auto px-4 py-8">
        <div
          className="pointer-events-none absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-500/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-32 -z-10 h-80 w-80 rounded-full bg-teal-100/30 blur-3xl dark:bg-teal-500/12"
          aria-hidden
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="border-teal-200 bg-teal-50 font-heading text-teal-900">
            <Eye className="mr-1 h-3 w-3" />
            Shared trace · read-only
          </Badge>
          <span className="text-xs text-slate-500">
            Saved {new Date(trace.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Hero — owner profile summary */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-teal-50/30 to-sky-50/40 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-sm md:p-8">
          <div className="flex flex-wrap items-start gap-4">
            {userProfile.profile_picture_url ? (
              <img
                src={userProfile.profile_picture_url}
                alt={userProfile.name}
                className="h-16 w-16 shrink-0 rounded-full ring-4 ring-white shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-600 font-heading text-xl font-bold text-white shadow-md ring-4 ring-white">
                {userProfile.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">
                {userProfile.name}&apos;s trace
                {goalTitle ? (
                  <>
                    {' '}to{' '}
                    <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                      {goalTitle}
                    </span>
                  </>
                ) : null}
              </h2>
              <p className="mt-1.5 text-slate-600">
                Currently {userProfile.current_title}
                {userProfile.current_company ? ` at ${userProfile.current_company}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Badge variant="outline" className="border-teal-200 bg-white/80 text-teal-800">
                  {careerJourneys.length} similar paths
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Viral loop: trace yourself against the same goal */}
        <div className="mb-6">
          <TraceYourFriendBox
            goalTitle={goalTitle}
            ownerName={userProfile.name}
            traceId={id}
            ownerSnapshot={{
              avgPathMatch: careerJourneys.length
                ? Math.round(
                    careerJourneys.reduce((s, j) => s + (j.similarity?.overall_score ?? 0), 0) /
                      careerJourneys.length
                  )
                : undefined,
              avgAffinity: avgAnchors,
              pathsCount: careerJourneys.length,
              mentorsCount: 0,
              profilePictureUrl: userProfile.profile_picture_url,
            }}
          />
        </div>

        <SectionNav
          sections={[
            { id: 'paths-section', label: 'Similar paths', Icon: TrendingUp },
            {
              id: 'analysis-section',
              label: 'Analysis',
              Icon: BarChart3,
              visible: analysisInsights != null,
            },
          ]}
        />

        <SectionAnchor id="paths-section" className="block">
          <div className="mb-4">
            <h3 className="font-heading text-xl font-bold text-slate-900">Similar career journeys</h3>
            <p className="text-slate-600">
              People who share concrete background with {userProfile.name?.split(' ')[0] || 'them'} and
              reached the goal.
            </p>
          </div>
          <CareerPathTimeline
            journeys={careerJourneys}
            maxJourneys={10}
            userProfile={null}
            goalTitle={goalTitle}
          />
        </SectionAnchor>

        {analysisInsights ? (
          <SectionAnchor id="analysis-section" className="mt-12 block">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-slate-900">Career analysis</h3>
              <p className="text-slate-600">
                {insightsFromAi
                  ? 'AI-powered patterns and experience distribution.'
                  : 'Experience distribution from this trace (AI narrative was not saved).'}
              </p>
            </div>
            <InsightsPanel
              insights={analysisInsights}
              journeys={careerJourneys}
              goalTitle={goalTitle}
              aiPowered={insightsFromAi}
            />
          </SectionAnchor>
        ) : null}
      </main>

      <footer className="mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 py-6 text-center text-slate-600">
          <PoweredByCrustData />
          <p className="text-sm">
            <span className="font-heading font-semibold text-slate-800">CareerTrace.AI</span>
            {' · '}
            Want your own trace?{' '}
            <button
              type="button"
              onClick={() => router.push('/', { scroll: true })}
              className="font-medium text-teal-700 underline-offset-2 hover:underline"
            >
              Run one in 30 seconds
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
