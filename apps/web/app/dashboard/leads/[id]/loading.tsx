export default function LeadDetailLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-4 w-2" />
        <div className="skeleton h-4 w-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="skeleton h-7 w-44 mb-2" />
                <div className="skeleton h-4 w-52 mb-1" />
                <div className="skeleton h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <div className="skeleton h-8 w-12" />
                <div className="skeleton h-5 w-12 rounded-pill" />
              </div>
            </div>
          </div>

          {/* Answers card */}
          <div className="card">
            <div className="skeleton h-6 w-40 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-border last:border-0">
                <div>
                  <div className="skeleton h-3 w-36 mb-1" />
                  <div className="skeleton h-4 w-28" />
                </div>
                <div className="skeleton h-5 w-8 rounded-sm" />
              </div>
            ))}
          </div>

          {/* Opener card */}
          <div className="card">
            <div className="skeleton h-6 w-36 mb-3" />
            <div className="bg-surface-alt rounded-sm p-4">
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="skeleton h-3 w-12 mb-3" />
            <div className="skeleton h-5 w-16 rounded-pill" />
          </div>
          <div className="card">
            <div className="skeleton h-3 w-24 mb-3" />
            <div className="skeleton h-4 w-full" />
          </div>
          <div className="card">
            <div className="skeleton h-3 w-12 mb-3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1.5">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
