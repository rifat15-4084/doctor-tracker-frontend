'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/services/api';
import { clearSessionHint, setSessionHint } from '@/lib/session-cookie';
import type { LoginPayload, User } from '@/types';

export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

interface UseAuthOptions {
  /** Disable the session lookup (used on the login screen). */
  enabled?: boolean;
}

/**
 * Session state for the whole portal.
 * - `user` is hydrated from `GET /auth/me` (the session lives in an httpOnly cookie).
 * - `login` / `logout` are mutations that keep the query cache in sync.
 *
 * The hook also maintains the small "session hint" cookie that the Next.js
 * middleware uses to redirect visitors before a page renders. The hint is
 * never a credential - the API remains the only authority.
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const router = useRouter();

  const session = useQuery({
    queryKey: authKeys.me,
    queryFn: authService.me,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // A confirmed session always refreshes the middleware hint. This also
  // repairs the hint when it was lost (cleared cookies, new browser tab)
  // while the API session is still valid.
  useEffect(() => {
    if (session.data) setSessionHint();
  }, [session.data]);

  const login = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user: User) => {
      setSessionHint();
      queryClient.setQueryData(authKeys.me, user);
    },
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSessionHint();
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    },
  });

  return {
    user: session.data ?? null,
    isLoading: session.isLoading,
    isError: session.isError,
    error: session.error as ApiError | null,
    isAuthenticated: Boolean(session.data),
    refetch: session.refetch,
    login,
    logout,
  };
}
