'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/brand/SiteHeader';
import { TracingProgress } from '@/components/home/TracingProgress';
import { HeroVisual } from '@/components/home/HeroVisual';
import { PoweredByCrustData } from '@/components/brand/PoweredByCrustData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles, AlertCircle, Play, Target, Database, Brain, Share2, GraduationCap } from 'lucide-react';

const DEMO_PROFILES = [
  {
    label: 'Engineer → Product Manager',
    linkedinUrl: 'https://www.linkedin.com/in/williamhgates/',
    goalTitle: 'Product Manager',
  },
  {
    label: 'Eng IC → Engineering Manager',
    linkedinUrl: 'https://www.linkedin.com/in/jeffweiner08/',
    goalTitle: 'Engineering Manager',
  },
  {
    label: 'Analyst → Data Scientist',
    linkedinUrl: 'https://www.linkedin.com/in/satyanadella/',
    goalTitle: 'Data Scientist',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const runTrace = async (urlOverride?: string, goalOverride?: string) => {
    setError('');

    const url = (urlOverride ?? linkedinUrl).trim();
    const goal = (goalOverride ?? goalTitle).trim();

    if (!url || !goal) {
      setError('Please fill in all required fields');
      return;
    }

    if (!url.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/career-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userLinkedInUrl: url, goalTitle: goal }),
      });

      const data = await response.json();

      if (!response.ok) {
        const base = data.error || 'Something went wrong';
        const extra =
          typeof data.detail === 'string' && data.detail.trim()
            ? `\n\n${data.detail}`
            : '';
        throw new Error(base + extra);
      }

      try {
        sessionStorage.setItem('careerPathResults', JSON.stringify(data.data));
      } catch (storageErr) {
        if (
          storageErr instanceof DOMException &&
          (storageErr.name === 'QuotaExceededError' || storageErr.code === 22)
        ) {
          throw new Error(
            'Your browser could not save the trace (storage full). Close other tabs or clear site data for localhost, then try again.'
          );
        }
        throw storageErr;
      }
      router.push('/results', { scroll: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze career path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runTrace();
  };

  const handleDemo = async (preset: typeof DEMO_PROFILES[number]) => {
    setLinkedinUrl(preset.linkedinUrl);
    setGoalTitle(preset.goalTitle);
    await runTrace(preset.linkedinUrl, preset.goalTitle);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/35 to-sky-50/50 dark:from-slate-950 dark:via-teal-950/35 dark:to-sky-950/50">
      {/* Soft mesh gradient backdrop */}
      <div
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl motion-safe:animate-career-float dark:bg-teal-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl motion-safe:animate-career-float [animation-delay:1.5s] dark:bg-sky-500/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-100/30 blur-3xl dark:bg-cyan-500/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-10 top-[60vh] h-72 w-72 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
        aria-hidden
      />

      {/* Subtle dot grid for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse at center top, black 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center top, black 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <SiteHeader variant="home" />

      {isLoading && <TracingProgress goalTitle={goalTitle} />}

      <main className="relative container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center md:mb-16">
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-teal-800 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-teal-300 hover:shadow-md dark:border-teal-700/60 dark:bg-slate-900/70 dark:text-teal-200">
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              Real careers • AI-matched paths
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-slate-900 md:text-5xl lg:text-6xl dark:text-slate-100">
              Trace your next move from
              <span className="mt-2 block bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 bg-clip-text text-transparent motion-safe:animate-career-shimmer dark:from-teal-400 dark:via-sky-400 dark:to-blue-400">
                people who made the jump
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed tracking-tight text-slate-600 md:text-xl dark:text-slate-400">
              Explore real paths from LinkedIn — timelines, shared schools and employers, and concise insights.
            </p>
          </div>

          {/* Hero visual: stylized career path graph */}
          <div className="mx-auto mb-12 max-w-4xl px-2 md:mb-16">
            <HeroVisual />
          </div>

          {/* Trust band — quick stats so judges immediately see the scope */}
          <div className="mx-auto mb-14 grid max-w-3xl grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:gap-6 md:p-5 dark:border-slate-700/80 dark:bg-slate-900/70">
            {[
              { value: 'Cascade search', label: 'Same company → school → city → goal', icon: Database, color: 'text-teal-700' },
              { value: 'Honest matches', label: 'Every result shows the tier it was found in', icon: Brain, color: 'text-sky-700' },
              { value: 'Women role models', label: 'Curated mentors in every trace', icon: Share2, color: 'text-rose-700' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 md:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-14 grid gap-6 md:grid-cols-3">
            <Card className="group border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-teal-600/50">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="font-heading text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Real career paths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Journeys from LinkedIn data — not generic job ladders.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-amber-600/50">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="font-heading text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Shared anchors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Each match shows exactly which school, employer, or stage you share — explainable, not magic.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-emerald-600/50">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="font-heading text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Open-to-mentor mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
                  We surface people who actually offer mentorship — not just role-models you can&apos;t reach.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="group/card border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-teal-900/10 dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/30 dark:hover:shadow-teal-900/20">
            <CardHeader className="space-y-2">
              <CardTitle className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-900 md:text-3xl dark:text-slate-100">
                Start tracing
              </CardTitle>
              <CardDescription className="font-display text-base text-slate-600 dark:text-slate-400">
                LinkedIn URL and goal role — we normalize similar titles (e.g. SDE III ≈ Senior Software Developer).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2.5">
                  <Label
                    htmlFor="linkedin"
                    className="font-display text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100"
                  >
                    LinkedIn profile URL <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="linkedin.com/in/…"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    disabled={isLoading}
                    className="font-display h-12 rounded-xl border-slate-200/90 bg-white/80 text-base tracking-tight shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-teal-200/80 hover:shadow-md focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/25 dark:border-slate-600 dark:bg-slate-950/50 dark:hover:border-teal-700/60"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="goal"
                    className="font-display text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100"
                  >
                    Goal role <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="goal"
                    type="text"
                    placeholder="Software Engineer III, PM, Data Scientist…"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    disabled={isLoading}
                    className="font-display h-12 rounded-xl border-slate-200/90 bg-white/80 text-base tracking-tight shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-sky-200/80 hover:shadow-md focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600 dark:bg-slate-950/50 dark:hover:border-sky-700/60"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50/80 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-red-100 p-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading mb-2 font-semibold text-red-900">Something went wrong</h4>
                        <p className="mb-3 text-sm leading-relaxed text-red-800">{error}</p>
                        <div className="flex flex-wrap gap-2 rounded-lg border border-orange-200 bg-white/70 p-3 dark:border-orange-900/40 dark:bg-slate-900/40">
                          {['Senior Software Engineer', 'Product Manager', 'Data Scientist', 'Engineering Manager'].map(
                            (title) => (
                              <button
                                key={title}
                                type="button"
                                onClick={() => setGoalTitle(title)}
                                className="font-display rounded-lg border border-teal-200 bg-teal-50/90 px-2.5 py-1.5 text-xs font-medium text-teal-800 transition-all duration-200 hover:border-teal-400 hover:bg-teal-100 hover:shadow-sm active:scale-[0.98] dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-100 dark:hover:bg-teal-900/80"
                              >
                                {title}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="font-display h-14 w-full rounded-xl bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-lg font-semibold tracking-tight text-white shadow-lg transition-all duration-300 hover:from-teal-700 hover:via-sky-700 hover:to-blue-700 hover:shadow-xl hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Tracing paths…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Trace my career path
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-700/80">
                <p className="mb-3 flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <Play className="h-3 w-3 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                  Demo traces
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_PROFILES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleDemo(preset)}
                      disabled={isLoading}
                      className="font-display rounded-full border border-teal-200/90 bg-teal-50/90 px-3.5 py-2 text-xs font-medium text-teal-900 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-teal-400 hover:bg-teal-100 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-100 dark:hover:bg-teal-900/70"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-20">
            <div className="text-center">
              <h3 className="font-heading mb-3 text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">
                How it works
              </h3>
              <p className="mx-auto mb-10 max-w-2xl text-slate-600 dark:text-slate-400">
                Four steps. No mocks, no scraped lists — every profile is enriched live from LinkedIn.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Your profile',
                  desc: 'Paste your LinkedIn URL — we enrich it via CrustData.',
                  color: 'from-teal-400 to-teal-600',
                  accent: 'border-teal-200 bg-teal-50/40',
                  Icon: GraduationCap,
                },
                {
                  step: '02',
                  title: 'Your goal',
                  desc: 'Tell us the role you want to reach.',
                  color: 'from-sky-400 to-blue-600',
                  accent: 'border-sky-200 bg-sky-50/40',
                  Icon: Target,
                },
                {
                  step: '03',
                  title: 'Similar paths',
                  desc: 'We rank real people who reached that goal from a start like yours.',
                  color: 'from-violet-400 to-indigo-600',
                  accent: 'border-violet-200 bg-violet-50/40',
                  Icon: Users,
                },
                {
                  step: '04',
                  title: 'Insights & mentors',
                  desc: 'AI layers on patterns, skills gaps, and outreach drafts.',
                  color: 'from-amber-400 to-orange-500',
                  accent: 'border-amber-200 bg-amber-50/40',
                  Icon: Sparkles,
                },
              ].map((item, idx) => (
                <div
                  key={item.step}
                  className={`group relative overflow-hidden rounded-2xl border ${item.accent} p-5 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`}
                >
                  {/* Step number watermark */}
                  <span className="font-heading pointer-events-none absolute -right-2 -top-3 text-7xl font-extrabold text-slate-900/[0.04] dark:text-white/[0.06]">
                    {item.step}
                  </span>
                  <div
                    className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                  >
                    <item.Icon className="h-6 w-6" />
                  </div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Step {idx + 1}
                  </p>
                  <h4 className="font-heading mt-1 mb-1.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative mt-20 border-t border-slate-200/80 bg-white/60 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <PoweredByCrustData />
          <p className="text-sm">
            <span className="font-heading font-semibold text-slate-800 dark:text-slate-200">CareerTrace.AI</span>
            {' · '}
            Powered by <span className="font-medium text-sky-600">AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
