'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scrollToTop } from '@/lib/utils';
import { normalizeLinkedInProfile } from '@/lib/api/normalize-profile';
import { JourneyCardCompact } from '@/components/career/JourneyCardCompact';
import { InsightsPanel } from '@/components/career/InsightsPanel';
import { SearchScopePanel } from '@/components/career/SearchScopePanel';
import { PoweredByCrustData } from '@/components/brand/PoweredByCrustData';
import { CompareBanner } from '@/components/share/CompareBanner';
import { ShareTraceButton } from '@/components/share/ShareTraceButton';
import { SiteHeader } from '@/components/brand/SiteHeader';
import { WomenMentorsSidebar } from '@/components/results/WomenMentorsSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, BarChart3, Search } from 'lucide-react';
import { CareerJourney, CareerInsights, CareerPathSearchStats, LinkedInProfile } from '@/lib/types';
import { buildFallbackInsights } from '@/lib/career/fallback-insights';

export default function ResultsPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<LinkedInProfile | null>(null);
  const [careerJourneys, setCareerJourneys] = useState<CareerJourney[]>([]);
  const [insights, setInsights] = useState<CareerInsights | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCompany, setGoalCompany] = useState<string | null>(null);
  const [goalIndustry, setGoalIndustry] = useState<string | null>(null);
  const [userLinkedInUrl, setUserLinkedInUrl] = useState<string | undefined>(undefined);
  const [alreadyAtGoalMessage, setAlreadyAtGoalMessage] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<CareerPathSearchStats | null>(null);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const resultsData = sessionStorage.getItem('careerPathResults');

    if (!resultsData) {
      router.replace('/');
      return;
    }

    try {
      const data = JSON.parse(resultsData) as Record<string, unknown>;

      if (!data.userProfile || typeof data.userProfile !== 'object') {
        setLoadError(
          'We could not read your profile from this session. Run a new trace from the home page.'
        );
        setPageState('error');
        return;
      }

      const up = normalizeLinkedInProfile(data.userProfile as LinkedInProfile);
      setUserProfile(up);

      const raw = Array.isArray(data.careerJourneys) ? data.careerJourneys : [];
      const journeys: CareerJourney[] = [];
      for (const j of raw as CareerJourney[]) {
        try {
          if (!j?.profile) continue;
          journeys.push({
            ...j,
            profile: normalizeLinkedInProfile(j.profile),
          });
        } catch {
          /* skip malformed journey row */
        }
      }
      setCareerJourneys(journeys);
      setInsights((data.insights as CareerInsights | null | undefined) ?? null);
      setGoalTitle(typeof data.goalTitle === 'string' ? data.goalTitle : '');
      setGoalCompany((data.goalCompany as string | null | undefined) ?? null);
      setGoalIndustry((data.goalIndustry as string | null | undefined) ?? null);
      setUserLinkedInUrl(data.userLinkedInUrl as string | undefined);
      setAlreadyAtGoalMessage(
        data.alreadyAtGoal === true
          ? typeof data.message === 'string'
            ? data.message
            : null
          : null
      );
      setSearchStats((data.searchStats as CareerPathSearchStats | null | undefined) ?? null);
      setPageState('ready');
    } catch (error) {
      console.error('Error loading results:', error);
      setLoadError(
        'Your results could not be loaded. If this keeps happening, restart the dev server or run a new trace from the home page.'
      );
      setPageState('error');
    }
  }, [router]);

  useLayoutEffect(() => {
    if (pageState === 'ready' && userProfile) {
      scrollToTop();
    }
  }, [pageState, userProfile]);

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-teal-50/30 to-sky-50/40 dark:from-slate-950 dark:via-teal-950/30 dark:to-sky-950/40">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600 dark:border-teal-800 dark:border-t-teal-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading your trace…</p>
        </div>
      </div>
    );
  }

  const analysisInsights: CareerInsights | null =
    careerJourneys.length > 0
      ? insights ?? buildFallbackInsights(careerJourneys, goalTitle)
      : null;
  const insightsFromAi = insights != null;

  if (pageState === 'error' || !userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-50 via-teal-50/30 to-sky-50/40 px-4 dark:from-slate-950 dark:via-teal-950/30 dark:to-sky-950/40">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white/95 p-8 text-center shadow-lg dark:border-amber-900/50 dark:bg-slate-900/90">
          <p className="font-heading mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Could not show results
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {loadError ||
              'Something went wrong loading this page. Try running a new trace from the home page.'}
          </p>
          <button
            type="button"
            onClick={() => router.replace('/', { scroll: true })}
            className="font-heading mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/35 to-sky-50/50 font-inter dark:from-slate-950 dark:via-teal-950/35 dark:to-sky-950/50">
      <div
        className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
        aria-hidden
      />

      <SiteHeader variant="app" onNewSearch={() => router.push('/', { scroll: true })} />

      <main className="relative container mx-auto px-4 py-8">
        {alreadyAtGoalMessage ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/95 px-5 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-heading mb-1 text-base font-semibold text-amber-900 dark:text-amber-200">
              You&apos;re already at this goal.
            </p>
            <p>{alreadyAtGoalMessage}</p>
            <button
              type="button"
              onClick={() => router.push('/', { scroll: true })}
              className="font-heading mt-3 inline-flex h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
            >
              Pick a different goal
            </button>
          </div>
        ) : null}

        {/* Hero card — compact user summary */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-teal-50/40 to-sky-50/40 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800 dark:from-slate-900 dark:via-teal-950/20 dark:to-sky-950/20 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {userProfile.profile_picture_url ? (
                <img
                  src={userProfile.profile_picture_url}
                  alt={userProfile.name}
                  className="h-14 w-14 shrink-0 rounded-full shadow-md ring-4 ring-white dark:ring-slate-800"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-600 font-heading text-lg font-bold text-white shadow-md ring-4 ring-white dark:ring-slate-800">
                  {userProfile.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                  Your trace
                  {goalTitle ? (
                    <>
                      {' '}to{' '}
                      <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                        {goalTitle}
                      </span>
                    </>
                  ) : null}
                </h2>
                <p className="mt-0.5 truncate text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{userProfile.name}</span>
                  {' · '}
                  {userProfile.current_title}
                  {userProfile.current_company ? ` at ${userProfile.current_company}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-teal-800 dark:border-teal-800 dark:bg-slate-800 dark:text-teal-200">
                    <TrendingUp className="h-3 w-3" />
                    {careerJourneys.length} similar paths
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-sky-800 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-200">
                    <Users className="h-3 w-3" />
                    Based on {careerJourneys.length} profiles
                  </span>
                  {searchStats ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-rose-800 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-200">
                      <Search className="h-3 w-3" />
                      from {searchStats.totalPopulationCount.toLocaleString()} people
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <ShareTraceButton
                userProfile={userProfile}
                careerJourneys={careerJourneys}
                insights={insights}
                goalTitle={goalTitle}
                goalCompany={goalCompany}
                goalIndustry={goalIndustry}
                userLinkedInUrl={userLinkedInUrl}
                enabled={careerJourneys.length > 0}
              />
            </div>
          </div>
        </div>

        <CompareBanner
          viewerProfile={userProfile}
          viewerJourneys={careerJourneys}
        />

        {careerJourneys.length > 0 ? (
          <Tabs defaultValue="paths" className="!gap-0">
            <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
              <TabsList className="h-10 bg-slate-100/80 p-1 dark:bg-slate-800/60">
                <TabsTrigger value="paths" className="px-4 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Similar paths
                  <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                    {careerJourneys.length}
                  </span>
                </TabsTrigger>
                {analysisInsights ? (
                  <TabsTrigger value="analysis" className="px-4 text-sm">
                    <BarChart3 className="h-4 w-4" />
                    Analysis
                  </TabsTrigger>
                ) : null}
                {searchStats ? (
                  <TabsTrigger value="scope" className="px-4 text-sm">
                    <Search className="h-4 w-4" />
                    Search scope
                  </TabsTrigger>
                ) : null}
              </TabsList>
            </div>

            <TabsContent value="paths" className="outline-none">
              <div className="mb-5">
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-slate-100">
                  Similar career journeys
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Click <span className="font-semibold text-teal-700 dark:text-teal-300">View full journey</span> on any
                  card to see their complete timeline and draft a personalized intro message.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {careerJourneys.slice(0, 10).map((journey, idx) => (
                    <JourneyCardCompact
                      key={journey.profile.linkedin_profile_url || idx}
                      journey={journey}
                      userProfile={userProfile}
                      goalTitle={goalTitle}
                    />
                  ))}
                </div>
                <div className="lg:sticky lg:top-36 lg:self-start">
                  <WomenMentorsSidebar goalTitle={goalTitle} />
                </div>
              </div>
            </TabsContent>

            {analysisInsights ? (
              <TabsContent value="analysis" className="outline-none">
                <div className="mb-5">
                  <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-slate-100">
                    Career analysis
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Timeline and patterns across the {careerJourneys.length} journeys
                    {insightsFromAi ? ' — including AI-summarized takeaways.' : '.'}
                  </p>
                </div>
                <InsightsPanel
                  insights={analysisInsights}
                  journeys={careerJourneys}
                  goalTitle={goalTitle}
                  aiPowered={insightsFromAi}
                />
              </TabsContent>
            ) : null}

            {searchStats ? (
              <TabsContent value="scope" className="outline-none">
                <div className="mb-5">
                  <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-slate-100">
                    How we found these matches
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Our cascade search runs in tiers, from the most specific overlap to the most
                    general — so the people you see at the top genuinely share your background.
                  </p>
                </div>
                <SearchScopePanel stats={searchStats} />
              </TabsContent>
            ) : null}
          </Tabs>
        ) : !alreadyAtGoalMessage ? (
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-12 text-center text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-heading mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              No paths to show.
            </p>
            <p>Try a broader goal title (e.g. &quot;Product Manager&quot; instead of a niche variant).</p>
          </div>
        ) : null}
      </main>

      <footer className="mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
        <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 py-6 text-center text-slate-600 dark:text-slate-400">
          <PoweredByCrustData />
          <p className="text-sm">
            <span className="font-heading font-semibold text-slate-800 dark:text-slate-200">CareerTrace.AI</span>
            {' · '}
            AI-powered · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
