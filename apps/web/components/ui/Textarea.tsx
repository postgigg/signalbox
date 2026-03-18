'use client';

import React, { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, name, error, className = '', required, disabled, ...rest },
  ref
) {
  const textareaId = `textarea-${name}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={textareaId}
        className="font-body text-sm font-medium text-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'min-h-24 w-full px-3 py-2.5 font-body text-sm text-ink placeholder:text-stone-light',
          'border rounded-sm bg-surface transition-all duration-fast resize-y',
          'focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-danger' : 'border-border',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
