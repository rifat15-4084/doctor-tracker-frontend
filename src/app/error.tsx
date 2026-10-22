'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/common/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real deployment this is where an error reporter would be called.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md text-center">
        <ErrorState
          title="The application hit an unexpected error"
          message={error.message || 'Please reload the page and try again.'}
        />
        <Button className="mt-2" onClick={reset}>
          Reload
        </Button>
      </div>
    </div>
  );
}
