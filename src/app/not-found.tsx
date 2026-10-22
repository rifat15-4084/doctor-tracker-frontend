'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div aria-hidden className="app-aurora pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="app-grid pointer-events-none fixed inset-0 -z-10 opacity-60" />

      <div className="w-full max-w-md text-center">
        <span
          aria-hidden
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-subtle"
        >
          <Compass className="h-5 w-5" />
        </span>

        <p className="font-display text-6xl font-semibold tracking-tight text-gradient">404</p>

        <h1 className="mt-3 font-display text-xl font-semibold text-fg">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-subtle">
          The page you are looking for does not exist or may have been moved. Check the URL, or
          head back to the dashboard.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
          >
            Go back
          </Button>
          <Link href="/dashboard">
            <Button>Open dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
