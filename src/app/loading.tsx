import { Skeleton } from '@/components/ui/skeleton';

/** Top-level route transition fallback (e.g. `/` → `/dashboard`). */
export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Skeleton className="h-9 w-40 rounded-xl" />
    </div>
  );
}
