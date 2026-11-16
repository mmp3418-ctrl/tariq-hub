export function CatalogSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-8 space-y-3" aria-hidden="true">
      <div className="flex flex-wrap gap-2">
        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-7 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-line bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950"
          />
        ))}
      </div>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-12" aria-hidden="true">
      <div className="h-80 animate-pulse rounded-2xl bg-slate-800/80 lg:col-span-5" />
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-slate-100 dark:bg-slate-900 lg:col-span-7" />
    </div>
  );
}
