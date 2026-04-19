'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TracingProgress } from '@/components/home/TracingProgress';
import { Sparkles, AlertCircle, Target, ArrowRight } from 'lucide-react';

interface TraceYourFriendBoxProps {
  /** Pre-filled goal title from the shared trace — viewer is comparing against the SAME goal. */
  goalTitle: string;
  /** Name of the person whose trace this is — so we can say "compare against {name}". */
  ownerName?: string;
  /** Trace id (from the URL) — let us link back from the viewer's results page. */
  traceId?: string;
  /**
   * Snapshot of owner stats so we can render a compact compare banner on
   * the viewer's /results page without re-fetching the original trace.
   */
  ownerSnapshot?: {
    avgPathMatch?: number;
    avgAffinity?: number;
    pathsCount?: number;
    mentorsCount?: number;
    profilePictureUrl?: string;
  };
}

/** sessionStorage key the /results page reads to render the compare banner. */
export const COMPARE_CONTEXT_KEY = 'careerPathCompareContext';

export interface CompareContext {
  ownerName?: string;
  traceId: string;
  goalTitle: string;
  ownerSnapshot?: TraceYourFriendBoxProps['ownerSnapshot'];
}

/**
 * Inline form on a shared trace page that lets the VIEWER paste their own
 * LinkedIn URL and immediately run a fresh trace against the same goal.
 *
 * This closes the viral loop: shared trace -> "what would mine look like?"
 * -> new trace -> new shareable link.
 */
export function TraceYourFriendBox({
  goalTitle,
  ownerName,
  traceId,
  ownerSnapshot,
}: TraceYourFriendBoxProps) {
  const router = useRouter();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [editableGoal, setEditableGoal] = useState(goalTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = linkedinUrl.trim();
    const goal = editableGoal.trim();

    if (!url || !goal) {
      setError('Add your LinkedIn URL to compare your trace.');
      return;
    }
    if (!url.includes('linkedin.com/in/')) {
      setError('That doesn\u2019t look like a LinkedIn profile URL.');
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
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      try {
        sessionStorage.setItem('careerPathResults', JSON.stringify(data.data));
      } catch (storageErr) {
        if (
          storageErr instanceof DOMException &&
          (storageErr.name === 'QuotaExceededError' || storageErr.code === 22)
        ) {
          throw new Error(
            'Your browser could not save the trace (storage full). Try again after closing other tabs or clearing site data.'
          );
        }
        throw storageErr;
      }
      // Stash the comparison context so /results can render a "vs. {owner}" banner.
      if (traceId) {
        const ctx: CompareContext = {
          ownerName,
          traceId,
          goalTitle: goal,
          ownerSnapshot,
        };
        sessionStorage.setItem(COMPARE_CONTEXT_KEY, JSON.stringify(ctx));
      } else {
        sessionStorage.removeItem(COMPARE_CONTEXT_KEY);
      }
      router.push('/results', { scroll: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not run your trace. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <TracingProgress goalTitle={editableGoal} />}

      <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 shadow-xl shadow-amber-900/5">
        {/* Decorative gradient blob */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl"
          aria-hidden
        />

        <CardContent className="relative p-6 md:p-8">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-xl font-bold text-slate-900 md:text-2xl">
                What would <span className="text-amber-700">your</span> trace look like?
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 md:text-base">
                You're looking at {ownerName ? `${ownerName}'s` : 'someone\u2019s'} path to{' '}
                <span className="font-semibold text-slate-900">{goalTitle}</span>. Drop your LinkedIn
                below to see how your own journey compares — same pipeline, takes about 30 seconds.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1.6fr_1fr] md:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="friend-linkedin" className="text-sm font-medium text-slate-700">
                  Your LinkedIn URL
                </Label>
                <Input
                  id="friend-linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-11 border-slate-200 bg-white/90 text-sm transition-all duration-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="friend-goal" className="text-sm font-medium text-slate-700">
                  Compare against
                </Label>
                <div className="relative">
                  <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
                  <Input
                    id="friend-goal"
                    type="text"
                    value={editableGoal}
                    onChange={(e) => setEditableGoal(e.target.value)}
                    disabled={isLoading}
                    className="h-11 border-slate-200 bg-white/90 pl-9 text-sm transition-all duration-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                disabled={isLoading}
                className="font-heading h-12 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-base font-semibold text-white shadow-lg transition-all hover:from-amber-700 hover:via-orange-700 hover:to-rose-700 hover:shadow-xl active:scale-[0.99] disabled:opacity-70 sm:w-auto sm:min-w-[260px]"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Tracing your path…
                  </>
                ) : (
                  <>
                    Run my trace
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 sm:max-w-xs sm:text-right">
                We'll enrich your profile and find people who reached{' '}
                <span className="font-medium text-slate-700">{editableGoal || goalTitle}</span> from
                a starting point like yours.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
