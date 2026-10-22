import { Skeleton } from '@/components/ui/skeleton';

/** Fallback while a single doctor's record resolves. */
export default function DoctorDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />

      <div className="glass rounded-2xl border border-line p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-line">
        <div className="border-b border-line p-4">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
