export default function WidgetsLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-10 w-32 rounded-md" />
      </div>

      {/* Widget cards skeleton */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="skeleton h-5 w-28 mb-1" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-5 w-14 rounded-pill" />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div>
                <div className="skeleton h-3 w-20 mb-1" />
                <div className="skeleton h-6 w-10" />
              </div>
              <div>
                <div className="skeleton h-3 w-16 mb-1" />
                <div className="skeleton h-6 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
