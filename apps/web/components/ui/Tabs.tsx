'use client';

import React from 'react';

export interface Tab {
  label: string;
  value: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`border-b border-border ${className}`} role="tablist">
      <nav className="flex gap-0 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              onClick={() => onChange(tab.value)}
              className={[
                'px-4 py-2.5 text-sm font-body font-medium transition-colors duration-fast',
                'border-b-2 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-inset',
                isActive
                  ? 'text-signal border-signal'
                  : 'text-stone border-transparent hover:text-ink hover:border-border-dark',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
