'use client';

import React, { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PreviewOption {
  id: string;
  label: string;
}

export interface PreviewStep {
  id: string;
  question: string;
  options: PreviewOption[];
}

export interface WidgetTheme {
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface WidgetPreviewProps {
  steps: PreviewStep[];
  theme?: WidgetTheme;
  brandName?: string;
}

const defaultTheme: WidgetTheme = {
  primaryColor: '#2563EB',
  borderRadius: 8,
  fontFamily: 'system-ui, sans-serif',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WidgetPreview({
  steps,
  theme: themeProp,
  brandName = 'SignalBox',
}: WidgetPreviewProps) {
  const theme = { ...defaultTheme, ...themeProp };
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const hasSteps = steps.length > 0;

  const selectOption = (stepId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [stepId]: optionId }));
  };

  const goNext = () => {
    if (!isLast) setCurrentStep((s) => s + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const reset = () => {
    setCurrentStep(0);
    setSelectedOptions({});
  };

  if (!hasSteps) {
    return (
      <div
        className="flex items-center justify-center h-full text-sm"
        style={{ fontFamily: theme.fontFamily, color: '#64748B' }}
      >
        No steps configured
      </div>
    );
  }

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
      }}
      className="bg-white border border-[#E2E8F0] overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-1 bg-[#E2E8F0]">
        <div
          className="h-full transition-[width] duration-[400ms] ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: theme.primaryColor,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Completed state */}
        {isLast && step && selectedOptions[step.id] ? (
          <div className="text-center py-4">
            <svg
              className="h-10 w-10 mx-auto mb-3"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="20" fill={theme.primaryColor} opacity="0.1" />
              <path
                d="M14 20l4 4 8-8"
                stroke={theme.primaryColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-base font-semibold text-[#0F172A]">Thank you!</p>
            <p className="text-sm text-[#64748B] mt-1">We&apos;ll be in touch soon.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-xs font-medium transition-colors duration-150"
              style={{ color: theme.primaryColor }}
            >
              Start over
            </button>
          </div>
        ) : step ? (
          <>
            {/* Step counter */}
            <p className="text-xs text-[#64748B] mb-3">
              Step {currentStep + 1} of {steps.length}
            </p>

            {/* Question */}
            <p className="text-sm font-medium text-[#0F172A] mb-4">{step.question}</p>

            {/* Options */}
            <div className="space-y-2">
              {step.options.map((opt) => {
                const isSelected = selectedOptions[step.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => selectOption(step.id, opt.id)}
                    className="w-full text-left px-3 py-2.5 text-sm border rounded transition-all duration-150"
                    style={{
                      borderRadius: Math.max(4, theme.borderRadius - 2),
                      borderColor: isSelected ? theme.primaryColor : '#E2E8F0',
                      backgroundColor: isSelected ? `${theme.primaryColor}08` : 'transparent',
                      color: '#0F172A',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="text-xs font-medium text-[#64748B] disabled:opacity-30 transition-colors duration-150 hover:text-[#0F172A]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!selectedOptions[step.id]}
                className="px-4 py-2 text-xs font-medium text-white rounded transition-colors duration-150 disabled:opacity-40"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: Math.max(4, theme.borderRadius - 2),
                }}
              >
                {isLast ? 'Submit' : 'Next'}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Branding */}
      <div className="px-5 py-2 border-t border-[#E2E8F0] text-center">
        <p className="text-[10px] text-[#94A3B8]">
          Powered by {brandName}
        </p>
      </div>
    </div>
  );
}
