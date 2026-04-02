'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChecklistItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly done: boolean;
}

interface OnboardingChecklistProps {
  readonly widgetCount: number;
  readonly hasFlow: boolean;
  readonly submissionCount: number;
}

const DISMISSED_KEY = 'hawkleads_checklist_dismissed';

export function OnboardingChecklist({
  widgetCount,
  hasFlow,
  submissionCount,
}: OnboardingChecklistProps): React.ReactElement | null {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    setDismissed(stored === 'true');
  }, []);

  if (dismissed) return null;

  const items: ChecklistItem[] = [
    {
      key: 'create-widget',
      label: 'Create your first widget',
      href: '/dashboard/widgets/new',
      done: widgetCount > 0,
    },
    {
      key: 'add-questions',
      label: 'Add qualifying questions',
      href: '/dashboard/widgets',
      done: hasFlow,
    },
    {
      key: 'install',
      label: 'Install widget on your site',
      href: '/dashboard/widgets',
      done: widgetCount > 0,
    },
    {
      key: 'first-lead',
      label: 'Get your first lead',
      href: '/dashboard/leads',
      done: submissionCount > 0,
    },
  ];

  const completedCount = items.filter((item) => item.done).length;
  const allDone = completedCount === items.length;

  function handleDismiss(): void {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {allDone ? 'All set.' : 'Getting Started'}
          </h2>
          <p className="text-sm text-stone mt-1">
            {allDone
              ? 'You have completed all the setup steps.'
              : `${completedCount} of ${items.length} steps complete`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-stone hover:text-ink transition-colors duration-fast"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-alt rounded-pill overflow-hidden mb-4">
        <div
          className="h-full bg-signal rounded-pill transition-all duration-200"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 py-2 px-3 rounded-sm border border-border hover:bg-surface-alt transition-colors duration-fast"
          >
            <div
              className={`w-5 h-5 rounded-pill border flex items-center justify-center shrink-0 ${
                item.done
                  ? 'bg-success border-success'
                  : 'border-border'
              }`}
            >
              {item.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                item.done ? 'text-stone line-through' : 'text-ink font-medium'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
