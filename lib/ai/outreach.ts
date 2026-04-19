import OpenAI from 'openai';
import type { LinkedInProfile } from '@/lib/types';

/** Pick a valid HTTP-Referer for OpenRouter. Prefers NEXT_PUBLIC_APP_URL, then
 *  Vercel's auto-injected VERCEL_URL, then localhost for dev. */
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
    'X-Title': 'CareerTrace.AI - Outreach Drafts',
  },
});

function profileBrief(p: LinkedInProfile): string {
  const cur = p.current_employers?.[0] || p.all_employers?.[0];
  const eduTop = p.education_background?.[0];
  const lines = [
    `Name: ${p.name}`,
    `Current: ${p.current_title || cur?.title || ''} at ${p.current_company || cur?.name || ''}`,
    p.location ? `Location: ${p.location}` : '',
    eduTop ? `Education: ${eduTop.degree_name || ''} ${eduTop.field_of_study || ''} at ${eduTop.institute_name || ''}` : '',
    p.headline ? `Headline: ${p.headline}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

function pastRolesLine(p: LinkedInProfile): string {
  const past = (p.all_employers ?? []).slice(0, 5);
  if (!past.length) return '';
  return past.map((e) => `${e.title || '?'} @ ${e.name || '?'}`).join(' → ');
}

function commonGround(user: LinkedInProfile, mentor: LinkedInProfile): string {
  const userSchools = new Set((user.education_background ?? []).map((e) => (e.institute_name || '').toLowerCase()).filter(Boolean));
  const mentorSchools = new Set((mentor.education_background ?? []).map((e) => (e.institute_name || '').toLowerCase()).filter(Boolean));
  const sharedSchool = [...userSchools].find((s) => mentorSchools.has(s));

  const userCompanies = new Set((user.all_employers ?? []).map((e) => (e.name || '').toLowerCase()).filter(Boolean));
  const mentorCompanies = (mentor.all_employers ?? []).map((e) => (e.name || '').toLowerCase());
  const sharedCompany = mentorCompanies.find((c) => userCompanies.has(c));

  const userField = (user.education_background?.[0]?.field_of_study || '').toLowerCase();
  const mentorField = (mentor.education_background?.[0]?.field_of_study || '').toLowerCase();
  const sharedField = userField && mentorField && (userField === mentorField || userField.includes(mentorField) || mentorField.includes(userField))
    ? userField
    : '';

  const bits = [];
  if (sharedSchool) bits.push(`shared school: ${sharedSchool}`);
  if (sharedCompany) bits.push(`shared employer: ${sharedCompany}`);
  if (sharedField) bits.push(`same field of study: ${sharedField}`);
  return bits.join(' · ');
}

export interface OutreachDraft {
  subject: string;
  message: string;
  rationale: string;
}

export async function generateOutreachDraft(
  user: LinkedInProfile,
  mentor: LinkedInProfile,
  goalTitle: string
): Promise<OutreachDraft> {
  const overlap = commonGround(user, mentor);
  const userBrief = profileBrief(user);
  const mentorBrief = profileBrief(mentor);
  const mentorPath = pastRolesLine(mentor);

  const prompt = `You are helping a real person draft a respectful, specific outreach message to ask a senior professional for a 20-minute career conversation.

USER (sender):
${userBrief}
Goal role: ${goalTitle}

MENTOR (recipient):
${mentorBrief}
Career path: ${mentorPath || 'unknown'}

OVERLAP: ${overlap || `no obvious overlap; lean on mentor's specific path to ${goalTitle}`}

Write a LinkedIn DM / cold email draft that:
- Opens with ONE concrete reason this specific mentor stands out (their path, a transition, an employer overlap, or a school overlap). No generic flattery.
- States who the user is in one sentence.
- Names the specific question or transition the user wants help with (toward "${goalTitle}").
- Asks for 15–20 minutes, suggests async (voice note / written) as an alternative.
- Stays under 110 words. No hashtags. No exclamation marks. No "I hope this finds you well".

Return ONLY valid JSON:
{
  "subject": "short subject line under 60 chars",
  "message": "the full draft body, plain text",
  "rationale": "1 sentence explaining the angle you used (so the user knows why)"
}`;

  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: 'You write concise, specific career outreach. Always return valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content || '{}';
  let parsed: Partial<OutreachDraft> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  return {
    subject: parsed.subject?.toString().slice(0, 80) || `Quick note from a ${user.current_title || 'fellow professional'}`,
    message:
      parsed.message?.toString().trim() ||
      `Hi ${mentor.name?.split(' ')[0] || 'there'},\n\nI saw your move into ${mentor.current_title || goalTitle}. I'm currently ${user.current_title || 'working in tech'} and exploring a similar transition into ${goalTitle}. Would you be open to a 15–20 minute chat — happy to do voice notes or async if easier.\n\nThanks for considering it.`,
    rationale: parsed.rationale?.toString() || 'Generic fallback — try again to get a more specific angle.',
  };
}
