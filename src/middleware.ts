import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route guard for the authenticated portal.
 *
 * The session itself lives in the httpOnly cookie `dt_token`, which is set by
 * the REST API on a *different origin* than this Next.js app. The browser
 * therefore never sends it to the frontend host, and a middleware that tried
 * to read it would always see "no session" and bounce signed-in users to the
 * login screen.
 *
 * What the middleware can read is the small, readable *hint* cookie
 * (`dt_session`) that the frontend writes after a successful login. It is
 * used here purely as a redirect hint:
 *
 *   - a private route without a hint  -> redirect to `/login?next=...`
 *   - a private route with a hint     -> render (the API + `AuthGuard`
 *                                       perform the real authorisation)
 *   - `/login`                        -> always render (the page itself
 *                                       redirects signed-in users onwards)
 *
 * The hint is *not* a credential: it grants no access to any data, and every
 * API call is independently authorised by the backend.
 */

/** Name of the hint cookie (kept in sync with `NEXT_PUBLIC_AUTH_COOKIE`). */
const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE || 'dt_session';

/** Routes that are reachable without a session. */
const PUBLIC_ROUTES = ['/login'];

/** True when the pathname belongs to a public route. */
const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Public routes are always served - the login page decides on its own
  // whether an already-authenticated visitor should be forwarded onwards.
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const hasHint = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  if (hasHint) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  const next = `${pathname}${search}`;
  if (next && next !== '/') {
    url.search = `?next=${encodeURIComponent(next)}`;
  }

  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Run the guard on every page route, but never on API routes, Next.js
   * internals or static assets.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
};
