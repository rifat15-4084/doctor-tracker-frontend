import { cn, initials } from '@/lib/utils';

export interface AvatarProps {
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
} as const;

/**
 * Initials-only avatar. No network requests, no image decoding — keeps the
 * table rendering instant.
 */
export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold text-white',
        'bg-gradient-to-br from-accent-cyan/85 to-accent-violet/85 ring-1 ring-inset ring-white/15',
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
