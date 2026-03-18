'use client';

import React, { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-white hover:bg-ink/90 focus:ring-signal',
  secondary:
    'bg-transparent border border-border text-ink hover:bg-surface-alt focus:ring-signal',
  danger:
    'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
  ghost:
    'bg-transparent text-stone hover:bg-surface-alt focus:ring-signal',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      className = '',
      children,
      ...rest
    } = props;

    const disabled = 'disabled' in rest ? rest.disabled : false;

    const classes = [
      'relative inline-flex items-center justify-center font-body font-medium',
      'rounded-sm transition-all duration-fast',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) ? 'opacity-50 pointer-events-none' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        <span className={loading ? 'invisible' : ''}>{children}</span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              role="status"
              aria-label="Loading"
            />
          </span>
        )}
      </>
    );

    if ('href' in props && props.href !== undefined) {
      const { href, ...anchorRest } = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          aria-disabled={disabled || loading}
          {...anchorRest}
        >
          {content}
        </a>
      );
    }

    const buttonRest = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading}
        {...buttonRest}
      >
        {content}
      </button>
    );
  }
);
