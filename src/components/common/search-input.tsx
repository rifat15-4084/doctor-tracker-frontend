'use client';

import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Controlled search field. Typing is instant locally; the debouncing happens
 * in the hook that consumes it.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className,
  inputClassName,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
        />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-10 w-full rounded-xl border border-line bg-surface-2/60 pl-9 pr-9 text-sm text-fg placeholder:text-subtle',
            'transition-[border-color,box-shadow] duration-150 ease-swift',
            'focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/30',
            '[&::-webkit-search-cancel-button]:appearance-none',
            inputClassName,
          )}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-subtle transition-colors duration-150 hover:bg-surface-3 hover:text-fg"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
