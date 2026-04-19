'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  GraduationCap,
  MapPin,
  MessageCircle,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { JourneyDetailDialog } from './JourneyDetailDialog';
import type { CareerJourney, LinkedInProfile, RelevanceAnchor } from '@/lib/types';
import { estimateYearsFromEmployers } from '@/lib/career/tenure';

interface JourneyCardCompactProps {
  journey: CareerJourney;
  userProfile: LinkedInProfile | null;
  goalTitle: string;
}

function anchorIcon(kind: RelevanceAnchor['kind']) {
  switch (kind) {
    case 'same_employer':
    case 'employer_tier':
    case 'starting_tier':
      return <Building2 className="h-3 w-3" aria-hidden />;
    case 'same_school':
    case 'school_tier_level':
    case 'field_at_level':
      return <GraduationCap className="h-3 w-3" aria-hidden />;
    case 'role_family':
      return <Briefcase className="h-3 w-3" aria-hidden />;
    case 'same_region':
      return <MapPin className="h-3 w-3" aria-hidden />;
    default:
      return null;
  }
}

function mentorshipBadgeClass(level: string): string {
  switch (level) {
    case 'high':
      return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200';
    case 'medium':
      return 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200';
    case 'low':
    default:
      return 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function mentorshipBadgeLabel(level: string): string {
  return level === 'high' ? 'Active mentor' : level === 'medium' ? 'Open to mentor' : 'Light mentor signal';
}

export function JourneyCardCompact({ journey, userProfile, goalTitle }: JourneyCardCompactProps) {
  const [open, setOpen] = useState(false);
  const profile = journey.profile;
  const yearsExp =
    estimateYearsFromEmployers(profile.all_employers) ||
    Math.round(profile.years_of_experience_raw ?? journey.path_highlights?.total_years ?? 0);

  return (
    <>
      <Card className="group flex h-full flex-col border border-slate-200 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-teal-700">
        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 shrink-0 ring-2 ring-teal-100 dark:ring-teal-900/40">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-sky-600 font-heading text-xs font-bold text-white">
                {profile.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'UN'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading truncate text-base font-bold text-slate-900 dark:text-slate-100">
                {profile.name}
              </h3>
              <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                {profile.headline || profile.current_title}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 border-teal-200 bg-teal-50 font-heading text-teal-900 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
            >
              {journey.similarity.overall_score}%
            </Badge>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            {yearsExp > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {yearsExp} yrs
              </span>
            ) : null}
            {profile.current_company ? (
              <span className="inline-flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{profile.current_company}</span>
              </span>
            ) : null}
            {profile.region || profile.location ? (
              <span className="inline-flex items-center gap-1 truncate text-emerald-700 dark:text-emerald-300">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{profile.region || profile.location}</span>
              </span>
            ) : null}
          </div>

          {/* Tier pill */}
          {journey.source_tier ? (
            <div
              className="rounded-md border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 dark:border-rose-900/50 dark:bg-rose-950/40"
              title={journey.source_tier.description}
            >
              <p className="text-[11px] font-semibold leading-tight text-rose-900 dark:text-rose-100">
                <span className="mr-1.5 inline-block rounded bg-rose-200 px-1.5 py-0.5 text-[10px] font-bold dark:bg-rose-800 dark:text-rose-100">
                  T{journey.source_tier.tier}
                </span>
                {journey.source_tier.label}
                {journey.source_tier.via_label ? (
                  <span className="font-normal"> · {journey.source_tier.via_label}</span>
                ) : null}
              </p>
            </div>
          ) : null}

          {/* Top anchors (max 3) */}
          {journey.relevance_anchors && journey.relevance_anchors.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {journey.relevance_anchors.slice(0, 3).map((a, i) => (
                <Badge
                  key={`${a.kind}-${i}`}
                  variant="default"
                  className="gap-1 border border-teal-300 bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-900 dark:border-teal-700 dark:bg-teal-900/50 dark:text-teal-100"
                  title={a.label}
                >
                  {anchorIcon(a.kind)}
                  <span className="max-w-[12rem] truncate">{a.label}</span>
                </Badge>
              ))}
              {journey.relevance_anchors.length > 3 ? (
                <Badge
                  variant="secondary"
                  className="border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  +{journey.relevance_anchors.length - 3} more
                </Badge>
              ) : null}
            </div>
          ) : null}

          {/* Mentorship signal (if any) */}
          {journey.mentorship_signal && journey.mentorship_signal.level !== 'none' ? (
            <Badge
              variant="secondary"
              className={`w-fit gap-1 font-heading text-[11px] ${mentorshipBadgeClass(journey.mentorship_signal.level)}`}
            >
              <MessageCircle className="h-3 w-3" />
              {mentorshipBadgeLabel(journey.mentorship_signal.level)}
            </Badge>
          ) : null}

          {/* Spacer pushes button to bottom */}
          <div className="flex-1" />

          {/* CTA */}
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="font-heading w-full bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white shadow-sm hover:from-teal-700 hover:via-sky-700 hover:to-blue-700"
          >
            View full journey
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <JourneyDetailDialog
        open={open}
        onOpenChange={setOpen}
        journey={journey}
        userProfile={userProfile}
        goalTitle={goalTitle}
      />
    </>
  );
}
