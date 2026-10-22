/**
 * Demo mode gate.
 *
 * Demo mode lets the portal be showcased against the bundled mock API
 * (`mock-api/server.mjs`) without a real backend. It must never be able to
 * switch itself on by accident:
 *
 * - It is **off unless `NEXT_PUBLIC_DEMO_MODE` is exactly `"true"`**. Any other
 *   value (`1`, `yes`, `TRUE`, an empty string, or the variable being absent)
 *   evaluates to `false`, so a typo can only ever disable it.
 * - `NEXT_PUBLIC_*` variables are inlined at build time by Next.js. In any build
 *   where the flag is not set, the whole expression folds to `false` and the
 *   demo branches are removed from the bundle by dead-code elimination.
 * - `assertDemoModeSafe()` logs a warning in production builds where demo mode
 *   *was* explicitly enabled, so it cannot be shipped silently.
 */

const RAW: string | undefined = process.env.NEXT_PUBLIC_DEMO_MODE;

/** The single source of truth for demo behaviour across the app. */
export const IS_DEMO_MODE: boolean = RAW === 'true';

/** True only in a production build — used to warn about a misconfiguration. */
const IS_PRODUCTION_BUILD: boolean = process.env.NODE_ENV === 'production';

/**
 * Surfaces a console warning when a production build was created with demo
 * mode enabled. Called once from the app providers so the message is
 * attributable.
 */
export function assertDemoModeSafe(): void {
  if (!IS_DEMO_MODE || !IS_PRODUCTION_BUILD || typeof window === 'undefined') return;
  console.warn(
    '[doctor-tracker] NEXT_PUBLIC_DEMO_MODE=true was baked into this production build. ' +
      'Demo data is being served by the mock API — remove the flag before shipping.',
  );
}

/**
 * Credentials for the bundled demo backend, surfaced on the login screen only
 * when demo mode is explicitly enabled. These are seeded, throwaway values and
 * are not secrets.
 */
export const DEMO_CREDENTIALS = {
  email: 'admin@doctortracker.com',
  password: 'Admin@12345',
} as const;
