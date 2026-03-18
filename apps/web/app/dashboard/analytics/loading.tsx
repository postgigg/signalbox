export default function AnalyticsLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-24" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-16 rounded-sm" />
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Funnel skeleton */}
      <div className="mt-8">
        <div className="skeleton h-6 w-36 mb-4" />
        <div className="card">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-3 w-24 flex-shrink-0" />
                <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                  <div className="skeleton h-full rounded-sm" style={{ width: `${80 - i * 15}%` }} />
                </div>
                <div className="skeleton h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="mt-8">
        <div className="skeleton h-6 w-44 mb-4" />
        <div className="card min-h-[240px] flex items-end gap-1 p-5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 skeleton rounded-t-sm"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
