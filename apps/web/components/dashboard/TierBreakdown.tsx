interface TierBreakdownProps {
  readonly hot: number;
  readonly warm: number;
  readonly cold: number;
  readonly total: number;
  readonly prevHot: number;
  readonly prevWarm: number;
  readonly prevCold: number;
}

export function TierBreakdown({ hot, warm, cold, total, prevHot, prevWarm, prevCold }: TierBreakdownProps): React.ReactElement {
  const tierBarTotal = Math.max(hot + warm + cold, 1);
  const hotPct = (hot / tierBarTotal) * 100;
  const warmPct = (warm / tierBarTotal) * 100;

  return (
    <div>
      {/* Stacked bar */}
      {total > 0 && (
        <div className="h-8 flex rounded-sm overflow-hidden mb-4">
          <div className="bg-danger transition-all duration-normal" style={{ width: `${String(hotPct)}%` }} title={`Hot: ${String(hot)}`} />
          <div className="bg-warning transition-all duration-normal" style={{ width: `${String(warmPct)}%` }} title={`Warm: ${String(warm)}`} />
          <div className="bg-stone-light/40 transition-all duration-normal flex-1" title={`Cold: ${String(cold)}`} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <TierCard label="Hot" value={hot} total={total} previous={prevHot} color="danger" />
        <TierCard label="Warm" value={warm} total={total} previous={prevWarm} color="warning" />
        <TierCard label="Cold" value={cold} total={total} previous={prevCold} color="stone" />
      </div>
    </div>
  );
}

interface TierCardProps {
  readonly label: string;
  readonly value: number;
  readonly total: number;
  readonly previous: number;
  readonly color: string;
}

function TierCard({ label, value, total, previous, color }: TierCardProps): React.ReactElement {
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
  const change = previous > 0 ? ((value - previous) / previous) * 100 : 0;
  const hasChange = previous > 0 || value > 0;

  return (
    <div className="card text-center">
      <p className="text-xs text-stone uppercase tracking-wide">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold text-${color}`}>{value}</p>
      <p className="text-xs text-stone">{pct}% of total</p>
      {hasChange && (
        <p className={`text-[10px] font-mono tabular-nums mt-0.5 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(0)}% vs prev.
        </p>
      )}
    </div>
  );
}
