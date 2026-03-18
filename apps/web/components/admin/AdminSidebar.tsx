'use client';

import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AdminSidebarProps {
  activeItem: string;
  onNavigate: (value: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function IconOverview({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconAccounts({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
    </svg>
  );
}

function IconSubmissions({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 4h12v12H4z" rx="1" />
      <path d="M7 8h6M7 11h4" strokeLinecap="round" />
    </svg>
  );
}

function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 17V10M7 17V6M11 17V8M15 17V3" strokeLinecap="round" />
    </svg>
  );
}

function IconRevenue({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v8M7.5 8.5h4a1.5 1.5 0 010 3h-4M8 11.5h3.5a1.5 1.5 0 010 3H7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTickets({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="1.5" />
      <path d="M3 8h14M7 3v14" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTemplates({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="2" width="14" height="16" rx="1.5" />
      <path d="M6 6h8M6 9h5M6 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconEmail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="1.5" />
      <path d="M2 6l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
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

function IconAudit({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 2l6 3v5c0 4-3 6.5-6 7.5C7 16.5 4 14 4 10V5l6-3z" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav items                                                          */
/* ------------------------------------------------------------------ */

const navItems: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Overview', value: 'overview', icon: IconOverview },
  { label: 'Accounts', value: 'accounts', icon: IconAccounts },
  { label: 'Submissions', value: 'submissions', icon: IconSubmissions },
  { label: 'Analytics', value: 'analytics', icon: IconAnalytics },
  { label: 'Revenue', value: 'revenue', icon: IconRevenue },
  { label: 'Support Tickets', value: 'tickets', icon: IconTickets },
  { label: 'Templates', value: 'templates', icon: IconTemplates },
  { label: 'Email Templates', value: 'email-templates', icon: IconEmail },
  { label: 'Settings', value: 'settings', icon: IconSettings },
  { label: 'Audit Log', value: 'audit-log', icon: IconAudit },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminSidebar({ activeItem, onNavigate }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-sm bg-ink text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-danger"
        aria-label={collapsed ? 'Open admin navigation' : 'Close admin navigation'}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          {collapsed ? (
            <path fillRule="evenodd" d="M3 5h14a1 1 0 110 2H3a1 1 0 010-2zm0 4h14a1 1 0 110 2H3a1 1 0 010-2zm0 4h14a1 1 0 110 2H3a1 1 0 010-2z" clipRule="evenodd" />
          ) : (
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={toggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-40 h-full w-sidebar bg-ink text-white',
          'flex flex-col transition-transform duration-normal',
          'lg:translate-x-0',
          collapsed ? '-translate-x-full' : 'translate-x-0',
        ].join(' ')}
        aria-label="Admin navigation"
      >
        {/* Red accent stripe */}
        <div className="h-1 bg-danger shrink-0" />

        {/* Header */}
        <div className="px-5 h-16 flex items-center gap-2 border-b border-white/10 shrink-0">
          <span className="font-display text-lg font-semibold tracking-tight">
            SignalBox
          </span>
          <span className="inline-flex items-center rounded-pill bg-danger text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-0.5" role="list">
            {navItems.map((item) => {
              const isActive = item.value === activeItem;
              const Icon = item.icon;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.value);
                      if (window.innerWidth < 1024) setCollapsed(true);
                    }}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-body font-medium',
                      'transition-colors duration-fast',
                      'focus:outline-none focus:ring-2 focus:ring-danger focus:ring-inset',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white',
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
