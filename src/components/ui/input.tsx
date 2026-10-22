'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-xl border bg-surface-2/60 px-3 text-sm text-fg placeholder:text-subtle',
        'transition-[border-color,box-shadow,background-color] duration-150 ease-swift',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid
          ? 'border-danger/70 focus:border-danger focus:ring-danger/25'
          : 'border-line hover:border-line-strong',
        className,
      )}
      {...props}
    />
  );
});
