export default function ClientsLoading(): React.ReactElement {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-10 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="skeleton h-5 w-40 mb-2" />
                <div className="skeleton h-3 w-60" />
              </div>
              <div className="skeleton h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
