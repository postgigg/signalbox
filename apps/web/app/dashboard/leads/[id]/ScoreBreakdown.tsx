'use client';

interface ScoreBar {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly bgColor: string;
}

interface ScoreHistoryEntry {
  readonly id: string;
  readonly previous_score: number;
  readonly new_score: number;
  readonly previous_tier: string;
  readonly new_tier: string;
  readonly change_reason: string;
  readonly created_at: string;
}

interface BehavioralInsights {
  readonly pagesViewed: number;
  readonly timeOnSiteSeconds: number;
  readonly sessionNumber: number;
  readonly maxScrollDepth: number;
}

interface ScoreBreakdownProps {
  readonly formScore: number;
  readonly engagementScore: number;
  readonly decayPenalty: number;
  readonly behavioralInsights: BehavioralInsights | null;
  readonly scoreHistory: ScoreHistoryEntry[];
}

function ScoreBar({ label, value, color, bgColor }: ScoreBar): React.ReactElement {
  const percentage = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm font-mono text-stone">{value}/100</span>
      </div>
      <div className={`h-3 w-full rounded-md ${bgColor}`}>
        <div
          className={`h-3 rounded-md transition-all duration-200 ${color}`}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${String(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${String(minutes)}m ${String(remaining)}s` : `${String(minutes)}m`;
}

export function ScoreBreakdown({
  formScore,
  engagementScore,
  decayPenalty,
  behavioralInsights,
  scoreHistory,
}: ScoreBreakdownProps): React.ReactElement {

  return (
    <div className="space-y-6">
      {/* Score Bars */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Score Breakdown
        </h2>
        <div className="space-y-4">
          <ScoreBar label="Form Answers" value={formScore} color="bg-blue-500" bgColor="bg-blue-100" />
          <ScoreBar label="Engagement" value={engagementScore} color="bg-green-500" bgColor="bg-green-100" />
          {engagementScore === 0 && (
            <p className="text-xs text-stone mt-2">
              Score based on form answers only. On-site engagement data was not available for this visitor.
            </p>
          )}
        </div>

        {decayPenalty > 0 && (
          <div className="mt-4 flex items-center gap-2 py-2 px-3 bg-red-50 border border-red-200 rounded-md">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-sm text-red-700">
              Decay penalty: -{decayPenalty} points (inactivity)
            </span>
          </div>
        )}
      </div>

      {/* Behavioral Insights */}
      {behavioralInsights !== null && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Behavioral Insights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold font-mono text-ink">{behavioralInsights.pagesViewed}</p>
              <p className="text-xs text-stone mt-1">Pages Viewed</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold font-mono text-ink">
                {formatDuration(behavioralInsights.timeOnSiteSeconds)}
              </p>
              <p className="text-xs text-stone mt-1">Time on Site</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold font-mono text-ink">{behavioralInsights.sessionNumber}</p>
              <p className="text-xs text-stone mt-1">Visit Number</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold font-mono text-ink">{behavioralInsights.maxScrollDepth}%</p>
              <p className="text-xs text-stone mt-1">Scroll Depth</p>
            </div>
          </div>
        </div>
      )}

      {/* Score History */}
      {scoreHistory.length > 0 && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Score History
          </h2>
          <div className="space-y-3">
            {scoreHistory.map((entry) => {
              const delta = entry.new_score - entry.previous_score;
              const isPositive = delta > 0;
              return (
                <div key={entry.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-ink">{entry.change_reason}</p>
                    <p className="text-xs text-stone mt-0.5">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                    {entry.previous_tier !== entry.new_tier && (
                      <p className="text-xs text-stone mt-0.5">
                        Tier: {entry.previous_tier} → {entry.new_tier}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-mono text-stone">
                      {entry.previous_score} → {entry.new_score}
                    </span>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded-sm ${
                      isPositive
                        ? 'bg-success-light text-success'
                        : 'bg-danger-light text-danger'
                    }`}>
                      {isPositive ? '+' : ''}{delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
