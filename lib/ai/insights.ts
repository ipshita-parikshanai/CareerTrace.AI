import OpenAI from 'openai';
import { CareerJourney, CareerInsights, LinkedInProfile } from '@/lib/types';
import { parseJsonFromLLMResponse } from '@/lib/ai/parseJson';

function normalizeCareerInsights(raw: Partial<CareerInsights>): CareerInsights {
  const sp = raw.skills_progression;
  return {
    common_steps: raw.common_steps ?? [],
    alternative_routes: raw.alternative_routes ?? [],
    key_transitions: raw.key_transitions ?? [],
    timeline: raw.timeline ?? { min_years: 0, avg_years: 0, max_years: 0 },
    company_progression_patterns: raw.company_progression_patterns ?? [],
    skills_progression: {
      early_career: sp?.early_career ?? [],
      mid_career: sp?.mid_career ?? [],
      senior: sp?.senior ?? [],
    },
    success_factors: raw.success_factors ?? [],
  };
}

/** OpenRouter requires a non-empty HTTP-Referer. Resolution order:
 *  1. NEXT_PUBLIC_APP_URL  (you set this explicitly in Vercel)
 *  2. VERCEL_URL           (Vercel injects this for every deployment)
 *  3. localhost            (local dev only) */
function appReferer(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': appReferer(),
    'X-Title': 'CareerTrace.AI - Career Discovery Platform',
  },
});

/**
 * Single AI call that summarises the journeys into plain-English insights.
 * Used for the Insights tab; this is the only LLM call in the main pipeline.
 */
export async function generateCareerInsights(
  userProfile: LinkedInProfile,
  journeys: CareerJourney[],
  goalTitle: string
): Promise<CareerInsights | null> {
  try {
    const journeySummaries = journeys.map((j, idx) => ({
      person: `Person ${idx + 1}`,
      current_role: j.profile.current_title,
      current_company: j.profile.current_company,
      years_of_experience: j.profile.years_of_experience_raw,
      career_path: j.profile.all_employers?.slice(0, 6).map((e) => ({
        title: e.title,
        company: e.name,
        duration_months: e.duration_months,
      })),
      education: j.profile.education_background?.map((e) => ({
        school: e.institute_name,
        degree: e.degree_name,
      })),
      transition_point: j.similarity.transition_point,
      key_decisions: j.similarity.key_decisions,
    }));

    const prompt = `You are a career path analyst. Analyze these ${journeys.length} career paths from people who:
- Started similar to: ${userProfile.current_title} at ${userProfile.current_company}
- Reached: ${goalTitle}

USER'S CURRENT POSITION:
- Title: ${userProfile.current_title}
- Company: ${userProfile.current_company}
- Years of Experience: ${userProfile.years_of_experience_raw}
- Education: ${JSON.stringify(userProfile.education_background?.map((e) => e.institute_name) || [])}

CAREER JOURNEYS DATA:
${JSON.stringify(journeySummaries, null, 2)}

TASK - Generate actionable insights:

1. COMMON STEPS: 3-5 most common career moves or patterns.
2. ALTERNATIVE ROUTES: 2-3 distinct alternative routes with percentages.
3. KEY TRANSITIONS: 3-4 important transitions with average timing.
4. TIMELINE: realistic min / avg / max years.
5. COMPANY PROGRESSION PATTERNS: patterns across these journeys.
6. SKILLS PROGRESSION: skills typically acquired at each stage.
7. SUCCESS FACTORS: 3-5 factors that led to success.

Return ONLY a valid JSON object (no markdown, no code blocks) with the shape:
{
  "common_steps": ["..."],
  "alternative_routes": [{ "route_name": "...", "description": "...", "percentage": 60 }],
  "key_transitions": [{ "from": "...", "to": "...", "avg_years": 2, "common_skills": ["..."] }],
  "timeline": { "min_years": 5, "avg_years": 7, "max_years": 10 },
  "company_progression_patterns": ["..."],
  "skills_progression": { "early_career": ["..."], "mid_career": ["..."], "senior": ["..."] },
  "success_factors": ["..."]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a career insights analyst. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) return null;

    const result = parseJsonFromLLMResponse<Partial<CareerInsights>>(responseText);
    return normalizeCareerInsights(result);
  } catch (error) {
    console.error('Error generating career insights:', error);
    return null;
  }
}
