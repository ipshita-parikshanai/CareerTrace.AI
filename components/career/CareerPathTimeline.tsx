'use client';

import { useState } from 'react';
import {
  type Education,
  type Employer,
  type LinkedInProfile,
  CareerJourney,
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { companyNameFromLinkedInCompanyUrl } from '@/lib/api/normalize-profile';
import { parseCareerDate, estimateYearsFromEmployers } from '@/lib/career/tenure';
import { mentorshipBadgeLabel } from '@/lib/career/mentorship-signal';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Copy,
  GraduationCap,
  Handshake,
  Link2,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { RelevanceAnchor } from '@/lib/types';

interface CareerPathTimelineProps {
  journeys: CareerJourney[];
  maxJourneys?: number;
  /** Required for inline outreach drafts. Pass null on shared-trace pages. */
  userProfile?: LinkedInProfile | null;
  goalTitle?: string;
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
] as const;

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

type TimelineEntry =
  | { kind: 'education'; data: Education; sortTime: number }
  | { kind: 'work'; data: Employer; sortTime: number };

function buildFullTimeline(profile: LinkedInProfile): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  const eduBg = profile.education_background ?? [];

  for (const e of eduBg) {
    out.push({ kind: 'education', data: e, sortTime: sortTimeMs(e.start_date, e.end_date) });
  }

  if (eduBg.length === 0) {
    const schools = profile.all_schools ?? [];
    const degrees = profile.all_degrees ?? [];
    const n = Math.max(schools.length, degrees.length);
    for (let i = 0; i < n; i++) {
      const inst = schools[i]?.trim();
      if (!inst) continue;
      out.push({
        kind: 'education',
        data: { institute_name: inst, degree_name: degrees[i] },
        sortTime: 0,
      });
    }
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

function educationHeadline(edu: Education): string {
  const parts = [edu.degree_name, edu.field_of_study].filter((s) => s?.trim());
  return parts.length ? parts.join(' · ') : 'Education';
}

function anchorIcon(kind: RelevanceAnchor['kind']) {
  switch (kind) {
    case 'same_employer':
    case 'employer_tier':
    case 'starting_tier':
      return <Building2 className="h-3.5 w-3.5" />;
    case 'same_school':
    case 'school_tier_level':
    case 'field_at_level':
      return <GraduationCap className="h-3.5 w-3.5" />;
    case 'role_family':
      return <Handshake className="h-3.5 w-3.5" />;
    case 'same_region':
      return <MapPin className="h-3.5 w-3.5" />;
    default:
      return <Link2 className="h-3.5 w-3.5" />;
  }
}

function mentorshipBadgeClass(level: 'strong' | 'moderate' | 'teaching' | 'none'): string {
  switch (level) {
    case 'strong':
      return 'border-emerald-300 bg-emerald-100 text-emerald-900';
    case 'moderate':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'teaching':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

interface OutreachDraft {
  subject: string;
  message: string;
  rationale: string;
}

/**
 * Inline outreach drawer rendered at the bottom of every journey card.
 * Lazy-loaded — we only call /api/mentor/outreach when the user actually
 * clicks "Draft an intro message", so we don't pay for messages no one
 * reads.
 */
function InlineOutreach({
  candidateProfile,
  userProfile,
  goalTitle,
}: {
  candidateProfile: LinkedInProfile;
  userProfile: LinkedInProfile | null;
  goalTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copiedField, setCopiedField] = useState<'subject' | 'message' | 'all' | null>(null);

  const canGenerate = Boolean(userProfile && candidateProfile);

  const generate = async () => {
    if (!userProfile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          mentorProfile: candidateProfile,
          goalTitle,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not generate draft');
      const d = json.data as OutreachDraft;
      setDraft(d);
      setSubject(d.subject);
      setMessage(d.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate draft');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!draft && !loading && canGenerate) {
      void generate();
    }
  };

  const copyToClipboard = async (text: string, kind: 'subject' | 'message' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(kind);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  if (!canGenerate) return null;

  if (!open) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50/60 to-sky-50/40 p-4">
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold text-slate-900">
            Want to reach out to {candidateProfile.name?.split(' ')[0] || 'them'}?
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            We&apos;ll draft a short, specific intro message based on your shared background.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleOpen}
          className="font-heading bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          Draft an intro message
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="secondary" className="border-teal-200 bg-teal-50 font-heading text-teal-900">
          <Sparkles className="mr-1 h-3 w-3" />
          AI-drafted intro
        </Badge>
        <span className="text-xs text-slate-500">
          Personalized for {candidateProfile.name?.split(' ')[0] || 'this person'}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="ml-auto h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
          onClick={() => setOpen(false)}
        >
          Hide
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          Drafting a personal note based on your overlap…
        </div>
      ) : error ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={generate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : draft ? (
        <div className="space-y-4">
          {draft.rationale ? (
            <div className="rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold text-teal-900">Why this angle: </span>
              {draft.rationale}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`subject-${candidateProfile.linkedin_profile_url}`} className="font-heading text-xs font-medium text-slate-700">
                Subject
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] text-slate-600 hover:text-teal-700"
                onClick={() => copyToClipboard(subject, 'subject')}
              >
                {copiedField === 'subject' ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Input
              id={`subject-${candidateProfile.linkedin_profile_url}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 border-slate-200 focus-visible:border-teal-400 focus-visible:ring-teal-400/30"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`message-${candidateProfile.linkedin_profile_url}`} className="font-heading text-xs font-medium text-slate-700">
                Message
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] text-slate-600 hover:text-teal-700"
                onClick={() => copyToClipboard(message, 'message')}
              >
                {copiedField === 'message' ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <textarea
              id={`message-${candidateProfile.linkedin_profile_url}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
            <p className="text-[11px] text-slate-500">Edit freely — keep it specific and short.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={generate}
              className="border-slate-200 text-slate-700"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => copyToClipboard(`${subject}\n\n${message}`, 'all')}
              className="font-heading bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
            >
              {copiedField === 'all' ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Copied subject + message
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy subject + message
                </>
              )}
            </Button>
            {candidateProfile.linkedin_profile_url ? (
              <a
                href={candidateProfile.linkedin_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading inline-flex h-9 items-center justify-center rounded-md border border-teal-200 bg-white px-3 text-xs font-medium text-teal-800 shadow-sm transition-colors hover:bg-teal-50"
              >
                Open LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CareerPathTimeline({
  journeys,
  maxJourneys = 10,
  userProfile = null,
  goalTitle = '',
}: CareerPathTimelineProps) {
  const displayJourneys = journeys.slice(0, maxJourneys);

  return (
    <div className="space-y-6">
      {displayJourneys.map((journey, idx) => {
        const profileUrl = journey.profile.linkedin_profile_url;
        const fullTimeline = buildFullTimeline(journey.profile);

        return (
          <Card
            key={profileUrl || idx}
            className="group border border-slate-200/90 bg-white/95 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5"
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-teal-100 transition-all duration-300 group-hover:ring-teal-200">
                  <AvatarImage src={journey.profile.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-600 to-sky-600 font-heading font-bold text-white">
                    {journey.profile.name?.split(' ').map((n) => n[0]).join('') || 'UN'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <CardTitle className="font-heading text-xl">{journey.profile.name}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">
                        {journey.profile.headline || journey.profile.current_title}
                      </p>
                    </div>

                    <div className="ml-2 flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <Badge
                        variant="secondary"
                        className="border-teal-200 bg-teal-50 font-heading text-teal-900 motion-safe:animate-career-rise"
                      >
                        {journey.similarity.overall_score}% path match
                      </Badge>
                      {journey.mentorship_signal && journey.mentorship_signal.level !== 'none' ? (
                        <Badge
                          variant="secondary"
                          className={`font-heading motion-safe:animate-career-rise ${mentorshipBadgeClass(journey.mentorship_signal.level)}`}
                          style={{ animationDelay: '120ms' }}
                          title={journey.mentorship_signal.evidence.join(' · ')}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {mentorshipBadgeLabel(journey.mentorship_signal.level)}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {(() => {
                          const fromJobs = estimateYearsFromEmployers(journey.profile.all_employers);
                          const raw = journey.profile.years_of_experience_raw;
                          const fromPath = journey.path_highlights?.total_years;
                          const n =
                            (fromJobs > 0 ? fromJobs : null) ??
                            (typeof raw === 'number' && raw > 0 ? Math.round(raw) : null) ??
                            (typeof fromPath === 'number' && fromPath > 0 ? Math.round(fromPath) : null);
                          return n != null ? `${n}` : '—';
                        })()}{' '}
                        yrs experience
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{journey.profile.current_company}</span>
                    </div>
                    {(journey.profile.region || journey.profile.location) && (
                      <div className="flex items-center gap-1 text-emerald-800">
                        <MapPin className="h-4 w-4" />
                        <span>{journey.profile.region || journey.profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Cascade-tier "found via" pill — the precise reason this person made the list */}
                  {journey.source_tier ? (
                    <div
                      className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2 dark:border-rose-900/50 dark:bg-rose-950/30"
                      title={journey.source_tier.description}
                    >
                      <Badge
                        variant="default"
                        className="gap-1.5 border border-rose-300 bg-rose-100 px-2.5 py-1 font-heading text-xs font-bold uppercase tracking-wider text-rose-900 shadow-sm dark:border-rose-700 dark:bg-rose-900/60 dark:text-rose-100"
                      >
                        Tier {journey.source_tier.tier}
                      </Badge>
                      <span className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                        Found via: {journey.source_tier.label}
                        {journey.source_tier.via_label ? (
                          <>
                            {' '}
                            <span className="font-semibold text-rose-800 dark:text-rose-200">
                              ({journey.source_tier.via_label})
                            </span>
                          </>
                        ) : null}
                      </span>
                      {journey.source_tier.population_count > 0 ? (
                        <span className="ml-auto rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                          1 of {journey.source_tier.population_count.toLocaleString()} matches in this tier
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Shared-background chips — the gut-check "we once shared this" */}
                  {journey.relevance_anchors && journey.relevance_anchors.length > 0 ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border-2 border-teal-200 bg-teal-50/50 p-3">
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-teal-900">
                        Shared background:
                      </span>
                      {journey.relevance_anchors.slice(0, 5).map((a, ai) => (
                        <Badge
                          key={`${a.kind}-${ai}`}
                          variant="default"
                          className="gap-1.5 border border-teal-300 bg-teal-100 px-3 py-1.5 text-sm font-bold text-teal-900 shadow-sm motion-safe:animate-career-rise"
                          style={{ animationDelay: `${80 + ai * 40}ms` }}
                          title={a.label}
                        >
                          {anchorIcon(a.kind)}
                          <span>{a.label}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Why-this-path summary (heuristic-only). */}
              <details className="group/sim mb-6 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-sky-50/50 p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      Why this path is similar
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                      {journey.similarity.reasoning}
                    </p>
                  </div>
                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-open/sim:rotate-180" />
                </summary>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-teal-100 pt-4 md:grid-cols-4">
                  {[
                    { label: 'Education', value: journey.similarity.education_match },
                    { label: 'Early career', value: journey.similarity.early_career_match },
                    { label: 'Industry', value: journey.similarity.industry_match },
                    { label: 'Skills', value: journey.similarity.skills_match },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="font-heading text-2xl font-bold text-teal-700">{m.value}%</div>
                      <div className="mt-0.5 text-xs text-slate-600">{m.label}</div>
                    </div>
                  ))}
                </div>
              </details>

              {/* Full LinkedIn-style journey */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Full journey</h4>
                <p className="mb-4 text-xs text-slate-500">
                  Schools, degrees, and every role from their profile — newest first.
                </p>

                {fullTimeline.length === 0 ? (
                  <p className="text-sm text-slate-500">No education or work history available.</p>
                ) : (
                  fullTimeline.map((entry, jobIdx, arr) => {
                    const showLine = jobIdx < arr.length - 1;
                    if (entry.kind === 'education') {
                      const edu = entry.data;
                      const when = educationDateRange(edu);
                      return (
                        <div key={`edu-${jobIdx}-${edu.institute_name}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-3 w-3 rounded-full transition-transform duration-200 group-hover:scale-110 ${
                                jobIdx === 0 ? 'bg-violet-500' : 'bg-violet-300'
                              }`}
                            />
                            {showLine ? (
                              <div className="mt-1 min-h-[2rem] w-0.5 flex-1 bg-slate-300" />
                            ) : null}
                          </div>
                          <div className="flex-1 pb-6">
                            <Badge
                              variant="secondary"
                              className="mb-1 border-violet-200 bg-violet-50 text-[10px] font-medium text-violet-900"
                            >
                              Education
                            </Badge>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h5 className="font-medium text-slate-900">{educationHeadline(edu)}</h5>
                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                                  <GraduationCap
                                    className="h-3.5 w-3.5 shrink-0 text-violet-500"
                                    aria-hidden
                                  />
                                  <span>{edu.institute_name?.trim() || '—'}</span>
                                </p>
                              </div>
                            </div>
                            {when ? <p className="mt-1 text-xs text-slate-500">{when}</p> : null}
                          </div>
                        </div>
                      );
                    }

                    const job = entry.data;
                    const when = dateRangeLine(job);
                    return (
                      <div
                        key={`job-${jobIdx}-${companyLine(job)}-${jobTitle(job)}`}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-3 w-3 rounded-full transition-transform duration-200 group-hover:scale-110 ${
                              jobIdx === 0 ? 'bg-teal-500' : 'bg-sky-500'
                            }`}
                          />
                          {showLine ? (
                            <div className="mt-1 min-h-[2rem] w-0.5 flex-1 bg-slate-300" />
                          ) : null}
                        </div>

                        <div className="flex-1 pb-6">
                          <Badge
                            variant="secondary"
                            className="mb-1 border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-700"
                          >
                            Work
                          </Badge>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h5 className="font-medium text-slate-900">{jobTitle(job)}</h5>
                              <p className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                                <span>{companyLine(job)}</span>
                              </p>
                            </div>
                            {(job.duration_months != null || job.years_at_company_raw != null) && (
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {job.duration_months != null
                                  ? `${Math.max(1, Math.round(job.duration_months / 12))}y`
                                  : `${Math.round((job.years_at_company_raw ?? 0) * 10) / 10}y`}
                              </Badge>
                            )}
                          </div>
                          {when ? <p className="mt-1 text-xs text-slate-500">{when}</p> : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Key decisions */}
              {journey.similarity.key_decisions.length > 0 && (
                <div className="mt-6 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-sky-50/40 p-4">
                  <h4 className="font-heading mb-2 font-semibold text-slate-900">Key career decisions</h4>
                  <ul className="space-y-1.5">
                    {journey.similarity.key_decisions.map((decision, decIdx) => (
                      <li key={decIdx} className="flex items-start text-sm text-slate-700">
                        <span className="mr-2 mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inline outreach drawer — replaces the old MentorshipDialog */}
              <InlineOutreach
                candidateProfile={journey.profile}
                userProfile={userProfile}
                goalTitle={goalTitle}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
