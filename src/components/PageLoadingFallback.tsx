import { Skeleton } from "@/components/ui/skeleton";

export const PageLoadingFallback = () => (
  <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
    <div className="container mx-auto max-w-6xl space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);
