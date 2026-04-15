export default function LoadingSkeleton({ variant }) {
  if (variant === "detail") {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="aspect-[3/4] animate-pulse rounded-2xl border border-border bg-surface" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-11/12 animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-9/12 animate-pulse rounded-xl bg-surface" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    );
  }

  if (variant === "player") {
    return (
      <div className="space-y-3">
        <div className="h-[60vh] animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="h-16 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    );
  }

  // default grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="aspect-[16/10] animate-pulse bg-surface-2" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-surface-2" />
            <div className="h-4 w-11/12 animate-pulse rounded-xl bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
