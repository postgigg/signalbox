interface StepFunnelStep {
  readonly label: string;
  readonly views: number;
  readonly abandons: number;
}

interface StepFunnelProps {
  readonly steps: readonly StepFunnelStep[];
}

export function StepFunnel({ steps }: StepFunnelProps): React.ReactElement {
  const maxViews = steps.reduce((max, s) => Math.max(max, s.views), 0);

  if (maxViews === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-sm text-stone">No step data available yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="space-y-4">
        {steps.map((step, i) => {
          const widthPct = maxViews > 0 ? (step.views / maxViews) * 100 : 0;
          const dropoffPct = i > 0 && steps[i - 1] !== undefined && (steps[i - 1] as StepFunnelStep).views > 0
            ? (((steps[i - 1] as StepFunnelStep).views - step.views) / (steps[i - 1] as StepFunnelStep).views) * 100
            : 0;

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-ink">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono tabular-nums text-ink">{step.views.toLocaleString()}</span>
                  {i > 0 && dropoffPct > 0 && (
                    <span className="text-xs text-danger font-mono">
                      -{dropoffPct.toFixed(1)}%
                    </span>
                  )}
                  {step.abandons > 0 && (
                    <span className="text-xs text-stone" title="Abandonments at this step">
                      {step.abandons} left
                    </span>
                  )}
                </div>
              </div>
              <div className="h-6 bg-surface-alt rounded-sm overflow-hidden">
                <div
                  className="h-full bg-signal rounded-sm transition-all duration-200"
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
