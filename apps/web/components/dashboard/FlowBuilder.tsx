'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowOption {
  id: string;
  label: string;
  score: number;
}

export interface FlowStep {
  id: string;
  question: string;
  options: FlowOption[];
}

export interface FlowTemplate {
  label: string;
  value: string;
  steps: FlowStep[];
}

export interface FlowBuilderProps {
  steps: FlowStep[];
  onChange: (steps: FlowStep[]) => void;
  templates: FlowTemplate[];
  onTemplateSelect: (templateValue: string) => void;
  previewComponent?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface StepEditorProps {
  step: FlowStep;
  index: number;
  total: number;
  onUpdate: (step: FlowStep) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function StepEditor({ step, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }: StepEditorProps) {
  const updateQuestion = (question: string) => {
    onUpdate({ ...step, question });
  };

  const addOption = () => {
    onUpdate({
      ...step,
      options: [
        ...step.options,
        { id: uid('opt'), label: '', score: 0 },
      ],
    });
  };

  const updateOption = (optIndex: number, changes: Partial<FlowOption>) => {
    const newOptions = step.options.map((opt, i) =>
      i === optIndex ? { ...opt, ...changes } : opt,
    );
    onUpdate({ ...step, options: newOptions });
  };

  const removeOption = (optIndex: number) => {
    onUpdate({
      ...step,
      options: step.options.filter((_, i) => i !== optIndex),
    });
  };

  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono font-medium text-stone uppercase">
          Step {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded-sm text-stone hover:text-ink disabled:opacity-30 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal"
            aria-label="Move step up"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 12V4m0 0L4 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded-sm text-stone hover:text-ink disabled:opacity-30 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal"
            aria-label="Move step down"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 4v8m0 0l4-4m-4 4L4 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-sm text-danger hover:bg-danger-light transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-danger"
            aria-label="Remove step"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z" />
            </svg>
          </button>
        </div>
      </div>

      <Input
        label="Question"
        name={`step-${step.id}-question`}
        value={step.question}
        onChange={(e) => updateQuestion(e.target.value)}
        placeholder="e.g., What is your budget range?"
      />

      <div className="mt-3 space-y-2">
        <p className="text-xs font-body font-medium text-stone">Options</p>
        {step.options.map((opt, optIndex) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type="text"
              value={opt.label}
              onChange={(e) => updateOption(optIndex, { label: e.target.value })}
              placeholder="Option label"
              className="flex-1 h-9 px-2.5 text-sm font-body border border-border rounded-sm bg-surface focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all duration-fast"
              aria-label={`Option ${optIndex + 1} label`}
            />
            <input
              type="number"
              value={opt.score}
              onChange={(e) => updateOption(optIndex, { score: Number(e.target.value) })}
              className="w-16 h-9 px-2 text-sm font-mono text-center border border-border rounded-sm bg-surface focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all duration-fast"
              aria-label={`Option ${optIndex + 1} score weight`}
            />
            <button
              type="button"
              onClick={() => removeOption(optIndex)}
              className="p-1 rounded-sm text-stone hover:text-danger transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal"
              aria-label={`Remove option ${optIndex + 1}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-xs font-medium text-signal hover:text-signal-hover transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal rounded-sm px-1 py-0.5"
        >
          + Add option
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FlowBuilder                                                        */
/* ------------------------------------------------------------------ */

export function FlowBuilder({
  steps,
  onChange,
  templates,
  onTemplateSelect,
  previewComponent,
}: FlowBuilderProps) {
  const templateOptions: SelectOption[] = [
    { label: 'Start from scratch', value: '' },
    ...templates.map((t) => ({ label: t.label, value: t.value })),
  ];

  const addStep = useCallback(() => {
    const newStep: FlowStep = {
      id: uid('step'),
      question: '',
      options: [],
    };
    onChange([...steps, newStep]);
  }, [steps, onChange]);

  const updateStep = useCallback(
    (index: number, updated: FlowStep) => {
      const newSteps = steps.map((s, i) => (i === index ? updated : s));
      onChange(newSteps);
    },
    [steps, onChange],
  );

  const removeStep = useCallback(
    (index: number) => {
      onChange(steps.filter((_, i) => i !== index));
    },
    [steps, onChange],
  );

  const moveStep = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= steps.length) return;
      const newSteps = [...steps];
      const [moved] = newSteps.splice(from, 1);
      if (moved) {
        newSteps.splice(to, 0, moved);
        onChange(newSteps);
      }
    },
    [steps, onChange],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left panel — step editor */}
      <div className="flex-1 min-w-0">
        {/* Template selector */}
        <div className="mb-4">
          <Select
            label="Template"
            name="flow-template"
            options={templateOptions}
            onChange={(e) => {
              if (e.target.value) onTemplateSelect(e.target.value);
            }}
            placeholder="Choose a template..."
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepEditor
              key={step.id}
              step={step}
              index={index}
              total={steps.length}
              onUpdate={(s) => updateStep(index, s)}
              onRemove={() => removeStep(index)}
              onMoveUp={() => moveStep(index, index - 1)}
              onMoveDown={() => moveStep(index, index + 1)}
            />
          ))}
        </div>

        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={addStep}>
            + Add Step
          </Button>
        </div>
      </div>

      {/* Right panel — preview */}
      <div className="lg:w-[400px] shrink-0">
        <div className="sticky top-4">
          <p className="text-xs font-mono font-medium text-stone uppercase mb-3">
            Live Preview
          </p>
          <div className="border border-border rounded-md p-4 bg-surface-alt min-h-[300px]">
            {previewComponent ?? (
              <p className="text-sm text-stone font-body text-center mt-12">
                Add steps to see a preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
