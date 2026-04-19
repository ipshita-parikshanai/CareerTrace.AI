import { cn } from '@/lib/utils';

type CareerTraceWordmarkProps = {
  className?: string;
  /** Larger for hero, smaller for nav */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClass = {
  sm: 'text-lg md:text-xl',
  md: 'text-xl md:text-2xl',
  lg: 'text-3xl md:text-4xl',
};

export function CareerTraceWordmark({ className, size = 'md' }: CareerTraceWordmarkProps) {
  return (
    <span
      className={cn(
        'font-heading font-bold tracking-tight text-slate-800 select-none',
        sizeClass[size],
        className
      )}
    >
      CareerTrace
      <span className="text-slate-400 font-semibold">.</span>
      <span className="bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
        AI
      </span>
    </span>
  );
}
