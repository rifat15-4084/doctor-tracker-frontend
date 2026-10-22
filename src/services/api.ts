import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { clearSessionHint } from '@/lib/session-cookie';

/**
 * Base URL of the REST API, injected at build time from `NEXT_PUBLIC_API_URL`.
 *
 * There is deliberately **no hardcoded fallback**: the value must come from the
 * environment (`.env.local` locally, Vercel project settings in production) so
 * a deployment can never silently point at a developer's machine.
 */
const RAW_API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL?.trim();

/** Normalised base URL, or `null` when the environment variable is missing. */
export const API_BASE_URL: string | null = RAW_API_URL
  ? RAW_API_URL.replace(/\/+$/, '')
  : null;

if (!API_BASE_URL && typeof window !== 'undefined') {
  // Loud, early signal in dev. In production the guard below turns every call
  // into a descriptive error instead of a request to a bogus host.
  console.error(
    '[doctor-tracker] NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local ' +
      'and point it at your REST API.',
  );
}

export const api: AxiosInstance = axios.create({
  // `API_BASE_URL` is null only when misconfigured; axios then falls back to a
  // relative path and the guard below raises a clear error on the first call.
  baseURL: API_BASE_URL ?? '/api',
  // The session lives in an httpOnly cookie, so every call must include it.
  withCredentials: true,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;

    const errors = (details as { errors?: unknown })?.errors;
    if (errors && typeof errors === 'object') {
      this.fieldErrors = errors as Record<string, string>;
    }
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

function resolveMessage(status: number, payload: any): string {
  if (status === 0) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  // The server message is the most specific one, so it always wins.
  if (status === 401) return payload?.message || 'Your session has expired. Please sign in again.';
  if (status === 403) return payload?.message || 'You do not have permission to perform this action.';
  if (status === 404) return payload?.message || 'The requested resource was not found.';
  if (status === 409) return payload?.message || 'That record already exists.';
  if (status === 422) return payload?.message || 'Some of the submitted data is invalid.';
  if (status >= 500) return payload?.message || 'The server ran into a problem. Please try again shortly.';
  return payload?.message || 'Something went wrong. Please try again.';
}

/**
 * Request-level guard: with no `NEXT_PUBLIC_API_URL` every request would
 * silently hit the app's own origin, so fail loudly instead of 404-ing.
 */
api.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    throw new AxiosError(
      'NEXT_PUBLIC_API_URL is not set — the frontend does not know where the API lives.',
      'ERR_MISSING_API_URL',
      config,
    );
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const apiError = new ApiError(resolveMessage(status, payload), status, payload);

    // A 401 anywhere means the session is gone — bounce to the login screen and
    // remember where the user was so they can be returned after signing in.
    // The AuthGuard handles the initial `/auth/me` probe itself.
    const url = typeof error.config?.url === 'string' ? error.config.url : '';
    const isSessionProbe = url.endsWith('/auth/me');

    if (
      status === 401 &&
      !isSessionProbe &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      // The session is gone for good - drop the middleware hint as well so a
      // later navigation cannot be let through by a stale cookie.
      clearSessionHint();

      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    }

    return Promise.reject(apiError);
  },
);

/** Unwraps the `{ data: ... }` envelope used by the API. */
export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/** Thin typed wrapper around the axios instance. */
export async function request<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await api.request<unknown>(config);
  return unwrapData<T>(response.data);
}
