'use client';

import React, { useState, useCallback } from 'react';

export interface SidebarNavItem {
  label: string;
  href: string;
  value: string;
}

export interface SidebarProps {
  activeItem: string;
  onNavigate: (value: string) => void;
}

/* ---- Inline SVG icons ---- */

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 10.5L10 4l7 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLeads({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="7" r="3" />
      <path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
      <circle cx="15" cy="6" r="2" />
      <path d="M15 10c2 0 4 1 4 3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconWidgets({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1" />
      <rect x="11" y="2" width="7" height="7" rx="1" />
      <rect x="2" y="11" width="7" height="7" rx="1" />
      <rect x="11" y="11" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 17V10" strokeLinecap="round" />
      <path d="M7 17V6" strokeLinecap="round" />
      <path d="M11 17V8" strokeLinecap="round" />
      <path d="M15 17V3" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1v2m0 14v2M1 10h2m14 0h2m-2.636-6.364l-1.414 1.414M5.05 14.95l-1.414 1.414m0-12.728l1.414 1.414m9.9 9.9l1.414 1.414" strokeLinecap="round" />
    </svg>
  );
}

const navItems: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Overview', value: 'overview', icon: IconHome },
  { label: 'Leads', value: 'leads', icon: IconLeads },
  { label: 'Widgets', value: 'widgets', icon: IconWidgets },
  { label: 'Analytics', value: 'analytics', icon: IconAnalytics },
  { label: 'Settings', value: 'settings', icon: IconSettings },
];

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <>
      {/* Mobile hamburger toggle (visible below lg) */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-sm bg-surface border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-signal"
        aria-label={collapsed ? 'Open navigation' : 'Close navigation'}
      >
        <svg className="h-5 w-5 text-ink" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          {collapsed ? (
            <path fillRule="evenodd" d="M3 5h14a1 1 0 110 2H3a1 1 0 010-2zm0 4h14a1 1 0 110 2H3a1 1 0 010-2zm0 4h14a1 1 0 110 2H3a1 1 0 010-2z" clipRule="evenodd" />
          ) : (
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={toggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-40 h-full w-sidebar bg-surface border-r border-border',
          'flex flex-col transition-transform duration-normal',
          'lg:translate-x-0',
          collapsed ? '-translate-x-full' : 'translate-x-0',
        ].join(' ')}
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-border shrink-0">
          <span className="font-display text-xl font-semibold text-ink tracking-tight">
            SignalBox
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const isActive = item.value === activeItem;
              const Icon = item.icon;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.value);
                      /* Auto-collapse on mobile */
                      if (window.innerWidth < 1024) setCollapsed(true);
                    }}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-body font-medium',
                      'transition-colors duration-fast',
                      'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-inset',
                      isActive
                        ? 'bg-signal-light text-signal'
                        : 'text-stone hover:bg-surface-alt hover:text-ink',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
