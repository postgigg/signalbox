export default function SettingsLoading(): React.ReactElement {
  return (
    <div>
      <div className="loading-bar mb-6" />

      <div className="skeleton h-8 w-24 mb-4" />

      {/* Settings nav tabs skeleton */}
      <div className="flex gap-1 border-b border-border mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-2.5">
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Form fields skeleton */}
      <div className="space-y-6 max-w-prose">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton h-4 w-28 mb-1.5" />
            <div className="skeleton h-12 w-full rounded-sm" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="skeleton h-4 w-32 mb-1.5" />
            <div className="skeleton h-12 w-full rounded-sm" />
          </div>
          <div>
            <div className="skeleton h-4 w-36 mb-1.5" />
            <div className="skeleton h-12 w-full rounded-sm" />
          </div>
        </div>
        <div className="skeleton h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
