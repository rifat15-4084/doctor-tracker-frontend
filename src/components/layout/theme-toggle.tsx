'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-2/60 text-muted',
        'transition-colors duration-150 ease-swift hover:border-line-strong hover:text-fg',
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          'absolute h-4 w-4 transition-opacity duration-150',
          isDark ? 'opacity-0' : 'opacity-100',
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          'absolute h-4 w-4 transition-opacity duration-150',
          isDark ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  );
}
