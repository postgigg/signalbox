'use client';

interface FunnelStep {
  readonly label: string;
  readonly value: number;
  readonly previousValue: number;
}

interface ConversionFunnelProps {
  readonly steps: readonly FunnelStep[];
  readonly avgScore: number | null;
  readonly compact?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 10000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return n.toLocaleString();
}

function pctChange(current: number, previous: number): { text: string; positive: boolean } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { text: '+100%', positive: true };
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return { text: `${sign}${change.toFixed(1)}%`, positive: change >= 0 };
}

function stepConversion(from: number, to: number): string {
  if (from === 0) return '0%';
  return `${((to / from) * 100).toFixed(1)}%`;
}

function findBiggestDropoff(steps: readonly FunnelStep[]): string {
  let maxDrop = 0;
  let dropLabel = '-';
  for (let i = 0; i < steps.length - 1; i++) {
    const from = steps[i];
    const to = steps[i + 1];
    if (from === undefined || to === undefined) continue;
    const dropRate = from.value > 0 ? ((from.value - to.value) / from.value) * 100 : 0;
    if (dropRate > maxDrop) {
      maxDrop = dropRate;
      dropLabel = `${from.label} → ${to.label}`;
    }
  }
  return maxDrop > 0 ? `${dropLabel} (${maxDrop.toFixed(0)}%)` : '-';
}

export function ConversionFunnel({ steps, avgScore, compact }: ConversionFunnelProps): React.ReactElement {
  const topStep = steps[0];
  const bottomStep = steps[steps.length - 1];
  const topValue = topStep?.value ?? 0;
  const bottomValue = bottomStep?.value ?? 0;
  const prevTopValue = topStep?.previousValue ?? 0;
  const prevBottomValue = bottomStep?.previousValue ?? 0;
  const overallRate = topValue > 0 ? ((bottomValue / topValue) * 100).toFixed(1) : '0';
  const prevOverallRate = prevTopValue > 0 ? ((prevBottomValue / prevTopValue) * 100).toFixed(1) : '0';
  const overallChange = pctChange(parseFloat(overallRate), parseFloat(prevOverallRate));

  if (compact === true) {
    return <CompactFunnel steps={steps} />;
  }

  return (
    <div>
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryMetric
          label="Total Impressions"
          value={formatNumber(topValue)}
          change={pctChange(topValue, prevTopValue)}
        />
        <SummaryMetric
          label="Overall Conversion"
          value={`${overallRate}%`}
          change={overallChange}
        />
        <SummaryMetric
          label="Avg Lead Score"
          value={avgScore !== null ? String(Math.round(avgScore)) : '-'}
          change={null}
        />
        <SummaryMetric
          label="Biggest Drop-off"
          value={findBiggestDropoff(steps)}
          change={null}
          small
        />
      </div>

      {/* Detailed funnel */}
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-surface-alt border-b border-border text-xs font-medium uppercase tracking-wide text-stone">
          <div className="col-span-2">Stage</div>
          <div className="col-span-4">Funnel</div>
          <div className="col-span-1 text-right">Count</div>
          <div className="col-span-1 text-right">% Total</div>
          <div className="col-span-2 text-right">Step Conv.</div>
          <div className="col-span-2 text-right">vs Prev.</div>
        </div>

        {steps.map((step, i) => {
          const pctOfTotal = topValue > 0 ? (step.value / topValue) * 100 : 0;
          const prevStep = i > 0 ? steps[i - 1] : undefined;
          const stepConvRate = prevStep !== undefined
            ? stepConversion(prevStep.value, step.value)
            : '-';
          const change = pctChange(step.value, step.previousValue);
          const dropoff = prevStep !== undefined && prevStep.value > 0
            ? prevStep.value - step.value
            : null;

          return (
            <div key={step.label}>
              {/* Drop-off indicator between steps */}
              {dropoff !== null && dropoff > 0 && (
                <div className="flex items-center px-5 py-1.5 bg-surface">
                  <div className="col-span-2 w-[calc(16.667%)]" />
                  <div className="flex items-center gap-2 text-xs text-stone-light">
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-danger/60">
                      <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-danger/80 font-mono">
                      -{formatNumber(dropoff)}
                    </span>
                    <span>dropped</span>
                  </div>
                </div>
              )}

              {/* Step row */}
              <div className="grid grid-cols-12 gap-2 items-center px-5 py-3 border-b border-border last:border-0 transition-colors duration-fast hover:bg-surface-alt">
                <div className="col-span-2">
                  <span className="text-sm font-medium text-ink">{step.label}</span>
                </div>
                <div className="col-span-4">
                  <div className="h-7 bg-surface-alt rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-normal"
                      style={{
                        width: `${String(Math.max(pctOfTotal, 1))}%`,
                        backgroundColor: funnelColor(i),
                      }}
                    />
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-sm font-mono text-ink tabular-nums">
                    {formatNumber(step.value)}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-sm font-mono text-stone tabular-nums">
                    {pctOfTotal.toFixed(1)}%
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-mono text-ink tabular-nums">
                    {stepConvRate}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  {change !== null ? (
                    <span className={`text-xs font-mono tabular-nums ${change.positive ? 'text-success' : 'text-danger'}`}>
                      {change.text}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-light">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function funnelColor(index: number): string {
  const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
  const colorIndex = Math.min(index, colors.length - 1);
  return colors[colorIndex] ?? '#2563EB';
}

interface SummaryMetricProps {
  readonly label: string;
  readonly value: string;
  readonly change: { text: string; positive: boolean } | null;
  readonly small?: boolean;
}

function SummaryMetric({ label, value, change, small }: SummaryMetricProps): React.ReactElement {
  return (
    <div className="bg-surface border border-border rounded-md p-3">
      <p className="text-xs text-stone font-body">{label}</p>
      <p className={`mt-0.5 font-mono font-semibold text-ink ${small === true ? 'text-xs leading-5' : 'text-lg'}`}>
        {value}
      </p>
      {change !== null && (
        <p className={`text-xs font-mono tabular-nums ${change.positive ? 'text-success' : 'text-danger'}`}>
          {change.text} vs prev. period
        </p>
      )}
    </div>
  );
}

function CompactFunnel({ steps }: { readonly steps: readonly FunnelStep[] }): React.ReactElement {
  const topValue = steps[0]?.value ?? 0;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const pct = topValue > 0 ? (step.value / topValue) * 100 : 0;
        const prevStep = i > 0 ? steps[i - 1] : undefined;
        const stepConvRate = prevStep !== undefined && prevStep.value > 0
          ? `${((step.value / prevStep.value) * 100).toFixed(0)}%`
          : null;

        return (
          <div key={step.label}>
            {stepConvRate !== null && (
              <div className="flex justify-center py-0.5">
                <span className="text-[10px] font-mono text-stone-light">
                  {stepConvRate} pass-through
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone font-body w-28 text-right flex-shrink-0">
                {step.label}
              </span>
              <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-normal"
                  style={{
                    width: `${String(Math.max(pct, 1))}%`,
                    backgroundColor: funnelColor(i),
                  }}
                />
              </div>
              <span className="text-xs font-mono text-stone w-16 text-right tabular-nums">
                {formatNumber(step.value)} ({pct.toFixed(0)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
