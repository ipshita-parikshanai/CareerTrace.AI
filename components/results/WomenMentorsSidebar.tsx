'use client';

import { ExternalLink, Sparkles } from 'lucide-react';
import { pickWomenMentorsForGoal } from '@/lib/mentors/women-mentors';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface WomenMentorsSidebarProps {
  goalTitle: string;
  className?: string;
}

/**
 * Curated panel of inspiring women role models for the user's goal.
 * Hand-picked (no gender inference) — list lives in `data/women-mentors.json`.
 */
export function WomenMentorsSidebar({ goalTitle, className }: WomenMentorsSidebarProps) {
  const { category, mentors } = pickWomenMentorsForGoal(goalTitle, 3);
  if (mentors.length === 0) return null;

  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 p-5 shadow-sm dark:border-rose-900/50 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20 ${className ?? ''}`}
    >
      <div className="mb-4">
        <p className="font-heading flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <Sparkles className="h-3.5 w-3.5" />
          Women who walked this path
        </p>
        <h3 className="font-heading mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
          Role models in {category === 'general' ? 'leadership' : category}
        </h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Hand-picked women whose paths to {goalTitle || 'your goal'} are worth studying.
        </p>
      </div>

      <ul className="space-y-3">
        {mentors.map((m) => (
          <li
            key={m.profileUrl}
            className="rounded-xl border border-rose-100 bg-white/80 p-3 transition-all hover:border-rose-300 hover:shadow-sm dark:border-rose-900/40 dark:bg-slate-900/60 dark:hover:border-rose-700/60"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-rose-100 dark:ring-rose-900/40">
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 font-heading text-xs font-bold text-white">
                  {m.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <a
                  href={m.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-rose-700 dark:text-slate-100 dark:hover:text-rose-300"
                >
                  {m.name}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{m.currentRole}</p>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                  {m.inspiration}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
        Curated, not auto-generated. Submit a name to add to this list.
      </p>
    </aside>
  );
}
