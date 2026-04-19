'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import type { CareerJourney, Education, Employer, LinkedInProfile } from '@/lib/types';
import { companyNameFromLinkedInCompanyUrl } from '@/lib/api/normalize-profile';
import { parseCareerDate, estimateYearsFromEmployers } from '@/lib/career/tenure';
import {
  overlapForEducation,
  overlapForEmployer,
  countOverlaps,
  type JourneyOverlap,
} from '@/lib/career/journey-overlap';

interface JourneyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journey: CareerJourney;
  userProfile: LinkedInProfile | null;
  goalTitle: string;
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'] as const;

function jobTitle(job: Employer): string {
  return job.title?.trim() || '—';
}
function companyLine(job: Employer): string {
  const n = job.name?.trim();
  if (n) return n;
  if (job.company_linkedin_profile_url) {
    const fromUrl = companyNameFromLinkedInCompanyUrl(job.company_linkedin_profile_url);
    if (fromUrl) return fromUrl;
  }
  return '—';
}
function formatMonthYear(iso: string): string {
  const d = parseCareerDate(iso);
  if (!d) {
    const s = iso.trim();
    return s.length > 16 ? `${s.slice(0, 10)}…` : s.replace('T', ' ').slice(0, 16);
  }
  return `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function dateRangeLine(job: Employer): string | null {
  const a = job.start_date?.trim();
  const b = job.end_date?.trim();
  if (!a && !b) return null;
  if (a && b) return `${formatMonthYear(a)} – ${formatMonthYear(b)}`;
  if (a) return `${formatMonthYear(a)} – Present`;
  if (b) return `Until ${formatMonthYear(b)}`;
  return null;
}
function educationDateRange(edu: Education): string | null {
  const a = edu.start_date?.trim();
  const b = edu.end_date?.trim();
  if (!a && !b) return null;
  if (a && b) return `${formatMonthYear(a)} – ${formatMonthYear(b)}`;
  if (a) return `${formatMonthYear(a)} – Present`;
  if (b) return `Until ${formatMonthYear(b)}`;
  return null;
}
function sortTimeMs(start?: string, end?: string): number {
  const s = parseCareerDate(start);
  if (s) return s.getTime();
  const e = parseCareerDate(end);
  return e ? e.getTime() : 0;
}
function educationHeadline(edu: Education): string {
  const parts = [edu.degree_name, edu.field_of_study].filter((s) => s?.trim());
  return parts.length ? parts.join(' · ') : 'Education';
}

type TimelineEntry =
  | { kind: 'education'; data: Education; sortTime: number }
  | { kind: 'work'; data: Employer; sortTime: number };

function buildTimeline(profile: LinkedInProfile): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  for (const e of profile.education_background ?? []) {
    out.push({ kind: 'education', data: e, sortTime: sortTimeMs(e.start_date, e.end_date) });
  }
  for (const j of profile.all_employers ?? []) {
    out.push({ kind: 'work', data: j, sortTime: sortTimeMs(j.start_date, j.end_date) });
  }
  out.sort((a, b) => {
    if (b.sortTime !== a.sortTime) return b.sortTime - a.sortTime;
    if (a.kind !== b.kind) return a.kind === 'education' ? -1 : 1;
    return 0;
  });
  return out;
}

interface OutreachDraft {
  subject: string;
  message: string;
  rationale: string;
}

function TimelineRow({
  showLine,
  dot,
  overlap,
  children,
}: {
  showLine: boolean;
  dot: React.ReactNode;
  overlap: JourneyOverlap | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        {dot}
        {showLine ? (
          <div className="mt-1 min-h-[1.75rem] w-0.5 flex-1 bg-slate-300 dark:bg-slate-700" />
        ) : null}
      </div>
      <div
        className={`flex-1 pb-3 ${
          overlap
            ? 'rounded-lg border border-amber-300 bg-amber-50/70 px-3 py-2 shadow-sm dark:border-amber-700/60 dark:bg-amber-900/20'
            : ''
        }`}
      >
        {overlap ? (
          <Badge
            variant="secondary"
            className="font-heading mb-1.5 gap-1 border-amber-300 bg-amber-100 text-[10px] font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
            title={`You: ${overlap.matchedUserValue}`}
          >
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            {overlap.label}
          </Badge>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function JourneyDetailDialog({
  open,
  onOpenChange,
  journey,
  userProfile,
  goalTitle,
}: JourneyDetailDialogProps) {
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState<'subject' | 'message' | 'all' | null>(null);

  const candidate = journey.profile;
  const timeline = buildTimeline(candidate);
  const yearsExp =
    estimateYearsFromEmployers(candidate.all_employers) ||
    Math.round(candidate.years_of_experience_raw ?? journey.path_highlights?.total_years ?? 0);
  const overlapTotal = countOverlaps(candidate, userProfile);

  const generate = async () => {
    if (!userProfile) return;
    setOutreachLoading(true);
    setOutreachError(null);
    try {
      const res = await fetch('/api/mentor/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, mentorProfile: candidate, goalTitle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not generate draft');
      const d = json.data as OutreachDraft;
      setDraft(d);
      setSubject(d.subject);
      setMessage(d.message);
    } catch (e) {
      setOutreachError(e instanceof Error ? e.message : 'Could not generate draft');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleOpenOutreach = () => {
    setOutreachOpen(true);
    if (!draft && !outreachLoading && userProfile) void generate();
  };

  const copyText = async (text: string, kind: 'subject' | 'message' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setOutreachError('Could not copy to clipboard.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl !w-[min(96vw,52rem)] max-h-[90vh] overflow-y-auto bg-white text-slate-900 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700">
        <div className="flex items-start gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <Avatar className="h-14 w-14 ring-2 ring-teal-100 dark:ring-teal-900/40">
            <AvatarImage src={candidate.profile_picture_url} />
            <AvatarFallback className="bg-gradient-to-br from-teal-600 to-sky-600 font-heading text-sm font-bold text-white">
              {candidate.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-heading text-xl text-slate-900 dark:text-slate-100">
              {candidate.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
              {candidate.headline || candidate.current_title}
              {candidate.current_company ? ` · ${candidate.current_company}` : ''}
            </DialogDescription>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              {yearsExp > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {yearsExp} yrs experience
                </span>
              ) : null}
              {candidate.region || candidate.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {candidate.region || candidate.location}
                </span>
              ) : null}
              <Badge
                variant="secondary"
                className="border-teal-200 bg-teal-50 font-heading text-teal-900 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
              >
                {journey.similarity.overall_score}% path match
              </Badge>
            </div>
          </div>
        </div>

        {journey.source_tier ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-900/50 dark:bg-rose-950/40">
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-100">
              <span className="mr-2 inline-block rounded-md bg-rose-200 px-1.5 py-0.5 font-bold dark:bg-rose-800 dark:text-rose-100">
                Tier {journey.source_tier.tier}
              </span>
              Found via: {journey.source_tier.label}
              {journey.source_tier.via_label ? ` (${journey.source_tier.via_label})` : ''}
              {journey.source_tier.population_count > 0 ? (
                <span className="ml-1 font-normal text-rose-800 dark:text-rose-200">
                  · 1 of {journey.source_tier.population_count.toLocaleString()} matches
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {/* Why-this-path */}
        <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50/60 p-4 dark:border-teal-900/40 dark:from-teal-950/30 dark:to-sky-950/20">
          <p className="font-heading flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Why this path is similar
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {journey.similarity.reasoning}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-teal-100 pt-3 sm:grid-cols-4 dark:border-teal-900/40">
            {[
              { label: 'Education', value: journey.similarity.education_match },
              { label: 'Early career', value: journey.similarity.early_career_match },
              { label: 'Industry', value: journey.similarity.industry_match },
              { label: 'Skills', value: journey.similarity.skills_match },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="font-heading text-2xl font-bold text-teal-700 dark:text-teal-300">{m.value}%</div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full journey */}
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h4 className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
                Full journey
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Schools, degrees, and every role — newest first. {userProfile ? 'Items shaded amber overlap with your profile.' : ''}
              </p>
            </div>
            {overlapTotal > 0 ? (
              <Badge
                variant="secondary"
                className="font-heading shrink-0 gap-1 border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
              >
                <Star className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                {overlapTotal} overlap{overlapTotal === 1 ? '' : 's'} with you
              </Badge>
            ) : null}
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No history available.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((entry, i, arr) => {
                const showLine = i < arr.length - 1;
                if (entry.kind === 'education') {
                  const edu = entry.data;
                  const when = educationDateRange(edu);
                  const overlap = overlapForEducation(edu, userProfile);
                  return (
                    <TimelineRow
                      key={`edu-${i}`}
                      showLine={showLine}
                      dot={
                        <div
                          className={`h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-950 ${
                            overlap
                              ? 'bg-amber-500 ring-amber-200 dark:ring-amber-700'
                              : i === 0
                                ? 'bg-violet-500'
                                : 'bg-violet-300 dark:bg-violet-600'
                          }`}
                        />
                      }
                      overlap={overlap}
                    >
                      <Badge
                        variant="secondary"
                        className="mb-1 border-violet-200 bg-violet-50 text-[10px] font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                      >
                        Education
                      </Badge>
                      <h5 className="font-medium text-slate-900 dark:text-slate-100">
                        {educationHeadline(edu)}
                      </h5>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" aria-hidden />
                        <span>{edu.institute_name?.trim() || '—'}</span>
                      </p>
                      {when ? (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{when}</p>
                      ) : null}
                    </TimelineRow>
                  );
                }
                const job = entry.data;
                const when = dateRangeLine(job);
                const overlap = overlapForEmployer(job, userProfile);
                return (
                  <TimelineRow
                    key={`job-${i}`}
                    showLine={showLine}
                    dot={
                      <div
                        className={`h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-950 ${
                          overlap
                            ? 'bg-amber-500 ring-amber-200 dark:ring-amber-700'
                            : i === 0
                              ? 'bg-teal-500'
                              : 'bg-sky-500 dark:bg-sky-400'
                        }`}
                      />
                    }
                    overlap={overlap}
                  >
                    <Badge
                      variant="secondary"
                      className="mb-1 border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Work
                    </Badge>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="font-medium text-slate-900 dark:text-slate-100">{jobTitle(job)}</h5>
                        <p className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />
                          <span>{companyLine(job)}</span>
                        </p>
                      </div>
                      {(job.duration_months != null || job.years_at_company_raw != null) && (
                        <Badge variant="outline" className="shrink-0 text-xs dark:border-slate-700 dark:text-slate-200">
                          {job.duration_months != null
                            ? `${Math.max(1, Math.round(job.duration_months / 12))}y`
                            : `${Math.round((job.years_at_company_raw ?? 0) * 10) / 10}y`}
                        </Badge>
                      )}
                    </div>
                    {when ? (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{when}</p>
                    ) : null}
                  </TimelineRow>
                );
              })}
            </div>
          )}
        </div>

        {/* Key decisions */}
        {journey.similarity.key_decisions.length > 0 && (
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3 dark:border-teal-900/40 dark:bg-teal-950/30">
            <h4 className="font-heading mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Key career decisions
            </h4>
            <ul className="space-y-1.5">
              {journey.similarity.key_decisions.map((d, i) => (
                <li key={i} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                  <span className="mr-2 mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outreach */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          {!outreachOpen ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Reach out to {candidate.name?.split(' ')[0] || 'them'}?
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  We&apos;ll draft a personalized intro based on your overlap.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleOpenOutreach}
                disabled={!userProfile}
                className="font-heading bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Draft an intro message
              </Button>
              {candidate.linkedin_profile_url ? (
                <a
                  href={candidate.linkedin_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Open LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          ) : outreachLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-700 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
              Drafting a personal note…
            </div>
          ) : outreachError ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {outreachError}
              </div>
              <Button variant="outline" size="sm" onClick={generate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : draft ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-10 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-medium text-slate-700 dark:text-slate-300">
                  Message
                </Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={generate} className="dark:border-slate-700 dark:text-slate-200">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={() => copyText(`${subject}\n\n${message}`, 'all')}
                  className="font-heading bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
                >
                  {copied === 'all' ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy subject + message
                    </>
                  )}
                </Button>
                {candidate.linkedin_profile_url ? (
                  <a
                    href={candidate.linkedin_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-heading inline-flex h-9 items-center justify-center gap-1 rounded-md border border-teal-200 bg-white px-3 text-xs font-medium text-teal-800 hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-200 dark:hover:bg-slate-800"
                  >
                    Open LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
