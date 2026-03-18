'use client';

import React, { useState, useCallback } from 'react';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : label}
      className={[
        'inline-flex items-center gap-1.5 h-8 px-3 text-sm font-body font-medium',
        'border border-border rounded-sm bg-surface',
        'hover:bg-surface-alt transition-colors duration-fast',
        'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-success" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          <span className="text-success">Copied!</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4 text-stone" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1" />
            <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
          </svg>
          <span className="text-ink">{label}</span>
        </>
      )}
    </button>
  );
}
