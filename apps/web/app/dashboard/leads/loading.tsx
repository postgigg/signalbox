export default function LeadsLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-4 w-16" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="skeleton h-10 w-full rounded-sm" />
        </div>
        <div className="skeleton h-10 w-[120px] rounded-sm" />
        <div className="skeleton h-10 w-[140px] rounded-sm" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-[130px] rounded-sm" />
          <div className="skeleton h-3 w-4" />
          <div className="skeleton h-10 w-[130px] rounded-sm" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mt-4 bg-surface border border-border rounded-md overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-5 py-3 flex gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-3 w-14" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex gap-8 items-center">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-44" />
            <div className="skeleton h-4 w-8 ml-auto" />
            <div className="skeleton h-5 w-12 rounded-pill" />
            <div className="skeleton h-5 w-16 rounded-pill" />
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
