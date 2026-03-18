export default function DashboardLoading(): React.ReactElement {
  return (
    <div>
      {/* Loading bar */}
      <div className="loading-bar mb-6" />

      {/* Page heading skeleton */}
      <div className="skeleton h-8 w-32" />

      {/* Stat cards skeleton */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-9 w-16 mb-1" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-8">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="border-b border-border bg-surface-alt px-5 py-3 flex gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex gap-8 items-center">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-10 ml-auto" />
              <div className="skeleton h-5 w-12 rounded-pill" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
