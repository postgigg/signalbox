interface ChartDataPoint {
  date: string;
  impressions: number;
  opens: number;
  completions: number;
  submissions: number;
  hot_count: number;
  warm_count: number;
  cold_count: number;
  avg_score: number | null;
  step_1_views: number;
  step_2_views: number;
  step_3_views: number;
  step_4_views: number;
  step_5_views: number;
}

interface ConversionRateChartProps {
  readonly data: ChartDataPoint[];
}

export function ConversionRateChart({ data }: ConversionRateChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="card min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-stone">No data for this period.</p>
      </div>
    );
  }

  const rates = data.map((d) => ({
    date: d.date,
    rate: d.opens > 0 ? (d.submissions / d.opens) * 100 : 0,
  }));
  const maxRate = Math.max(...rates.map((r) => r.rate), 1);

  return (
    <div className="card">
      <div className="flex items-end gap-1 h-[160px]">
        {rates.map((r) => {
          const height = (r.rate / maxRate) * 100;
          return (
            <div key={r.date} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-success/70 rounded-t-sm transition-all duration-fast hover:bg-success"
                style={{ height: `${String(Math.max(height, 2))}%` }}
                title={`${r.date}: ${r.rate.toFixed(1)}% conversion`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-stone-light font-mono">
        <span>{rates[0]?.date ?? ''}</span>
        <span>{rates[rates.length - 1]?.date ?? ''}</span>
      </div>
      <p className="text-xs text-stone mt-1 text-center">Opens to submissions conversion rate by day</p>
    </div>
  );
}

interface SubmissionsChartProps {
  readonly data: ChartDataPoint[];
}

export function SubmissionsChart({ data }: SubmissionsChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="card min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-stone">No data for this period.</p>
      </div>
    );
  }

  const maxSubs = Math.max(...data.map((d) => d.submissions), 1);

  return (
    <div className="card">
      <div className="flex items-end gap-1 h-[160px]">
        {data.map((d) => {
          const height = (d.submissions / maxSubs) * 100;
          return (
            <div
              key={d.date}
              className="flex-1 bg-signal rounded-t-sm transition-all duration-fast hover:bg-signal-hover"
              style={{ height: `${String(Math.max(height, 2))}%` }}
              title={`${d.date}: ${String(d.submissions)} submissions`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-stone-light font-mono">
        <span>{data[0]?.date ?? ''}</span>
        <span>{data[data.length - 1]?.date ?? ''}</span>
      </div>
    </div>
  );
}
