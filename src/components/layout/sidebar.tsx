'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Brand, NavLinks } from './nav-items';

/** Fixed sidebar — hidden below the `lg` breakpoint (mobile uses a bottom bar). */
export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line lg:flex">
      <div className="px-5 py-5">
        <Brand />
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">
          Workspace
        </p>
        <NavLinks />
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{user?.name ?? 'Administrator'}</p>
            <p className="truncate text-[11px] text-subtle">{user?.email ?? ''}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </aside>
  );
}
