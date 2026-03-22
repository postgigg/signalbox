import Link from 'next/link';

interface StepDropoffEntry {
  step: number;
  views: number;
}

interface SourceEntry {
  source: string;
  count: number;
}

interface DeviceEntry {
  device: string;
  count: number;
}

interface CountryEntry {
  country: string;
  count: number;
}

interface AdvancedSectionData {
  sourceBreakdown: SourceEntry[];
  deviceBreakdown: DeviceEntry[];
  countryBreakdown: CountryEntry[];
  stepDropoff: StepDropoffEntry[];
}

interface AdvancedSectionProps {
  readonly hasAccess: boolean;
  readonly loading: boolean;
  readonly data: AdvancedSectionData | null;
}

export function AdvancedSection({ hasAccess, loading, data }: AdvancedSectionProps): React.ReactElement {
  if (!hasAccess) {
    return (
      <div className="card text-center py-8">
        <p className="text-sm text-stone mb-1">Source breakdown, device analytics, country data, and step drop-off analysis.</p>
        <p className="text-sm text-stone mb-4">Available on Pro and Agency plans.</p>
        <Link href="/dashboard/settings/billing" className="btn-primary text-sm">
          Upgrade Plan
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-5 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="flex justify-between">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data === null) return <></>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Step Drop-off */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Step Drop-off</h3>
        {data.stepDropoff.every((s) => s.views === 0) ? (
          <p className="text-sm text-stone">No step data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.stepDropoff.map((s, i) => {
              const maxViews = Math.max(...data.stepDropoff.map((x) => x.views), 1);
              const pct = (s.views / maxViews) * 100;
              const prevStep = i > 0 ? data.stepDropoff[i - 1] : undefined;
              const dropPct = prevStep !== undefined && prevStep.views > 0
                ? ((prevStep.views - s.views) / prevStep.views * 100).toFixed(0)
                : null;
              return (
                <div key={s.step}>
                  {dropPct !== null && Number(dropPct) > 0 && (
                    <p className="text-[10px] text-danger/70 font-mono text-center mb-0.5">
                      -{dropPct}% drop
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone font-body w-12 flex-shrink-0">Step {s.step}</span>
                    <div className="flex-1 h-5 bg-surface-alt rounded-sm overflow-hidden">
                      <div className="h-full bg-signal rounded-sm" style={{ width: `${String(pct)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-stone w-10 text-right">{s.views}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Traffic Sources */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Traffic Sources</h3>
        {data.sourceBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No source data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.sourceBreakdown.slice(0, 8).map((s) => {
              const maxCount = Math.max(...data.sourceBreakdown.map((x) => x.count), 1);
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.source} className="flex items-center gap-3 text-sm">
                  <span className="text-ink truncate w-24 flex-shrink-0">{s.source}</span>
                  <div className="flex-1 h-4 bg-surface-alt rounded-sm overflow-hidden">
                    <div className="h-full bg-signal/50 rounded-sm" style={{ width: `${String(pct)}%` }} />
                  </div>
                  <span className="font-mono text-stone flex-shrink-0 w-8 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Devices */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Devices</h3>
        {data.deviceBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No device data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.deviceBreakdown.map((d) => {
              const total = data.deviceBreakdown.reduce((sum, x) => sum + x.count, 0);
              const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={d.device} className="flex items-center justify-between text-sm">
                  <span className="text-ink capitalize">{d.device}</span>
                  <span className="font-mono text-stone">{d.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Countries */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Top Countries</h3>
        {data.countryBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No country data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.countryBreakdown.map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-ink">{c.country}</span>
                <span className="font-mono text-stone">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
