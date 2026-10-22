'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your practice',
  },
  {
    href: '/doctors',
    label: 'Doctors',
    icon: Stethoscope,
    description: 'Manage the doctor directory',
  },
  {
    href: '/patients',
    label: 'Patients',
    icon: Users,
    description: 'Track and update patients',
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-swift',
              active
                ? 'bg-surface-2 text-fg'
                : 'text-muted hover:bg-surface-2/60 hover:text-fg',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-accent-cyan to-accent-violet transition-opacity duration-150',
                active ? 'opacity-100' : 'opacity-0',
              )}
            />
            <Icon
              aria-hidden
              className={cn(
                'h-4 w-4 shrink-0 transition-colors duration-150',
                active ? 'text-accent-cyan' : 'text-subtle group-hover:text-muted',
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-xl transition-opacity duration-150 hover:opacity-90"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet text-white shadow-glow"
      >
        <Stethoscope className="h-4.5 w-4.5" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-tight text-fg">
            Doctor Tracker
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-subtle">Admin portal</span>
        </span>
      ) : null}
    </Link>
  );
}
