export function AnalyticsSkeleton(): React.ReactElement {
  return (
    <div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-3 w-20 mb-2" />
            <div className="skeleton h-6 w-14" />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="skeleton h-6 w-36 mb-4" />
        <div className="card">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-3 w-20 flex-shrink-0" />
                <div className="flex-1 skeleton h-7 rounded-sm" style={{ width: `${80 - i * 15}%` }} />
                <div className="skeleton h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="skeleton h-6 w-44 mb-4" />
        <div className="card min-h-[200px] flex items-end gap-1 p-5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 skeleton rounded-t-sm" style={{ height: `${30 + ((i * 17) % 50)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
