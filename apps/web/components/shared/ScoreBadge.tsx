import React from 'react';

export type ScoreTier = 'hot' | 'warm' | 'cold';

export interface ScoreBadgeProps {
  score: number;
  tier: ScoreTier;
  variant?: 'circle' | 'inline';
  className?: string;
}

const tierColors: Record<ScoreTier, { bg: string; text: string; border: string }> = {
  hot: { bg: 'bg-danger-light', text: 'text-danger', border: 'border-danger/20' },
  warm: { bg: 'bg-warning-light', text: 'text-warning', border: 'border-warning/20' },
  cold: { bg: 'bg-surface-alt', text: 'text-stone', border: 'border-border' },
};

export function ScoreBadge({
  score,
  tier,
  variant = 'inline',
  className = '',
}: ScoreBadgeProps) {
  const colors = tierColors[tier];

  if (variant === 'circle') {
    return (
      <div
        className={[
          'inline-flex items-center justify-center',
          'h-10 w-10 rounded-full border',
          colors.bg,
          colors.text,
          colors.border,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={`Score: ${score}, tier: ${tier}`}
      >
        <span className="font-mono text-sm font-bold">{score}</span>
      </div>
    );
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 border',
        colors.bg,
        colors.text,
        colors.border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`Score: ${score}, tier: ${tier}`}
    >
      <span className="font-mono text-xs font-bold">{score}</span>
      <span className="text-xs font-medium capitalize">{tier}</span>
    </span>
  );
}
