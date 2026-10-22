'use client';

import { Suspense, type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileNav } from './mobile-nav';
import { AuthGuard, AuthGuardSkeleton } from './auth-guard';

/**
 * Application shell: sidebar (desktop), top bar, mobile bottom navigation and
 * the routed content.
 *
 * Route protection lives in {@link AuthGuard} (client-side `GET /auth/me`)
 * rather than in middleware — see that component for why a cross-domain
 * session cookie cannot be read server-side.
 */
export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-bg">
        {/* Static, CSS-only backdrop — no images, no filters, no animation. */}
        <div aria-hidden className="app-aurora pointer-events-none fixed inset-0 -z-10" />
        <div aria-hidden className="app-grid pointer-events-none fixed inset-0 -z-10 opacity-60" />

        <Sidebar />

        <div className="lg:pl-[264px]">
          <TopBar />
          <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
            <Suspense fallback={<AuthGuardSkeleton />}>{children}</Suspense>
          </main>
        </div>

        <MobileNav />
      </div>
    </AuthGuard>
  );
}
