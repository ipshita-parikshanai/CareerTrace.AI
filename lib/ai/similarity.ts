/**
 * Heuristic-only similarity ranking.
 *
 * The previous version had three layers (LLM scoring + affinity buckets +
 * relevance anchors) which was both expensive and confusing. We now rank
 * purely on:
 *
 *   - shared "we once were here together" anchors (sum of strengths)
 *   - a lightweight heuristic on early-career / skills overlap
 *   - a small same-region bonus
 *
 * No LLM calls happen here. The only AI cost in the whole pipeline is the
 * single insights summary call generated AFTER ranking.
 */

import { LinkedInProfile, SimilarityScore, CareerJourney } from '@/lib/types';
import { estimateYearsFromEmployers } from '@/lib/career/tenure';
import {
  penaltyEarlyGoalTrackLockin,
  penaltyStartedInGoalTrack,
  scoreEducationOverlap,
  scoreSharedWorkplace,
  scoreSkillsOverlap,
  scoreStartingPointOverlap,
  tokenize,
} from '@/lib/ai/starting-point';
import { detectMentorshipSignal } from '@/lib/career/mentorship-signal';
import { locationsLikelySameRegion } from '@/lib/geo/location';
import { anchorTierSortScore, relevanceAnchors } from '@/lib/career/relevance-anchors';
import type { RelevanceAnchor } from '@/lib/types';

/**
 * Combined ranking score for a journey:
 *
 *   anchor-strength * 0.6  +  path-similarity * 0.4  +  same-region bonus (8)
 *
 * Anchors dominate because that's what makes the candidate feel like
 * "someone once in my shoes". Path similarity is the tiebreaker.
 */
function combinedScore(
  userRegion: string | undefined,
  j: {
    profile: LinkedInProfile;
    similarity: SimilarityScore;
    relevance_anchors?: RelevanceAnchor[] | null;
  }
): number {
  const cand = j.profile.region || j.profile.location || '';
  const sameRegion = userRegion && cand && locationsLikelySameRegion(userRegion, cand);
  const regionBonus = sameRegion ? 8 : 0;

  const anchorStrength = Math.min(
    100,
    (j.relevance_anchors ?? []).reduce((sum, a) => sum + a.strength, 0)
  );

  return anchorStrength * 0.6 + j.similarity.overall_score * 0.4 + regionBonus;
}

function scoreIndustryOverlap(
  userProfile: LinkedInProfile,
  candidateProfile: LinkedInProfile
): number {
  const uTok = tokenize(
    (userProfile.all_employers ?? [])
      .slice(0, 3)
      .map((e) => `${e.name || ''} ${e.title || ''}`)
      .join(' ')
  );
  const cTok = tokenize(
    (candidateProfile.all_employers ?? [])
      .slice(0, 3)
      .map((e) => `${e.name || ''} ${e.title || ''}`)
      .join(' ')
  );
  if (uTok.size === 0 || cTok.size === 0) return 44;
  let inter = 0;
  for (const t of uTok) {
    if (cTok.has(t)) inter++;
  }
  const union = new Set([...uTok, ...cTok]).size;
  const j = union ? inter / union : 0;
  return Math.min(92, Math.round(36 + j * 85));
}

/**
 * Lightweight heuristic similarity. Prefers shared schools/fields, similar
 * early-career roles, and shared workplaces. Penalises candidates who
 * already started in the goal profession (they aren't a useful transition
 * story for someone switching tracks).
 */
export function heuristicSimilarity(
  userProfile: LinkedInProfile,
  candidateProfile: LinkedInProfile,
  goalTitle?: string
): SimilarityScore {
  const g = goalTitle?.trim() ?? '';

  const edu = scoreEducationOverlap(userProfile, candidateProfile);
  const start = scoreStartingPointOverlap(userProfile, candidateProfile);
  const skills = scoreSkillsOverlap(userProfile, candidateProfile);
  const industry = scoreIndustryOverlap(userProfile, candidateProfile);
  const workplace = scoreSharedWorkplace(userProfile, candidateProfile);

  let overall =
    edu * 0.34 +
    start * 0.38 +
    skills * 0.11 +
    industry * 0.1 +
    (workplace > 0 ? 6 : 0);

  let penalty = 0;
  if (g) {
    penalty += penaltyStartedInGoalTrack(userProfile, candidateProfile, g);
    penalty += penaltyEarlyGoalTrackLockin(candidateProfile, g);
  }

  overall = overall - penalty;
  overall = Math.round(overall);
  overall = Math.min(93, Math.max(36, overall));

  return {
    overall_score: overall,
    education_match: Math.round(edu),
    early_career_match: Math.round(start),
    industry_match: Math.round(industry),
    skills_match: Math.round(skills),
    transition_point: g
      ? `Early-career overlap with you; goal role: ${g}`
      : 'Estimated from profile overlap',
    years_into_career: 0,
    key_decisions: [
      g
        ? `Paths favour people who started closer to your background and reached "${g}", not those who began in that track from day one.`
        : 'Path inferred from career history.',
    ],
    reasoning:
      'Weighted toward same school or field, overlapping early roles with yours, shared workplaces, and skills. Penalised profiles that already started in the goal profession.',
  };
}

/**
 * Build CareerJourney objects, attach relevance anchors + mentorship signal,
 * and sort by anchor-driven combined score. No LLM calls.
 */
export function rankByHeuristicOnly(
  userProfile: LinkedInProfile,
  candidateProfiles: LinkedInProfile[],
  goalTitle?: string
): CareerJourney[] {
  const journeys: CareerJourney[] = [];

  for (const candidate of candidateProfiles) {
    const similarity = heuristicSimilarity(userProfile, candidate, goalTitle);

    const allEmployers = candidate.all_employers || [];
    const firstJob = allEmployers[allEmployers.length - 1];
    const keyTransitions = allEmployers
      .slice(0, 4)
      .map((e) => `${e.title} at ${e.name}`)
      .reverse();

    const mentorshipSignal = detectMentorshipSignal(candidate);
    const anchors = relevanceAnchors(userProfile, candidate);

    journeys.push({
      profile: candidate,
      similarity,
      mentorship_signal: mentorshipSignal,
      relevance_anchors: anchors,
      path_highlights: {
        starting_point: firstJob ? `${firstJob.title} at ${firstJob.name}` : 'Unknown',
        key_transitions: keyTransitions,
        current_position: `${candidate.current_title} at ${candidate.current_company}`,
        total_years:
          candidate.years_of_experience_raw ??
          estimateYearsFromEmployers(candidate.all_employers),
      },
    });
  }

  const userRegion = userProfile.region || userProfile.location || '';
  journeys.sort((a, b) => {
    const ta = anchorTierSortScore(userProfile, a.profile);
    const tb = anchorTierSortScore(userProfile, b.profile);
    if (Math.abs(tb - ta) > 1e-6) return tb - ta;
    const ca = combinedScore(userRegion, a);
    const cb = combinedScore(userRegion, b);
    if (Math.abs(cb - ca) > 1e-6) return cb - ca;
    return Math.random() - 0.5;
  });
  return journeys.slice(0, 10);
}
