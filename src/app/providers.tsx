'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/hooks/use-theme';
import { assertDemoModeSafe } from '@/lib/demo-mode';

function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      closeButton
      richColors
      // Clear the sticky top bar so a toast can never cover the theme
      // toggle or the user menu.
      offset={{ top: '4.75rem' }}
      mobileOffset={{ top: '4.75rem' }}
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border border-line bg-surface text-fg shadow-card text-sm font-sans',
          description: 'text-subtle',
        },
      }}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keeps the UI instant: data is considered fresh for 30s.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  // Warns if a production build was created with demo mode explicitly enabled.
  useEffect(() => {
    assertDemoModeSafe();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
