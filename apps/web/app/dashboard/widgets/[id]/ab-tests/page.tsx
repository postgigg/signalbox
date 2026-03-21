'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';

import type { FormEvent } from 'react';

interface AbTest {
  readonly id: string;
  readonly name: string;
  readonly status: 'draft' | 'running' | 'paused' | 'completed';
  readonly target_step_id: string;
  readonly traffic_split: number;
  readonly variant_b_question: string;
  readonly winner: 'a' | 'b' | null;
  readonly started_at: string | null;
  readonly completed_at: string | null;
  readonly created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-surface-alt text-stone',
  running: 'bg-success-light text-success',
  paused: 'bg-warning-light text-warning',
  completed: 'bg-signal-light text-signal',
};

export default function WidgetAbTestsPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  const { id: widgetId } = resolvedParams;
  const [tests, setTests] = useState<AbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formStepId, setFormStepId] = useState('');
  const [formSplit, setFormSplit] = useState(50);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const response = await fetch(`/api/v1/ab-tests?widgetId=${widgetId}`);
        if (response.ok) {
          const result = await response.json() as { data: AbTest[] };
          setTests(result.data);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [widgetId]);

  async function handleCreate(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      // Parse options as simple label list (one per line)
      const optionLines = formOptions.split('\n').filter((l) => l.trim().length > 0);
      const variantBOptions = optionLines.map((label, idx) => ({
        id: `vb_opt_${String(idx + 1)}`,
        label: label.trim(),
        scoreWeight: Math.round(100 / optionLines.length),
      }));

      const response = await fetch('/api/v1/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId,
          name: formName,
          targetStepId: formStepId,
          trafficSplit: formSplit,
          variantBQuestion: formQuestion,
          variantBOptions,
        }),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      const result = await response.json() as { data: AbTest };
      setTests((prev) => [result.data, ...prev]);
      setShowForm(false);
      setFormName('');
      setFormStepId('');
      setFormQuestion('');
      setFormOptions('');
    } catch {
      setError('Failed to create test.');
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(testId: string, newStatus: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/ab-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const result = await response.json() as { data: AbTest };
        setTests((prev) => prev.map((t) => t.id === testId ? result.data : t));
      }
    } catch {
      // Status change failed
    }
  }

  async function handleDelete(testId: string): Promise<void> {
    if (!confirm('Delete this A/B test and all its results?')) return;
    try {
      const response = await fetch(`/api/v1/ab-tests/${testId}`, { method: 'DELETE' });
      if (response.ok) {
        setTests((prev) => prev.filter((t) => t.id !== testId));
      }
    } catch {
      // Delete failed
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-stone font-body mb-4">
        <Link href="/dashboard/widgets" className="hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span>/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="hover:text-ink transition-colors duration-fast">Widget</Link>
        <span>/</span>
        <span className="text-ink">A/B Tests</span>
      </div>

      <h1 className="page-heading">A/B Tests</h1>
      <p className="mt-1 text-sm text-stone font-body">
        Split test different flow questions and options to optimize conversion.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : 'New Test'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 card p-5 space-y-4">
          <div>
            <label htmlFor="test-name" className="block text-sm font-medium text-ink mb-1">Test Name</label>
            <input
              id="test-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="input-field w-full"
              placeholder="e.g. Budget question wording test"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="step-id" className="block text-sm font-medium text-ink mb-1">Target Step ID</label>
              <input
                id="step-id"
                type="text"
                value={formStepId}
                onChange={(e) => setFormStepId(e.target.value)}
                required
                className="input-field w-full"
                placeholder="e.g. step-2"
              />
            </div>
            <div>
              <label htmlFor="split" className="block text-sm font-medium text-ink mb-1">Traffic Split (% to variant A)</label>
              <input
                id="split"
                type="number"
                min={1}
                max={99}
                value={formSplit}
                onChange={(e) => setFormSplit(Number(e.target.value))}
                className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label htmlFor="vb-question" className="block text-sm font-medium text-ink mb-1">Variant B Question</label>
            <input
              id="vb-question"
              type="text"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Alternative question wording"
            />
          </div>
          <div>
            <label htmlFor="vb-options" className="block text-sm font-medium text-ink mb-1">Variant B Options (one per line)</label>
            <textarea
              id="vb-options"
              value={formOptions}
              onChange={(e) => setFormOptions(e.target.value)}
              required
              className="input-field w-full h-24 resize-none"
              placeholder={"Option 1\nOption 2\nOption 3"}
            />
          </div>
          <button type="submit" disabled={creating} className="btn-primary text-sm">
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating...
              </span>
            ) : 'Create Test'}
          </button>
        </form>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-48" />
                <div className="mt-2 skeleton h-3 w-32" />
              </div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No A/B tests yet. Create one to start optimizing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{test.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${STATUS_COLORS[test.status] ?? ''}`}>
                        {test.status}
                      </span>
                      {test.winner !== null && (
                        <span className="text-xs px-2 py-0.5 rounded-pill bg-signal-light text-signal font-medium">
                          Winner: Variant {test.winner.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-stone">
                      Step: {test.target_step_id} | Split: {test.traffic_split}% / {100 - test.traffic_split}%
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/dashboard/widgets/${widgetId}/ab-tests/${test.id}`}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Results
                    </Link>
                    {test.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => void handleStatusChange(test.id, 'running')}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Start
                      </button>
                    )}
                    {test.status === 'running' && (
                      <button
                        type="button"
                        onClick={() => void handleStatusChange(test.id, 'paused')}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Pause
                      </button>
                    )}
                    {test.status === 'paused' && (
                      <button
                        type="button"
                        onClick={() => void handleStatusChange(test.id, 'running')}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(test.id)}
                      className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast px-2 py-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
