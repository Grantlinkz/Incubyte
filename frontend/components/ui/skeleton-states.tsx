'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-border bg-card/60 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompensationChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Department Chart Skeleton (7 cols) */}
      <div className="lg:col-span-7 p-6 rounded-xl border border-border bg-card/60 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
        <div className="h-[280px] flex flex-col justify-between py-2 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-20 shrink-0" />
              <Skeleton
                className="h-6 rounded"
                style={{ width: `${Math.max(25, 100 - i * 14)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Country Distribution Skeleton (5 cols) */}
      <div className="lg:col-span-5 p-6 rounded-xl border border-border bg-card/60 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
            <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-background border border-border flex items-center justify-center">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rowCount = 10 }: { rowCount?: number }) {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          className="h-12 px-4 flex items-center justify-between gap-4 bg-card/30 animate-pulse"
        >
          {/* Checkbox & ID */}
          <div className="flex items-center gap-3 w-28 shrink-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3.5 w-16" />
          </div>

          {/* Employee Name & Email */}
          <div className="flex items-center gap-2.5 w-48 shrink-0">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </div>

          {/* Job Title */}
          <div className="w-36 shrink-0 hidden md:block">
            <Skeleton className="h-3.5 w-28" />
          </div>

          {/* Department */}
          <div className="w-28 shrink-0 hidden lg:block">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Location */}
          <div className="w-32 shrink-0 hidden sm:block">
            <Skeleton className="h-3.5 w-24" />
          </div>

          {/* Native Compensation */}
          <div className="w-32 shrink-0 text-right">
            <Skeleton className="h-3.5 w-20 ml-auto" />
            <Skeleton className="h-2.5 w-14 ml-auto mt-1" />
          </div>

          {/* Converted Base Currency */}
          <div className="w-28 shrink-0 text-right hidden xl:block">
            <Skeleton className="h-3.5 w-20 ml-auto" />
          </div>

          {/* Status */}
          <div className="w-20 shrink-0 hidden sm:block">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Actions */}
          <div className="w-8 shrink-0 text-right">
            <Skeleton className="h-7 w-7 rounded-md ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
