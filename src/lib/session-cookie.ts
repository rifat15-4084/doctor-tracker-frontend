/**
 * Session *hint* cookie.
 *
 * The authoritative session lives in the httpOnly cookie `dt_token`, which is
 * set by the API and can never be read by JavaScript. That cookie is scoped to
 * the API origin, so a Next.js middleware running on the frontend origin
 * cannot see it - and in a cross-domain deployment (Vercel frontend + Render
 * API) the browser never even sends it to the frontend.
 *
 * To still be able to redirect unauthenticated visitors *before* a page
 * renders, the frontend keeps its own tiny, readable marker cookie:
 *
 *   - it is set by the client right after a successful `POST /auth/login`
 *   - it is cleared on logout and whenever the API reports a 401
 *   - it carries **no** session material - it only says "a session may exist"
 *
 * The middleware uses it purely as a redirect hint; the real gate stays the
 * API's auth middleware plus the client-side `AuthGuard`.
 */

/** Name of the hint cookie (kept in sync with `NEXT_PUBLIC_AUTH_COOKIE`). */
export const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE || 'dt_session';

/** One year - the hint only has to outlive a browser session. */
const HINT_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Mark the browser as "probably signed in".
 * Safe to call on the server: it is a no-op there.
 */
export function setSessionHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${HINT_MAX_AGE}; samesite=lax`;
}

/**
 * Remove the hint (logout, or the API reported an expired session).
 * Safe to call on the server: it is a no-op there.
 */
export function clearSessionHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Read the hint (client only).
 * @returns {boolean} true when the browser believes a session exists
 */
export function hasSessionHint(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((entry) => entry.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
}
