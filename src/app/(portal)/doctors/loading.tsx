import { Skeleton } from '@/components/ui/skeleton';

/** Fallback while the doctors list route resolves. */
export default function DoctorsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="glass rounded-2xl border border-line p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-line">
        <div className="border-b border-line p-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
