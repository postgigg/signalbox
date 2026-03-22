'use client';

import { useState, useCallback } from 'react';

import { Logo } from '@/components/shared/Logo';

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 6;

interface OnboardingStep {
  readonly title: string;
  readonly subtitle: string;
  readonly body: string;
  readonly tips: readonly string[];
  readonly navHint: string;
}

const STEPS: readonly OnboardingStep[] = [
  {
    title: 'Welcome to HawkLeads',
    subtitle: 'Smart lead capture, built for conversion.',
    body: 'HawkLeads helps you qualify visitors before they hit your inbox. Embed a smart widget on your site, score leads automatically, and focus your time on the ones that matter.',
    tips: [
      'Your 14-day trial includes all features.',
      'No credit card required to get started.',
      'Set up your first widget in under 5 minutes.',
    ],
    navHint: '',
  },
  {
    title: 'Widgets',
    subtitle: 'Your smart contact forms.',
    body: 'Widgets are embeddable multi-step forms that guide visitors through qualifying questions before they submit their info. Each widget gets a unique embed code you can drop on any page.',
    tips: [
      'Create widgets from the Widgets page in the sidebar.',
      'Customize colors, fonts, and positioning to match your site.',
      'Each widget tracks its own submissions and analytics.',
    ],
    navHint: 'Widgets',
  },
  {
    title: 'Flow Builder',
    subtitle: 'Design your qualifying questions.',
    body: 'The Flow Builder lets you create multi-step question flows for each widget. Each answer carries a score weight, and the total determines whether a lead is hot, warm, or cold.',
    tips: [
      'Add up to 5 qualifying steps per widget.',
      'Assign score weights (1-10) to each answer option.',
      'Use industry templates to get started fast.',
    ],
    navHint: 'Widgets',
  },
  {
    title: 'Lead Scoring',
    subtitle: 'Automatic hot, warm, and cold categorization.',
    body: 'Every submission is scored based on the answers your visitors give. Leads are automatically categorized into tiers so you know exactly who to call first. Adjust the thresholds in Settings.',
    tips: [
      'Default thresholds: Hot 70+, Warm 40+, Cold below 40.',
      'View and manage all leads from the Leads page.',
      'Filter by tier, status, date range, and more.',
    ],
    navHint: 'Leads',
  },
  {
    title: 'Analytics',
    subtitle: 'Track every step of the funnel.',
    body: 'See how visitors move through your widget, where they drop off, and which questions convert best. The Overview page gives you a quick snapshot, while the full Analytics page digs deeper.',
    tips: [
      'The Overview page shows your key stats at a glance.',
      'Full Analytics includes tier breakdowns and trends.',
      'Connect webhooks to push data to your CRM or Slack.',
    ],
    navHint: 'Analytics',
  },
  {
    title: 'You are all set.',
    subtitle: 'Time to capture your first lead.',
    body: 'Head to the Widgets page to create your first widget, build a question flow, grab the embed code, and paste it on your site. Leads will start rolling in.',
    tips: [
      'Create a widget from the sidebar.',
      'Use the Flow Builder to set up questions.',
      'Embed the code snippet and go live.',
    ],
    navHint: '',
  },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OnboardingOverlayProps {
  readonly onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const step = STEPS[currentStep];
  if (!step) {
    return <></>;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const dismiss = useCallback((): void => {
    setClosing(true);
    setTimeout(() => {
      void fetch('/api/dashboard/onboarding', { method: 'POST' });
      onComplete();
    }, 180);
  }, [onComplete]);

  const handleNext = useCallback((): void => {
    if (isLastStep) {
      dismiss();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, dismiss]);

  const handleBack = useCallback((): void => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 transition-opacity duration-150 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`relative w-full max-w-xl mx-4 bg-surface border border-border rounded-md transition-transform duration-150 ${
          closing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Skip link */}
        {!isLastStep && (
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 text-xs text-stone hover:text-ink font-body transition-colors duration-150"
          >
            Skip tour
          </button>
        )}

        {/* Body */}
        <div className="px-8 pt-10 pb-4">
          {/* Logo on welcome step, step number badge on others */}
          <div className="flex justify-center mb-6">
            {isFirstStep ? (
              <Logo size="lg" />
            ) : (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-surface-alt border border-border text-sm font-mono font-semibold text-ink">
                {String(currentStep)}
              </span>
            )}
          </div>

          {/* Heading */}
          <h2 className="text-center font-display text-xl font-semibold text-ink">
            {step.title}
          </h2>
          <p className="text-center text-sm text-signal font-body font-medium mt-1">
            {step.subtitle}
          </p>

          {/* Description */}
          <p className="text-center text-sm text-stone font-body mt-4 mx-auto max-w-md leading-relaxed">
            {step.body}
          </p>

          {/* Tips */}
          <ul className="mt-5 mx-auto max-w-md space-y-2">
            {step.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                <span className="text-sm text-stone font-body">{tip}</span>
              </li>
            ))}
          </ul>

          {/* Nav hint */}
          {step.navHint.length > 0 && (
            <p className="text-center text-xs text-stone-light font-body mt-4">
              Find this under <span className="font-medium text-stone">{step.navHint}</span> in the sidebar.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4">
          {/* Progress */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={`dot-${String(i)}`}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  i === currentStep
                    ? 'w-5 bg-signal'
                    : i < currentStep
                      ? 'w-1.5 bg-signal/40'
                      : 'w-1.5 bg-border-dark'
                }`}
                aria-label={`Go to step ${String(i + 1)}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep}
              className={`btn-ghost ${isFirstStep ? 'opacity-0 pointer-events-none' : ''}`}
            >
              Back
            </button>

            <span className="text-xs text-stone-light font-body tabular-nums">
              {String(currentStep + 1)}/{String(TOTAL_STEPS)}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              {isLastStep ? 'Go to Dashboard' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
