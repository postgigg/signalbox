export default function ClientDetailLoading(): React.ReactElement {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-4 w-16" />
        <span className="text-stone-light">/</span>
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="skeleton h-5 w-20 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="skeleton h-5 w-24 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
