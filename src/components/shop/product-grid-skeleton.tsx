import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.25rem] border border-border/70 bg-card/55 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-full" />
            <Skeleton className="h-3 w-52 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card/70"
          >
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-4 w-11/12 rounded-full" />
              <Skeleton className="h-4 w-8/12 rounded-full" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
