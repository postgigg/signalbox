'use client';

interface PricingToggleProps {
  readonly isAnnual: boolean;
  readonly onToggle: () => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <span
        className={`text-sm font-body ${isAnnual ? 'text-stone' : 'text-ink font-medium'}`}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-pill transition-colors duration-fast ${
          isAnnual ? 'bg-signal' : 'bg-border-dark'
        }`}
        role="switch"
        aria-checked={isAnnual}
        aria-label="Toggle annual billing"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${
            isAnnual ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span
        className={`text-sm font-body ${isAnnual ? 'text-ink font-medium' : 'text-stone'}`}
      >
        Annual
        <span className="ml-1 text-xs text-signal font-medium">Save 17%</span>
      </span>
    </div>
  );
}
