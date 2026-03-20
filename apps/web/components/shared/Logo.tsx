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
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={icon}
        height={icon}
        className={color}
      >
        <path d="M12 8L22 56" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M26 4L40 60" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <path d="M44 12L50 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <span className={`font-body font-bold tracking-tight ${text} ${color}`}>
        HawkLeads
      </span>
    </span>
  );
}
