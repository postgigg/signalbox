'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';

interface VariantData {
  readonly impressions: number;
  readonly submissions: number;
  readonly conversionRate: number;
  readonly avgScore: number;
  readonly hotCount: number;
  readonly warmCount: number;
  readonly coldCount: number;
}

interface ResultsData {
  readonly test: {
    readonly id: string;
    readonly name: string;
    readonly status: string;
    readonly trafficSplit: number;
    readonly targetStepId: string;
    readonly variantBQuestion: string;
    readonly startedAt: string | null;
  };
  readonly variantA: VariantData;
  readonly variantB: VariantData;
  readonly significance: {
    readonly zScore: number;
    readonly pValue: number;
    readonly significant: boolean;
    readonly winner: 'a' | 'b' | null;
    readonly enoughData: boolean;
  };
}

export default function AbTestResultsPage({
  params,
}: {
  readonly params: Promise<{ id: string; testId: string }>;
}): React.ReactElement {
  const { id: widgetId, testId } = use(params);
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const response = await fetch(`/api/v1/ab-tests/${testId}/results`);
        if (response.ok) {
          const result = await response.json() as ResultsData;
          setData(result);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [testId]);

  async function declareWinner(variant: 'a' | 'b'): Promise<void> {
    if (!confirm(`Declare Variant ${variant.toUpperCase()} as the winner? This will end the test.`)) return;
    try {
      const response = await fetch(`/api/v1/ab-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: variant }),
      });
      if (response.ok && data) {
        setData({
          ...data,
          test: { ...data.test, status: 'completed' },
          significance: { ...data.significance, winner: variant },
        });
      }
    } catch {
      // Failed to declare winner
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6"><div className="skeleton h-32" /></div>
          <div className="card p-6"><div className="skeleton h-32" /></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-stone">Test not found or no results available.</p>
      </div>
    );
  }

  const { test, variantA, variantB, significance } = data;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-stone font-body mb-4">
        <Link href="/dashboard/widgets" className="hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span>/</span>
        <Link href={`/dashboard/widgets/${widgetId}/ab-tests`} className="hover:text-ink transition-colors duration-fast">A/B Tests</Link>
        <span>/</span>
        <span className="text-ink">Results</span>
      </div>

      <h1 className="page-heading">{test.name}</h1>
      <div className="mt-1 flex items-center gap-3 text-sm text-stone">
        <span>Step: {test.targetStepId}</span>
        <span>Split: {test.trafficSplit}% / {100 - test.trafficSplit}%</span>
        {test.startedAt !== null && (
          <span>Started: {new Date(test.startedAt).toLocaleDateString()}</span>
        )}
      </div>

      {/* Significance Banner */}
      <div className={`mt-6 card p-4 ${
        significance.significant
          ? 'border-success bg-success-light'
          : 'border-border'
      }`}>
        {!significance.enoughData ? (
          <p className="text-sm text-stone">
            Not enough data yet. Need at least 100 impressions per variant for statistical significance.
          </p>
        ) : significance.significant ? (
          <p className="text-sm text-success font-medium">
            Statistically significant result (p={significance.pValue}).
            Variant {significance.winner?.toUpperCase()} is the winner.
          </p>
        ) : (
          <p className="text-sm text-stone">
            No significant difference detected yet (p={significance.pValue}). Keep collecting data.
          </p>
        )}
      </div>

      {/* Side-by-Side Comparison */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variant A */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Variant A (Control)</h2>
            {test.status === 'running' && (
              <button
                type="button"
                onClick={() => void declareWinner('a')}
                className="btn-secondary text-xs px-3 py-1"
              >
                Declare Winner
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Impressions</span>
              <span className="font-medium text-ink">{variantA.impressions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Submissions</span>
              <span className="font-medium text-ink">{variantA.submissions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Conversion Rate</span>
              <span className="font-medium text-ink">{(variantA.conversionRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Avg Score</span>
              <span className="font-medium text-ink">{variantA.avgScore.toFixed(1)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-xs">
              <span style={{ color: '#EF4444' }}>Hot: {variantA.hotCount}</span>
              <span style={{ color: '#F59E0B' }}>Warm: {variantA.warmCount}</span>
              <span style={{ color: '#3B82F6' }}>Cold: {variantA.coldCount}</span>
            </div>
          </div>
        </div>

        {/* Variant B */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Variant B</h2>
            {test.status === 'running' && (
              <button
                type="button"
                onClick={() => void declareWinner('b')}
                className="btn-secondary text-xs px-3 py-1"
              >
                Declare Winner
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-stone italic">Q: {test.variantBQuestion}</p>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Impressions</span>
              <span className="font-medium text-ink">{variantB.impressions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Submissions</span>
              <span className="font-medium text-ink">{variantB.submissions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Conversion Rate</span>
              <span className="font-medium text-ink">{(variantB.conversionRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Avg Score</span>
              <span className="font-medium text-ink">{variantB.avgScore.toFixed(1)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-xs">
              <span style={{ color: '#EF4444' }}>Hot: {variantB.hotCount}</span>
              <span style={{ color: '#F59E0B' }}>Warm: {variantB.warmCount}</span>
              <span style={{ color: '#3B82F6' }}>Cold: {variantB.coldCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
