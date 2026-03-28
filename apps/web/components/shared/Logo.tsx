import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  size?: LogoSize;
  dark?: boolean;
  className?: string;
}

const sizeMap: Record<LogoSize, { icon: number; text: string }> = {
  sm: { icon: 18, text: 'text-base' },
  md: { icon: 22, text: 'text-xl' },
  lg: { icon: 28, text: 'text-2xl' },
};

export function Logo({ size = 'md', dark = false, className = '' }: LogoProps) {
  const { icon, text } = sizeMap[size];
  const color = dark ? 'text-white' : 'text-ink';

  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${className}`}
      aria-label="HawkLeads"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={icon}
        height={icon}
        className={color}
      >
        <path d="M6 24 L16 6 L16 42 Z" fill="currentColor" opacity=".12" />
        <path d="M12 24 L20 10 L20 38 Z" fill="currentColor" opacity=".35" />
        <path d="M18 24 L26 12 L26 36 Z" fill="currentColor" />
        <circle cx="10" cy="24" r="1.5" fill="currentColor" />
      </svg>
      <span className={`font-body font-bold tracking-tight ${text} ${color}`}>
        HawkLeads
      </span>
    </span>
  );
}
