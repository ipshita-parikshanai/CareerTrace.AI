// LinkedIn Profile Types (from CrustData API)
export interface Employer {
  name: string;
  title: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  /** CrustData often exposes this when duration_months is absent */
  years_at_company_raw?: number;
  location?: string;
  company_linkedin_profile_url?: string;
  company_id?: number;
  description?: string;
}

export interface Education {
  institute_name: string;
  degree_name?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  institute_linkedin_url?: string;
  activities_and_societies?: string;
}

export interface LinkedInProfile {
  linkedin_profile_url: string;
  name: string;
  /** Top-level title from CrustData enrich response */
  title?: string;
  headline?: string;
  /** e.g. city/region string from LinkedIn */
  location?: string;
  /** PersonDB search often returns this (broader region) */
  region?: string;
  summary?: string;
  current_title?: string;
  current_company?: string;
  years_of_experience_raw?: number;
  
  // Career history
  all_employers?: Employer[];
  current_employers?: Employer[];
  past_employers?: Employer[];
  
  // Education
  education_background?: Education[];
  all_degrees?: string[];
  all_schools?: string[];
  /** Parallel to employment history — CrustData often fills this when per-row titles are sparse */
  all_titles?: string[];
  
  // Skills & profile data
  skills?: string[];
  num_of_connections?: number;
  profile_picture_url?: string;
  
  // Metadata
  last_updated?: string;
  person_id?: number;
}

// Career Path Analysis Types
export interface SimilarityScore {
  overall_score: number;
  education_match: number;
  early_career_match: number;
  industry_match: number;
  skills_match: number;
  transition_point: string;
  years_into_career: number;
  key_decisions: string[];
  reasoning: string;
}

export interface CareerJourney {
  profile: LinkedInProfile;
  similarity: SimilarityScore;
  path_highlights: {
    starting_point: string;
    key_transitions: string[];
    current_position: string;
    total_years: number;
  };
  /** Detected open-to-mentorship cues from headline/summary. */
  mentorship_signal?: MentorshipSignal;
  /** Concrete "we once shared this" overlaps — drives the chips on each card. */
  relevance_anchors?: RelevanceAnchor[];
  /**
   * Which cascade tier surfaced this candidate. Lower `tier` = stronger
   * precision (1 = same company + same role). Drives the "Found via" badge.
   */
  source_tier?: {
    tier: number;
    key: string;
    label: string;
    description: string;
    /** Total number of people in CrustData that matched the tier query (`total_count`). */
    population_count: number;
    /** Optional anchor label, e.g. "Flipkart" or "IIIT Hyderabad". */
    via_label?: string;
  };
}

/**
 * One concrete piece of shared backstory between user and candidate. We
 * surface these as chips on the result card so users immediately understand
 * "this person was once in my shoes because…".
 */
export interface RelevanceAnchor {
  /** Stable id used for keys and de-dupe. */
  kind:
    | 'same_employer'
    | 'employer_tier'
    | 'starting_tier'
    | 'role_family'
    | 'same_school'
    | 'school_tier_level'
    | 'field_at_level'
    | 'same_region';
  /** Short label for the chip ("Both at FAANG", "Same school: IIT Bombay"). */
  label: string;
  /** 0–100 strength of this single anchor (used internally for scoring). */
  strength: number;
}

/**
 * Detection of "open to mentorship" / "happy to chat" cues on a profile.
 * Surfaced as a small badge on the journey card so users know who's most
 * likely to actually reply.
 */
export interface MentorshipSignal {
  level: 'strong' | 'moderate' | 'teaching' | 'none';
  /** Short human-readable evidence — e.g. "Headline mentions: open to mentoring" */
  evidence: string[];
}

// Insights Types
export interface CareerInsights {
  common_steps: string[];
  alternative_routes: {
    route_name: string;
    description: string;
    percentage: number;
  }[];
  key_transitions: {
    from: string;
    to: string;
    avg_years: number;
    common_skills: string[];
  }[];
  timeline: {
    min_years: number;
    avg_years: number;
    max_years: number;
  };
  company_progression_patterns: string[];
  skills_progression: {
    early_career: string[];
    mid_career: string[];
    senior: string[];
  };
  success_factors: string[];
}

// Search Query Types
export interface CareerSearchQuery {
  user_linkedin_url: string;
  goal_title?: string;
  goal_company?: string;
  goal_industry?: string;
  filters?: {
    location?: string;
    industry?: string;
    company_size?: string;
  };
}

/** One row in the cascade transparency panel ("Tier 1: Same company + same role → 124 people"). */
export interface CascadeTierStat {
  tier: number;
  key: string;
  label: string;
  description: string;
  /** Sum of CrustData `total_count` across this tier's sub-queries. */
  totalCount: number;
  /** Unique candidates this tier added to the pool (after dedupe). */
  uniqueCandidatesAdded: number;
  attempted: boolean;
  ran: boolean;
  notes: string[];
}

/** Transparency for “how many people did we search?” — returned by POST /api/career-path */
export interface CareerPathSearchStats {
  /** Per-tier breakdown (T1 → T6), in priority order. */
  cascadeTiers: CascadeTierStat[];
  /** Sum of all `total_count`s across tiers — the headline "out of N people" stat. */
  totalPopulationCount: number;
  /** Unique candidates surfaced by the cascade (after dedupe across tiers). */
  uniqueCandidatesConsidered: number;
  /** Top of cascade we ended up enriching this run. */
  enrichPoolSize: number;
  cacheHitsInEnrich: number;
  liveEnrichCalls: number;
  /** Profiles whose current title actually matches the goal. */
  profilesPassingGoalCheck: number;
  /** Final ranked list size shown to the user. */
  rankedShown: number;
  /** True if cascade hit its `desiredCandidates` budget without running every tier. */
  stoppedEarly: boolean;
  /** Search inputs we used (for "Show search params" panel). */
  inputs: {
    employersConsidered: string[];
    schoolsConsidered: string[];
    metro?: string;
    goalVariants: string[];
    userRoleVariants: string[];
  };
}

// API Response Types
export interface CrustDataEnrichResponse {
  data: LinkedInProfile[];
  success: boolean;
  message?: string;
}

export interface CrustDataSearchResponse {
  /** PersonDB search returns this array */
  profiles?: LinkedInProfile[];
  /** Legacy / alternate shape */
  data?: LinkedInProfile[];
  next_cursor?: string;
  total_count?: number;
  cursor?: string;
  total_results?: number;
  success?: boolean;
}

// Database Types
export interface CachedProfile {
  id: number;
  linkedin_url: string;
  name: string;
  headline?: string;
  current_title?: string;
  current_company?: string;
  years_of_experience?: number;
  all_employers: Employer[];
  education_background: Education[];
  skills: string[];
  raw_data: LinkedInProfile;
  last_enriched_at: string;
  created_at: string;
}

export interface CareerSearch {
  id: number;
  user_linkedin_url: string;
  goal_title?: string;
  goal_company?: string;
  goal_industry?: string;
  similar_profiles: CareerJourney[];
  insights: CareerInsights;
  created_at: string;
}
