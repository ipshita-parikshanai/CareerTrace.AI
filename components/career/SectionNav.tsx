'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export interface SectionNavItem {
  id: string;
  label: string;
  /** Lucide icon component (optional, for visual anchor) */
  Icon?: React.ComponentType<{ className?: string }>;
  /** Show this item only when condition is true (e.g. "Insights" only when ready) */
  visible?: boolean;
}

interface SectionNavProps {
  sections: SectionNavItem[];
  /** When true, the nav becomes a horizontal pill bar that sticks under the site header. */
  stickyOffset?: number;
}

/**
 * Sticky in-page navigation: a horizontally scrolling pill bar that follows
 * scroll position and highlights the section currently in view. Tapping a pill
 * smooth-scrolls to that section.
 *
 * The sections themselves must have matching `id` attributes (we wrap them in
 * `<SectionAnchor id="...">` below). This lets the user jump anywhere on a long
 * page without scrolling.
 */
export function SectionNav({ sections, stickyOffset = 64 }: SectionNavProps) {
  const visible = sections.filter((s) => s.visible !== false);
  const [active, setActive] = useState<string>(visible[0]?.id ?? '');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track which section is in view using IntersectionObserver
    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry that's most visible AND closest to the top of the viewport
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibleEntries.length > 0) {
          setActive(visibleEntries[0].target.id);
        }
      },
      {
        // Trigger when the section's top is within the upper 30% of the viewport
        rootMargin: `-${stickyOffset + 20}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    for (const s of visible) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    observerRef.current = observer;

    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [visible, stickyOffset]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset - 12;
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  };

  if (visible.length === 0) return null;

  return (
    <>
      <div
        className="sticky z-30 -mx-4 mb-6 border-b border-slate-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md md:-mx-0 md:rounded-full md:border md:border-slate-200/80 md:bg-white/95 md:px-2 md:py-2 md:shadow-md"
        style={{ top: stickyOffset }}
      >
        <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto md:flex-wrap md:justify-center md:gap-2">
          {visible.map((s) => {
            const isActive = active === s.id;
            const Icon = s.Icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`font-heading inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating "back to top" button */}
      {showBackToTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="motion-safe:animate-career-rise fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </>
  );
}

interface SectionAnchorProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/** Wrap any major section so the SectionNav can scroll to it. */
export function SectionAnchor({ id, children, className }: SectionAnchorProps) {
  return (
    <section id={id} className={className} style={{ scrollMarginTop: 96 }}>
      {children}
    </section>
  );
}
