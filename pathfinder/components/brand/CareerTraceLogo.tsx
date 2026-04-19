'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type CareerTraceLogoProps = {
  className?: string;
  /** Viewbox is 48; scales with width/height classes */
  size?: number;
};

/**
 * Career journey motif: a rising path with milestones + spark for AI.
 */
export function CareerTraceLogo({ className, size = 44 }: CareerTraceLogoProps) {
  const rid = useId().replace(/:/g, '');
  const uid = `trace-${rid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={uid} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`${uid}-soft`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="14"
        fill={`url(#${uid}-soft)`}
        className="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
      <path
        d="M10 34 C 14 30, 18 24, 22 20 S 30 12, 38 10"
        fill="none"
        stroke={`url(#${uid})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="34" r="3.25" fill="#0d9488" />
      <circle cx="22" cy="20" r="3" fill="#14b8a6" />
      <circle cx="38" cy="10" r="3.5" fill="#2563eb" />
      <path
        d="M36 6l1.2 2.4L40 9l-2.4 1.2L36 12.5l-1.6-3.3L31 9l3.4-1.1z"
        fill="#f59e0b"
        opacity={0.95}
      />
    </svg>
  );
}
