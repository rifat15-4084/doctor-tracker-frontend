import { Skeleton } from '@/components/ui/skeleton';

/** Fallback while the dashboard route bundle resolves. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-2xl lg:col-span-2 lg:last:col-span-1" />
        ))}
      </div>

      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
