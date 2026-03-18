export default function WidgetDetailLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-4 w-2" />
        <div className="skeleton h-4 w-28" />
      </div>

      {/* Title area */}
      <div className="mb-6">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-4 w-24 font-mono" />
          <div className="skeleton h-5 w-14 rounded-pill" />
        </div>
      </div>

      {/* Sub-nav skeleton */}
      <div className="flex gap-1 border-b border-border mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-2.5">
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="mt-8">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="card py-8 text-center">
          <div className="skeleton h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
