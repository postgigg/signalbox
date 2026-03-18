'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';

interface FlowOption {
  id: string;
  label: string;
  icon: string;
  scoreWeight: number;
}

interface FlowStep {
  id: string;
  order: number;
  question: string;
  description: string;
  type: 'single_select';
  options: FlowOption[];
}

const DEFAULT_STEP: FlowStep = {
  id: 'step_1',
  order: 1,
  question: 'What can we help you with?',
  description: '',
  type: 'single_select',
  options: [
    { id: 'opt_1', label: 'Option A', icon: '', scoreWeight: 10 },
    { id: 'opt_2', label: 'Option B', icon: '', scoreWeight: 5 },
  ],
};

const MAX_STEPS = 5;
const MAX_OPTIONS = 6;

export default function FlowBuilderPage(): React.ReactElement {
  const params = useParams();
  const widgetId = typeof params.id === 'string' ? params.id : '';

  const [steps, setSteps] = useState<FlowStep[]>([{ ...DEFAULT_STEP }]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeStep = steps[activeStepIndex];

  const updateStep = useCallback(
    (index: number, updates: Partial<FlowStep>): void => {
      setSteps((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const updateOption = useCallback(
    (stepIndex: number, optionIndex: number, updates: Partial<FlowOption>): void => {
      setSteps((prev) =>
        prev.map((s, si) =>
          si === stepIndex
            ? {
                ...s,
                options: s.options.map((o, oi) =>
                  oi === optionIndex ? { ...o, ...updates } : o
                ),
              }
            : s
        )
      );
    },
    []
  );

  function addStep(): void {
    if (steps.length >= MAX_STEPS) return;
    const newOrder = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        id: `step_${String(newOrder)}`,
        order: newOrder,
        question: '',
        description: '',
        type: 'single_select',
        options: [
          { id: 'opt_1', label: '', icon: '', scoreWeight: 0 },
          { id: 'opt_2', label: '', icon: '', scoreWeight: 0 },
        ],
      },
    ]);
    setActiveStepIndex(steps.length);
  }

  function removeStep(index: number): void {
    if (steps.length <= 2) return;
    setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1, id: `step_${String(i + 1)}` })));
    setActiveStepIndex(Math.max(0, activeStepIndex - (index <= activeStepIndex ? 1 : 0)));
  }

  function addOption(stepIndex: number): void {
    const step = steps[stepIndex];
    if (!step || step.options.length >= MAX_OPTIONS) return;
    const newId = `opt_${String(step.options.length + 1)}`;
    updateStep(stepIndex, {
      options: [...step.options, { id: newId, label: '', icon: '', scoreWeight: 0 }],
    });
  }

  function removeOption(stepIndex: number, optionIndex: number): void {
    const step = steps[stepIndex];
    if (!step || step.options.length <= 2) return;
    updateStep(stepIndex, {
      options: step.options.filter((_, i) => i !== optionIndex),
    });
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setSaved(false);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error } = await supabase
        .from('flows')
        .upsert(
          {
            widget_id: widgetId,
            steps: steps as unknown as Record<string, unknown>[],
            is_active: true,
          },
          { onConflict: 'widget_id' }
        );

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Save failed
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Widgets
        </Link>
        <span className="text-stone-light">/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Widget
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">Flow Builder</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Flow Builder</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-success font-body">Saved</span>}
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Flow'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Editor (Left Panel) */}
        <div className="space-y-4">
          {/* Step Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(index)}
                className={`px-3 py-1.5 rounded-sm text-sm font-body transition-colors duration-fast ${
                  index === activeStepIndex
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-border text-stone hover:text-ink'
                }`}
              >
                Step {step.order}
              </button>
            ))}
            {steps.length < MAX_STEPS && (
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-1.5 rounded-sm text-sm font-body text-signal hover:text-signal-hover border border-dashed border-signal/30 hover:border-signal transition-colors duration-fast"
              >
                + Add Step
              </button>
            )}
          </div>

          {/* Active Step Editor */}
          {activeStep && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-body text-sm font-semibold text-ink">
                  Step {activeStep.order}
                </h3>
                {steps.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeStep(activeStepIndex)}
                    className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                  >
                    Remove Step
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="stepQuestion" className="input-label">Question</label>
                <input
                  id="stepQuestion"
                  type="text"
                  value={activeStep.question}
                  onChange={(e) => updateStep(activeStepIndex, { question: e.target.value })}
                  placeholder="e.g. What can we help you with?"
                  maxLength={120}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="stepDescription" className="input-label">Description (optional)</label>
                <input
                  id="stepDescription"
                  type="text"
                  value={activeStep.description}
                  onChange={(e) => updateStep(activeStepIndex, { description: e.target.value })}
                  placeholder="Brief context for this question"
                  maxLength={200}
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="input-label mb-0">Options</span>
                  {activeStep.options.length < MAX_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => addOption(activeStepIndex)}
                      className="text-xs text-signal hover:text-signal-hover transition-colors duration-fast"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {activeStep.options.map((option, optIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          updateOption(activeStepIndex, optIndex, { label: e.target.value })
                        }
                        placeholder={`Option ${optIndex + 1}`}
                        maxLength={60}
                        className="input-field h-10 flex-1"
                      />
                      <input
                        type="number"
                        value={option.scoreWeight}
                        onChange={(e) =>
                          updateOption(activeStepIndex, optIndex, {
                            scoreWeight: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        min={-50}
                        max={50}
                        className="input-field h-10 w-20 text-center font-mono text-sm"
                        title="Score weight"
                      />
                      {activeStep.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(activeStepIndex, optIndex)}
                          className="p-1.5 text-stone hover:text-danger transition-colors duration-fast"
                          aria-label="Remove option"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Step Note */}
          <div className="card bg-surface-alt">
            <p className="text-xs text-stone">
              The contact info step (name, email, phone, message) is automatically appended after your qualifying steps. It is not editable in the flow builder.
            </p>
          </div>
        </div>

        {/* Live Preview (Right Panel) */}
        <div>
          <div className="sticky top-6">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Live Preview</h3>
            <div className="border border-border rounded-lg bg-white p-6 min-h-[400px]">
              {activeStep ? (
                <div>
                  <div className="h-1 bg-surface-alt rounded-sm mb-6">
                    <div
                      className="h-full bg-signal rounded-sm transition-all duration-normal"
                      style={{
                        width: `${String(((activeStepIndex + 1) / (steps.length + 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-stone mb-4">
                    Step {activeStep.order} of {steps.length}
                  </p>
                  <h4 className="text-lg font-semibold text-ink">
                    {activeStep.question || 'Your question here'}
                  </h4>
                  {activeStep.description && (
                    <p className="mt-1 text-sm text-stone">{activeStep.description}</p>
                  )}
                  <div className="mt-4 space-y-2">
                    {activeStep.options.map((option) => (
                      <div
                        key={option.id}
                        className="w-full p-3 border border-border rounded-md text-left text-sm text-ink hover:border-signal hover:bg-signal-light/30 transition-colors duration-fast cursor-pointer"
                      >
                        {option.label || 'Option label'}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone text-center">Select a step to preview.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
