'use client';

import { usePathname } from 'next/navigation';
import { Brand, NAV_ITEMS, isActivePath } from './nav-items';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function TopBar() {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find((item) => isActivePath(pathname, item.href)) ?? NAV_ITEMS[0]!;

  return (
    <header className="glass sticky top-0 z-20 border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="lg:hidden">
            <Brand compact />
          </span>
          <div className="hidden lg:block">
            <p className="font-display text-sm font-semibold text-fg">{current.label}</p>
            <p className="text-[11px] text-subtle">{current.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
