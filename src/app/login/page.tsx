'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff, Info, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { DEMO_CREDENTIALS, IS_DEMO_MODE } from '@/lib/demo-mode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { ApiError } from '@/services/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The session lookup is enabled here so that an already-authenticated visitor
  // is bounced straight to the dashboard (this used to be middleware's job).
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  // Set right after a deliberate sign-in so the effect below does not race the
  // redirect we already perform in `onSubmit`.
  const signedInViaForm = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login.mutateAsync(values);
      toast.success(`Welcome back, ${user.name?.split(' ')[0] ?? 'there'}`);
      signedInViaForm.current = true;
      const next = searchParams.get('next');
      const target = next && next.startsWith('/') ? next : '/dashboard';
      router.replace(target);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to sign in right now. Please try again.';
      toast.error(message);
    }
  });

  // Already signed in (e.g. bookmarked /login) → skip the form entirely.
  useEffect(() => {
    if (!isAuthenticated || signedInViaForm.current) return;
    const next = searchParams.get('next');
    router.replace(next && next.startsWith('/') ? next : '/dashboard');
  }, [isAuthenticated, router, searchParams]);

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 text-center">
        <span
          aria-hidden
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-violet text-white shadow-glow"
        >
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Sign in to <span className="text-gradient">Doctor Tracker</span>
        </h1>
        <p className="mt-2 text-sm text-subtle">
          Secure access for practice managers and administrators.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="glass rounded-2xl border border-line p-6 shadow-card sm:p-7"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" required>
              Work email
            </Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@hospital.org"
                className="pl-9"
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
            </div>
            {errors.email ? (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-danger">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9 pr-10"
                invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle transition-colors duration-150 hover:text-fg"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-danger">
                {errors.password.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full"
          loading={isSubmitting || login.isPending}
          rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Sign in
        </Button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-subtle">
          Sessions are secured with an httpOnly cookie. Never share your credentials.
        </p>
      </form>

      {/*
        Only reachable when NEXT_PUBLIC_DEMO_MODE === "true" was baked into the
        build; otherwise this whole block is removed by dead-code elimination.
      */}
      {IS_DEMO_MODE ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4">
          <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
          <div className="text-xs leading-relaxed text-subtle">
            <p className="font-medium text-fg">Demo mode is enabled</p>
            <p className="mt-1">
              Sign in with{' '}
              <code className="rounded bg-bg px-1 py-0.5 text-[11px] text-fg">
                {DEMO_CREDENTIALS.email}
              </code>{' '}
              /{' '}
              <code className="rounded bg-bg px-1 py-0.5 text-[11px] text-fg">
                {DEMO_CREDENTIALS.password}
              </code>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-[420px]">
      <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-2xl" />
      <Skeleton className="mx-auto h-7 w-64" />
      <Skeleton className="mx-auto mt-3 h-4 w-80" />
      <div className="glass mt-8 space-y-4 rounded-2xl border border-line p-7">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <div aria-hidden className="app-aurora pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="app-grid pointer-events-none fixed inset-0 -z-10 opacity-60" />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
