'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, Copy, Loader2, Share2 } from 'lucide-react';
import type {
  CareerInsights,
  CareerJourney,
  LinkedInProfile,
} from '@/lib/types';

interface ShareTraceButtonProps {
  userProfile: LinkedInProfile | null;
  careerJourneys: CareerJourney[];
  insights: CareerInsights | null;
  goalTitle: string;
  goalCompany?: string | null;
  goalIndustry?: string | null;
  userLinkedInUrl?: string;
  /** Disable until results have rendered so the snapshot is complete. */
  enabled?: boolean;
}

export function ShareTraceButton({
  userProfile,
  careerJourneys,
  insights,
  goalTitle,
  goalCompany,
  goalIndustry,
  userLinkedInUrl,
  enabled = true,
}: ShareTraceButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createShare = async () => {
    if (!userProfile || careerJourneys.length === 0) {
      setError('Wait for the trace to finish loading before sharing.');
      return;
    }
    setLoading(true);
    setError(null);
    setShareUrl(null);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          careerJourneys,
          insights,
          goalTitle,
          goalCompany,
          goalIndustry,
          userLinkedInUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not create share link');
      const id = (json.data as { id: string }).id;
      const url = `${window.location.origin}/trace/${id}`;
      setShareUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!shareUrl && !loading) {
      void createShare();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!enabled || careerJourneys.length === 0}
        onClick={handleOpen}
        className="font-heading border-teal-200 text-teal-800 hover:bg-teal-50"
      >
        <Share2 className="mr-1.5 h-4 w-4" />
        Share trace
      </Button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Share this trace</DialogTitle>
            <DialogDescription>
              A read-only snapshot. Anyone with the link can view it for 30 days. No login required.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              Saving snapshot…
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                {error}
              </div>
              <Button onClick={createShare} className="w-full" variant="outline">
                Try again
              </Button>
            </div>
          ) : shareUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="h-11 border-slate-200 font-mono text-xs text-slate-700"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  onClick={copy}
                  className="font-heading h-11 shrink-0 bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Shared trace includes the journeys, AI insights, and shared-background chips.
                It will not re-run AI when opened.
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={handleClose} className="text-slate-600">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
