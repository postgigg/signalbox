'use client';

import React, { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, name, options, placeholder, error, className = '', required, disabled, ...rest },
  ref
) {
  const selectId = `select-${name}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={selectId}
        className="font-body text-sm font-medium text-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            'h-12 w-full px-3 pr-10 font-body text-sm text-ink appearance-none',
            'border rounded-sm bg-surface transition-all duration-fast',
            'focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-border',
          ].join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
