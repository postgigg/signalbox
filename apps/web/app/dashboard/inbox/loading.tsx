export default function InboxLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-5 w-20 rounded-pill" />
        </div>
        <div className="skeleton h-4 w-16" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="skeleton h-10 w-full rounded-sm" />
        </div>
        <div className="skeleton h-10 w-[140px] rounded-sm" />
      </div>

      {/* Email list skeleton */}
      <div className="mt-4 bg-surface border border-border rounded-md overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-5 py-2.5 flex items-center gap-4">
          <div className="skeleton h-4 w-4 rounded-sm" />
          <div className="skeleton h-3 w-3" />
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-14 flex-1" />
          <div className="skeleton h-3 w-16" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-border last:border-0 flex items-center gap-4"
          >
            <div className="skeleton h-4 w-4 rounded-sm" />
            <div className="skeleton h-4 w-4" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-64 flex-1" />
            <div className="skeleton h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
