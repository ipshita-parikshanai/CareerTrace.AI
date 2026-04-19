/**
 * Curated, hand-picked list of inspiring women role models.
 * Surfaced alongside cascade-search results as a "Women who walked this path"
 * sidebar — no name-based gender inference, no algorithmic guessing.
 *
 * Source of truth: `data/women-mentors.json`. Edit that file to add mentors.
 *
 * NOTE on the `general` category: there's a single Shreyas Doshi entry in
 * `product` we explicitly flag (he's male) so callers know to skip it when
 * the category is meant to highlight women. We filter it out here.
 */

import mentorsData from '@/data/women-mentors.json';

export interface WomenMentor {
  name: string;
  currentRole: string;
  company: string;
  profileUrl: string;
  inspiration: string;
}

export interface WomenMentorCategory {
  match_keywords: string[];
  mentors: WomenMentor[];
}

type MentorsFile = {
  _meta?: { purpose?: string; lastUpdatedAt?: string };
  categories: Record<string, WomenMentorCategory>;
};

const KNOWN_MALE_NAMES = new Set(['shreyas doshi']);

function isWoman(m: WomenMentor): boolean {
  return !KNOWN_MALE_NAMES.has(m.name.trim().toLowerCase());
}

const FILE: MentorsFile = mentorsData as MentorsFile;

/** Pick the best matching category for a goal title (or fall back to "general"). */
export function categorizeGoal(goalTitle: string): keyof MentorsFile['categories'] {
  const t = goalTitle.toLowerCase();
  let bestKey = 'general';
  let bestScore = 0;
  for (const [key, cat] of Object.entries(FILE.categories)) {
    if (key === 'general') continue;
    let score = 0;
    for (const kw of cat.match_keywords) {
      if (t.includes(kw.toLowerCase())) score += kw.length; // longer = more specific
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  return bestKey;
}

export function pickWomenMentorsForGoal(goalTitle: string, max = 3): {
  category: string;
  mentors: WomenMentor[];
} {
  const category = categorizeGoal(goalTitle);
  const cat = FILE.categories[category];
  const out: WomenMentor[] = [];
  if (cat) {
    for (const m of cat.mentors) {
      if (out.length >= max) break;
      if (isWoman(m)) out.push(m);
    }
  }
  if (out.length < max && category !== 'general') {
    const general = FILE.categories.general;
    if (general) {
      for (const m of general.mentors) {
        if (out.length >= max) break;
        if (isWoman(m)) out.push(m);
      }
    }
  }
  return { category, mentors: out };
}
