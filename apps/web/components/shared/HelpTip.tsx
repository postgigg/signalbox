'use client';

import { useState, useEffect, useRef, useId } from 'react';

interface HelpTipProps {
  readonly text: string;
  readonly position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTip({ text, position = 'top' }: HelpTipProps): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  // Close on click outside (for mobile tap-to-toggle)
  useEffect(() => {
    if (!visible) return;

    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'help-tooltip-arrow-top',
    bottom: 'help-tooltip-arrow-bottom',
    left: 'help-tooltip-arrow-left',
    right: 'help-tooltip-arrow-right',
  };

  return (
    <span ref={containerRef} className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        aria-label="Help"
        aria-describedby={visible ? tooltipId : undefined}
        onClick={() => setVisible((prev) => !prev)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-stone-light text-stone text-[10px] font-body leading-none hover:border-ink hover:text-ink focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-1 transition-colors duration-fast cursor-help"
      >
        ?
      </button>
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 bg-ink text-white text-xs font-body leading-relaxed rounded-sm px-3 py-2 max-w-[280px] w-max pointer-events-none ${positionClasses[position] ?? positionClasses['top']} ${arrowClasses[position] ?? arrowClasses['top']}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
