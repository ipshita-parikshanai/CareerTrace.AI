import { NextRequest, NextResponse } from 'next/server';
import {
  enrichLinkedInProfile,
  enrichLinkedInProfileResult,
  searchPeopleForGoalRole,
} from '@/lib/api/crustdata';
import { runCascadeSearch, summarizeCascade } from '@/lib/api/cascade-search';
import { rankByHeuristicOnly } from '@/lib/ai/similarity';
import { generateCareerInsights } from '@/lib/ai/insights';
import { supabase } from '@/lib/supabase/client';
import { hasEmployerHistory, normalizeLinkedInProfile } from '@/lib/api/normalize-profile';
import type { CareerJourney, CareerPathSearchStats, LinkedInProfile } from '@/lib/types';
import { goalMatchesProfileTitle, jobTitlesSemanticallyMatch } from '@/lib/career/title-normalize';

function normalizeLinkedInUrl(url?: string | null): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, (m) => (m.startsWith('?') || m.startsWith('#') ? '' : m))
    .replace(/\/+$/, '')
    .trim();
}

function userIsAlreadyAtGoal(user: LinkedInProfile, goalTitle: string): boolean {
  const chunks = [user.current_title, user.title, user.headline].filter(Boolean) as string[];
  if (chunks.length === 0) return false;
  return chunks.some((c) => jobTitlesSemanticallyMatch(c, goalTitle));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userLinkedInUrl, goalTitle, goalCompany, goalIndustry } = body;

    if (!userLinkedInUrl || !goalTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: userLinkedInUrl and goalTitle' },
        { status: 400 }
      );
    }

    // Step 1: Resolve the user's profile (cache → CrustData enrich)
    let userProfile = await getCachedProfile(userLinkedInUrl);
    if (!userProfile) {
      const enriched = await enrichLinkedInProfileResult(userLinkedInUrl, false);
      if (!enriched.ok) {
        if (enriched.reason === 'payment_required') {
          return NextResponse.json(
            {
              error: 'CrustData returned a billing or auth error — could not enrich your profile.',
              detail: `HTTP ${enriched.httpStatus}. Check your API key and CrustData account balance.`,
              suggestion:
                'Verify CRUSTDATA_API_KEY in .env.local and your dashboard at crustdata.com.',
            },
            { status: 402 }
          );
        }
        if (enriched.reason === 'rate_limited') {
          return NextResponse.json(
            {
              error: 'CrustData rate limit — try again in a minute.',
              detail: 'Too many enrich requests in a short window.',
            },
            { status: 429 }
          );
        }
        if (enriched.reason === 'not_in_index') {
          return NextResponse.json(
            {
              error:
                'This LinkedIn profile is not in CrustData’s index yet — we need an enriched profile to run the trace.',
              detail:
                'CrustData does not have every LinkedIn member. If the API returns 200 with no match, that person has not been indexed (yet).',
              suggestion:
                'Try a different public profile that CrustData already has (e.g. a colleague at a large company, or a well-known profile). You can also ask CrustData about indexing or coverage for your use case.',
              code: 'PROFILE_NOT_IN_CRUSTDATA',
            },
            { status: 404 }
          );
        }
        return NextResponse.json(
          {
            error: 'Could not enrich your LinkedIn profile.',
            detail: `Unexpected response (HTTP ${enriched.httpStatus}).`,
          },
          { status: 502 }
        );
      }
      userProfile = enriched.profile;
      await cacheProfile(userProfile);
    }

    // Step 2: Sanity check — already at the goal? Don't show a journey to a
    // role they already hold.
    if (userIsAlreadyAtGoal(userProfile, goalTitle)) {
      return NextResponse.json({
        success: true,
        data: {
          userProfile,
          careerJourneys: [],
          insights: null,
          goalTitle,
          goalCompany: goalCompany ?? null,
          goalIndustry: goalIndustry ?? null,
          userLinkedInUrl,
          alreadyAtGoal: true,
          message: `Your current title (${userProfile.current_title || 'on LinkedIn'}) already looks like "${goalTitle}". Pick a different goal — for example a more senior role or a different function — and we'll trace paths to that.`,
          aiComplete: true,
        },
      });
    }

    // Step 3: Cascade search — walk T1 → T6 in descending precision.
    console.log('[career-path] starting cascade search', {
      goal: goalTitle,
      employers: userProfile.all_employers?.slice(0, 2).map((e) => e.name),
      schools: userProfile.education_background?.slice(0, 2).map((e) => e.institute_name),
    });

    const cascade = await runCascadeSearch(userProfile, goalTitle, {
      desiredCandidates: 12,
      perQueryLimit: 10,
    });
    const cascadeSummary = summarizeCascade(cascade);

    console.log(
      `[career-path] cascade: ${cascade.hits.length} candidates across ${cascadeSummary.ranTiers}/${cascadeSummary.attemptedTiers} tiers (population: ${cascadeSummary.totalPopulationCount})`
    );

    // If cascade returned almost nothing (rare goal, no public profile, or
    // CrustData hiccup), fall back to a broad goal-title search so the user
    // always sees SOMETHING. We tag these as the broad-goal tier.
    let supplementaryHits = 0;
    if (cascade.hits.length < 3) {
      const broad = await searchPeopleForGoalRole(goalTitle, { goalCompany, limit: 15 });
      const seen = new Set(
        cascade.hits.map((h) => normalizeLinkedInUrl(h.profile.linkedin_profile_url))
      );
      const broadTier = cascade.tiers.find((t) => t.key === 'broad_goal')!;
      for (const p of broad) {
        const k = normalizeLinkedInUrl(p.linkedin_profile_url);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        cascade.hits.push({
          profile: p,
          tier: broadTier.tier,
          tierKey: 'broad_goal',
          tierLabel: broadTier.label,
          tierDescription: broadTier.description,
        });
        supplementaryHits++;
      }
      if (supplementaryHits > 0) {
        broadTier.uniqueCandidatesAdded += supplementaryHits;
        broadTier.ran = true;
        broadTier.attempted = true;
        broadTier.notes.push(`Supplementary fallback added ${supplementaryHits} more profiles`);
      }
    }

    if (cascade.hits.length === 0) {
      return NextResponse.json(
        {
          error:
            'We could not find anyone matching your background and the goal title in CrustData. Try a broader goal (e.g. "Product Manager" instead of "Senior PM, Platform").',
          suggestion:
            'Tip: shorter, less-qualified role names (Product Manager, Software Engineer, Data Scientist) match more profiles in PersonDB.',
        },
        { status: 404 }
      );
    }

    // Step 4: Filter out the user themselves.
    const userKey = normalizeLinkedInUrl(userProfile.linkedin_profile_url || userLinkedInUrl);
    const cascadeHits = cascade.hits.filter(
      (h) => normalizeLinkedInUrl(h.profile.linkedin_profile_url) !== userKey
    );
    const uniqueCandidatesConsidered = cascadeHits.length;

    // Step 5: Enrich the top N candidates (already in tier-priority order).
    // Cache lookups happen in PARALLEL; only LIVE CrustData enrich calls are
    // sequenced (those rate-limit). Pool of 6 keeps the bill sane.
    const POOL_SIZE = 6;
    const ENRICH_DELAY_MS = 200;
    const toEnrich = cascadeHits.slice(0, POOL_SIZE);

    const cacheLookups = await Promise.all(
      toEnrich.map((h) =>
        h.profile.linkedin_profile_url
          ? getCachedProfile(h.profile.linkedin_profile_url)
          : Promise.resolve(null)
      )
    );

    const enriched: ({ profile: LinkedInProfile; hit: (typeof toEnrich)[number] } | null)[] = [];
    let cacheHits = 0;
    let liveCalls = 0;

    for (let i = 0; i < toEnrich.length; i++) {
      const hit = toEnrich[i]!;
      const cached = cacheLookups[i];

      if (!hit.profile.linkedin_profile_url) {
        enriched.push(null);
        continue;
      }

      if (cached && hasEmployerHistory(cached)) {
        if (hit.profile.region && !cached.region) cached.region = hit.profile.region;
        enriched.push({ profile: cached, hit });
        cacheHits++;
        continue;
      }

      const live = await enrichLinkedInProfile(hit.profile.linkedin_profile_url, false);
      if (live) {
        if (hit.profile.region) live.region = live.region || hit.profile.region;
        void cacheProfile(live);
        liveCalls++;
        enriched.push({ profile: live, hit });
      } else {
        // Live enrich failed — keep the search-snapshot we already have if it
        // has employer history (avoids losing tier-1 matches due to API hiccups).
        if (hasEmployerHistory(hit.profile)) {
          enriched.push({ profile: hit.profile, hit });
        } else {
          enriched.push(null);
        }
      }

      if (i < toEnrich.length - 1) {
        await new Promise((r) => setTimeout(r, ENRICH_DELAY_MS));
      }
    }

    console.log(
      `[career-path] enrichment: ${cacheHits} cache hits, ${liveCalls} live calls (~$${(liveCalls * 0.05).toFixed(2)})`
    );

    const validEntries = enriched.filter((e): e is NonNullable<typeof e> => e !== null);
    if (validEntries.length === 0) {
      return NextResponse.json(
        { error: 'Could not enrich enough profiles to analyze.' },
        { status: 500 }
      );
    }

    // Filter to people who actually reached the goal.
    const userCurrentLower = (userProfile.current_title || '').toLowerCase();
    const reachedGoal = validEntries.filter(({ profile }) => {
      const cur = profile.current_title || profile.title || profile.headline || '';
      if (!cur.trim()) return false;
      const matchesGoal = goalMatchesProfileTitle(goalTitle, cur);
      const sameAsUser =
        userCurrentLower.length >= 3 && cur.toLowerCase() === userCurrentLower;
      return matchesGoal && !sameAsUser;
    });

    // Last-resort: if strict goal-match leaves none, keep enriched pool so
    // we always show something (cascade tiers are themselves goal-filtered).
    const profilesToRank = (reachedGoal.length > 0 ? reachedGoal : validEntries).map((e) => ({
      profile: normalizeLinkedInProfile(e.profile),
      hit: e.hit,
    }));
    const profilesPassingGoalCheck = reachedGoal.length;

    // Step 6: Heuristic ranking over the cascade-derived pool.
    // Critical: stable sort by `tier` first, so T1 always beats T2 visually.
    const rankedRaw = rankByHeuristicOnly(
      userProfile,
      profilesToRank.map((p) => p.profile),
      goalTitle
    );

    // Re-attach tier metadata to each ranked journey.
    const tierByUrl = new Map<string, (typeof profilesToRank)[number]['hit']>();
    for (const p of profilesToRank) {
      const key = normalizeLinkedInUrl(p.profile.linkedin_profile_url);
      if (key) tierByUrl.set(key, p.hit);
    }

    const cascadeTierByKey = new Map(cascade.tiers.map((t) => [t.key, t]));

    const ranked: CareerJourney[] = rankedRaw.map((j) => {
      const key = normalizeLinkedInUrl(j.profile.linkedin_profile_url);
      const hit = key ? tierByUrl.get(key) : undefined;
      if (!hit) return j;
      const populationCount = cascadeTierByKey.get(hit.tierKey)?.totalCount ?? 0;
      return {
        ...j,
        source_tier: {
          tier: hit.tier,
          key: hit.tierKey,
          label: hit.tierLabel,
          description: hit.tierDescription,
          population_count: populationCount,
          via_label: hit.viaLabel,
        },
      };
    });

    // Final sort: ALWAYS by tier first (lower = better), then by ranking score
    // already computed by `rankByHeuristicOnly`.
    ranked.sort((a, b) => {
      const ta = a.source_tier?.tier ?? 99;
      const tb = b.source_tier?.tier ?? 99;
      if (ta !== tb) return ta - tb;
      return b.similarity.overall_score - a.similarity.overall_score;
    });

    const rankedJourneys = ranked.slice(0, 10);

    const searchStats: CareerPathSearchStats = {
      cascadeTiers: cascade.tiers.map((t) => ({
        tier: t.tier,
        key: t.key,
        label: t.label,
        description: t.description,
        totalCount: t.totalCount,
        uniqueCandidatesAdded: t.uniqueCandidatesAdded,
        attempted: t.attempted,
        ran: t.ran,
        notes: t.notes,
      })),
      totalPopulationCount: cascadeSummary.totalPopulationCount,
      uniqueCandidatesConsidered,
      enrichPoolSize: POOL_SIZE,
      cacheHitsInEnrich: cacheHits,
      liveEnrichCalls: liveCalls,
      profilesPassingGoalCheck,
      rankedShown: rankedJourneys.length,
      stoppedEarly: cascade.stoppedEarly,
      inputs: {
        employersConsidered: cascade.params.employersConsidered,
        schoolsConsidered: cascade.params.schoolsConsidered,
        metro: cascade.params.metro,
        goalVariants: cascade.params.goalVariants,
        userRoleVariants: cascade.params.userRoleVariants,
      },
    };

    if (rankedJourneys.length === 0) {
      return NextResponse.json(
        { error: 'No similar career paths found.' },
        { status: 404 }
      );
    }

    // Step 7: One AI call for plain-English insights across the journeys.
    let insights = null;
    try {
      insights = await generateCareerInsights(userProfile, rankedJourneys, goalTitle);
    } catch (err) {
      console.error('[career-path] insights generation failed:', err);
    }

    return NextResponse.json({
      success: true,
      data: {
        userProfile,
        careerJourneys: rankedJourneys,
        insights,
        goalTitle,
        goalCompany: goalCompany ?? null,
        goalIndustry: goalIndustry ?? null,
        userLinkedInUrl,
        sampleSize: rankedJourneys.length,
        searchStats,
        aiComplete: true,
      },
    });
  } catch (error) {
    console.error('Error in career path analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------- caching helpers ----------

async function getCachedProfile(linkedinUrl: string) {
  try {
    const { data, error } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('linkedin_url', linkedinUrl)
      .single();

    if (error || !data) return null;

    const raw = data.raw_data as import('@/lib/types').LinkedInProfile;
    return normalizeLinkedInProfile({
      ...raw,
      linkedin_profile_url: raw.linkedin_profile_url || linkedinUrl,
    });
  } catch (error) {
    console.error('Error getting cached profile:', error);
    return null;
  }
}

async function cacheProfile(profile: LinkedInProfile) {
  try {
    const { error } = await supabase
      .from('linkedin_profiles')
      .upsert(
        {
          linkedin_url: profile.linkedin_profile_url,
          name: profile.name,
          headline: profile.headline,
          current_title: profile.current_title,
          current_company: profile.current_company,
          years_of_experience: profile.years_of_experience_raw,
          all_employers: profile.all_employers || [],
          education_background: profile.education_background || [],
          skills: profile.skills || [],
          raw_data: profile,
          last_enriched_at: new Date().toISOString(),
        },
        { onConflict: 'linkedin_url' }
      );

    if (error) {
      console.error('Error caching profile:', error);
    }
  } catch (error) {
    console.error('Error caching profile:', error);
  }
}
