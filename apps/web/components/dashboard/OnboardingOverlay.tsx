'use client';

import { useState, useCallback } from 'react';

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 6;

interface OnboardingStep {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: ReactNode;
  readonly tips: readonly string[];
  readonly navHint: string;
}

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    title: 'Welcome to HawkLeads',
    subtitle: 'Smart lead capture, built for conversion.',
    description:
      'HawkLeads helps you qualify visitors before they hit your inbox. Embed a smart widget on your site, score leads automatically, and focus your time on the ones that matter.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
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
    description:
      'Widgets are embeddable multi-step forms that guide visitors through qualifying questions before they submit their info. Each widget gets a unique embed code you can drop on any page.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
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
    description:
      'The Flow Builder lets you create multi-step question flows for each widget. Each answer carries a score weight, and the total determines whether a lead is hot, warm, or cold.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
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
    description:
      'Every submission is scored based on the answers your visitors give. Leads are automatically categorized into tiers so you know exactly who to call first. Adjust the thresholds in Settings to fit your business.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    tips: [
      'Default thresholds: Hot 70+, Warm 40+, Cold below 40.',
      'View and manage all leads from the Leads page.',
      'Filter by tier, status, date, and more.',
    ],
    navHint: 'Leads',
  },
  {
    title: 'Analytics',
    subtitle: 'Track every step of the funnel.',
    description:
      'See how visitors move through your widget, where they drop off, and which questions convert best. The conversion funnel on your Overview page gives you a quick snapshot, while the full Analytics page digs deeper.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
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
    description:
      'Head to the Widgets page to create your first widget, build a question flow, grab the embed code, and paste it on your site. Leads will start rolling in.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
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

  const step = ONBOARDING_STEPS[currentStep];
  if (!step) {
    return <></>;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const handleNext = useCallback((): void => {
    if (isLastStep) {
      setClosing(true);
      // Allow exit animation
      setTimeout(() => {
        void fetch('/api/dashboard/onboarding', { method: 'POST' });
        onComplete();
      }, 200);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handleBack = useCallback((): void => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback((): void => {
    setClosing(true);
    setTimeout(() => {
      void fetch('/api/dashboard/onboarding', { method: 'POST' });
      onComplete();
    }, 200);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`relative w-full max-w-2xl mx-4 bg-surface rounded-lg border border-border shadow-lg transition-transform duration-200 ${
          closing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Skip button */}
        {!isLastStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-xs text-stone hover:text-ink transition-colors duration-150 font-body"
          >
            Skip tour
          </button>
        )}

        {/* Content */}
        <div className="px-8 pt-10 pb-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-md bg-signal-light text-signal mb-6">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-center font-display text-2xl font-semibold text-ink">
            {step.title}
          </h2>
          <p className="text-center text-sm text-signal font-medium font-body mt-1">
            {step.subtitle}
          </p>

          {/* Description */}
          <p className="text-center text-sm text-stone font-body mt-4 mx-auto max-w-md leading-relaxed">
            {step.description}
          </p>

          {/* Tips */}
          <div className="mt-6 mx-auto max-w-md space-y-2.5">
            {step.tips.map((tip) => (
              <div key={tip} className="flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-success mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm text-stone-dark font-body">{tip}</span>
              </div>
            ))}
          </div>

          {/* Nav hint */}
          {step.navHint.length > 0 && (
            <p className="text-center text-xs text-stone-light font-body mt-5">
              Find this in the <span className="font-medium text-stone">{step.navHint}</span> section of the sidebar.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={`step-${String(i)}`}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-150 ${
                  i === currentStep
                    ? 'bg-signal w-5'
                    : i < currentStep
                      ? 'bg-signal/40'
                      : 'bg-border-dark'
                }`}
                aria-label={`Go to step ${String(i + 1)}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep}
              className={`px-5 py-2.5 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
                isFirstStep
                  ? 'text-stone-light cursor-not-allowed'
                  : 'text-stone hover:text-ink hover:bg-surface-alt'
              }`}
            >
              Back
            </button>

            <span className="text-xs text-stone-light font-body tabular-nums">
              {String(currentStep + 1)} of {String(TOTAL_STEPS)}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-md text-sm font-body font-medium bg-signal text-white hover:bg-signal-hover transition-colors duration-150"
            >
              {isLastStep ? 'Go to Dashboard' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
