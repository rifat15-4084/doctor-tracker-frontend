'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 py-1.5 pl-1.5 pr-2.5',
          'transition-colors duration-150 ease-swift hover:border-line-strong',
        )}
      >
        <Avatar name={user?.name} size="xs" />
        <span className="hidden max-w-[140px] truncate text-xs font-medium text-fg sm:block">
          {user?.name ?? 'Administrator'}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            'h-3.5 w-3.5 text-subtle transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{user?.name ?? 'Administrator'}</p>
              <p className="truncate text-[11px] text-subtle">{user?.email ?? ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[11px] text-subtle">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
            Signed in as {user?.role ?? 'administrator'}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
