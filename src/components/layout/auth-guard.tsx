'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/services/api';
import { clearSessionHint } from '@/lib/session-cookie';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Placeholder shown while `GET /auth/me` is in flight. Mirrors the portal
 * layout so the first paint does not jump when the session resolves.
 */
export function AuthGuardSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[264px] shrink-0 border-r border-line p-5 lg:block">
        <Skeleton className="h-9 w-36" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Client-side route guard for the authenticated portal.
 *
 * Route protection is deliberately **not** done in `middleware.ts`. In a
 * deployed (e.g. Vercel) setup the REST API is served from a different domain,
 * and the session cookie is scoped to that domain — the browser never attaches
 * it to requests for the frontend origin, so `request.cookies.get(...)` in
 * middleware would always be empty and every visitor would be redirected to
 * the login screen.
 *
 * Instead the session is verified against the API itself: `GET /auth/me` runs
 * on load (the browser *does* send the cookie to the API domain), a skeleton
 * is shown while it resolves, and a 401 sends the user to `/login` with the
 * original path preserved in `?next=`.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isError, error, refetch } = useAuth();

  const unauthenticated = isError && (error as ApiError | null)?.isUnauthorized === true;

  useEffect(() => {
    if (!unauthenticated) return;
    // The API says the session is gone - drop the middleware hint too, so a
    // stale cookie can never let the next navigation through.
    clearSessionHint();
    const next = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [unauthenticated, pathname, router]);

  // Still verifying, or already on the way to the login screen.
  if (isLoading || unauthenticated) {
    return <AuthGuardSkeleton />;
  }

  // Reachable API but the session lookup failed (network blip, 5xx): let the
  // user retry instead of bouncing them to a login screen they may not need.
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          title="We could not verify your session"
          message={error?.message ?? 'Please try again in a moment.'}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return <>{children}</>;
}
