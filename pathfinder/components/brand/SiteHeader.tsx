'use client';

import Link from 'next/link';
import { CareerTraceLogo } from '@/components/brand/CareerTraceLogo';
import { CareerTraceWordmark } from '@/components/brand/CareerTraceWordmark';
import { ThemeToggle } from '@/components/brand/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  variant?: 'home' | 'app';
  /** When variant is app, show back / new search */
  onNewSearch?: () => void;
};

export function SiteHeader({ variant = 'home', onNewSearch }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-teal-100/60 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 dark:border-slate-700/80 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/70',
        variant === 'app' && 'sticky top-0 z-50 shadow-sm shadow-teal-900/5 dark:shadow-black/20'
      )}
    >
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl p-1 -m-1 transition-all duration-300 hover:bg-teal-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:hover:bg-slate-800/80"
          >
            <CareerTraceLogo className="transition-transform duration-300 group-hover:scale-105" />
            <CareerTraceWordmark size={variant === 'home' ? 'md' : 'sm'} />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {variant === 'app' && onNewSearch && (
              <Button
                variant="outline"
                onClick={onNewSearch}
                className="shrink-0 border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:border-teal-300 hover:bg-teal-50/90 hover:shadow-md active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-teal-500/50 dark:hover:bg-slate-700/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                New search
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
