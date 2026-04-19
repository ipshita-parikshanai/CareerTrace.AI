import type { LinkedInProfile, MentorshipSignal } from '@/lib/types';

/**
 * Detect "open to mentorship" cues from a LinkedIn profile.
 *
 * CrustData does not expose a structured "open_to_mentoring" flag (LinkedIn's
 * creator-mode toggle isn't surfaced in the enrich API), so we pattern-match
 * the headline + summary text. This is intentionally tuned to be specific:
 * we'd rather miss a real signal than label random profiles as "open to mentor".
 */

const STRONG_PATTERNS: RegExp[] = [
  /\bopen\s+to\s+(?:mentor(?:ing|ship)?|mentees?|mentoring\s+(?:students|juniors|engineers))/i,
  /\b(?:happy|love)\s+to\s+mentor\b/i,
  /\b(?:i\s+)?mentor(?:\s+\w+){0,3}\s+(?:students|engineers|founders|aspiring|early.career|early.stage|new\s+grads|aspiring\s+\w+)/i,
  /\bcareer\s+coach(?:ing)?\b/i,
  /\bexecutive\s+coach\b/i,
  /\boffice\s+hours\b/i,
  /\b(?:advisor|advising)\b.*\b(?:students|founders|early.stage|startups)/i,
  /\bmentoring\s+(?:available|open)\b/i,
  /\bdm\s+(?:me\s+)?(?:if|for|to)\s+(?:you|chat|advice|career|mentorship|help)/i,
];

const MODERATE_PATTERNS: RegExp[] = [
  /\b(?:dms?|inbox)\s+(?:are\s+)?open\b/i,
  /\b(?:happy|always\s+happy)\s+to\s+(?:chat|connect|help|talk)\b/i,
  /\b(?:feel\s+free|don[\u2019']?t\s+hesitate)\s+to\s+(?:reach\s+out|message|connect|dm)/i,
  /\balways\s+open\s+(?:to|for)\s+(?:a\s+)?(?:chat|conversation|coffee)/i,
  /\b(?:reach\s+out|connect)\s+(?:if|for)\s+(?:advice|career|chat|coffee)/i,
  /\bpaying\s+it\s+forward\b/i,
];

const TEACHING_PATTERNS: RegExp[] = [
  /\bteaching\s+(?:engineers|students|founders|product|design)/i,
  /\b(?:i\s+)?(?:write|share|post)\s+(?:about|on)\s+(?:product|engineering|design|career|growth)/i,
  /\bcreator\s+(?:on\s+linkedin|economy)/i,
  /\bbuilding\s+in\s+public\b/i,
  /\bnewsletter\s+(?:on|about)\s+(?:product|engineering|career|tech)/i,
  /\b(?:speaker|workshop|workshops?\s+on)\b/i,
];

function scanText(text: string, patterns: RegExp[]): string[] {
  const hits: string[] = [];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

function shorten(s: string, maxLen = 80): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
}

export function detectMentorshipSignal(profile: LinkedInProfile): MentorshipSignal {
  const headline = (profile.headline || '').trim();
  const summary = (profile.summary || '').trim();
  const text = `${headline}\n${summary}`;

  if (!text.trim()) return { level: 'none', evidence: [] };

  const strong = scanText(text, STRONG_PATTERNS);
  if (strong.length > 0) {
    return {
      level: 'strong',
      evidence: strong.slice(0, 2).map((s) => `"${shorten(s)}"`),
    };
  }

  const moderate = scanText(text, MODERATE_PATTERNS);
  if (moderate.length > 0) {
    return {
      level: 'moderate',
      evidence: moderate.slice(0, 2).map((s) => `"${shorten(s)}"`),
    };
  }

  const teaching = scanText(text, TEACHING_PATTERNS);
  if (teaching.length > 0) {
    return {
      level: 'teaching',
      evidence: teaching.slice(0, 2).map((s) => `"${shorten(s)}"`),
    };
  }

  return { level: 'none', evidence: [] };
}

/** Points awarded for the affinity engine's mentorship bucket. */
export function mentorshipPointsForLevel(level: MentorshipSignal['level']): number {
  switch (level) {
    case 'strong':
      return 10;
    case 'moderate':
      return 6;
    case 'teaching':
      return 4;
    default:
      return 0;
  }
}

export function mentorshipBadgeLabel(level: MentorshipSignal['level']): string | null {
  switch (level) {
    case 'strong':
      return 'Open to mentor';
    case 'moderate':
      return 'Open to chat';
    case 'teaching':
      return 'Shares advice';
    default:
      return null;
  }
}
