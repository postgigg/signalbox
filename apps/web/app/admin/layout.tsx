'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { ReactNode } from 'react';

interface AdminNavItem {
  readonly href: string;
  readonly label: string;
}

const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/accounts', label: 'Accounts' },
  { href: '/admin/submissions', label: 'Submissions' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/revenue', label: 'Revenue' },
  { href: '/admin/tickets', label: 'Support Tickets' },
  { href: '/admin/templates', label: 'Templates' },
  { href: '/admin/email-templates', label: 'Email Templates' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/audit', label: 'Audit Log' },
] as const;

interface AdminLayoutProps {
  readonly children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-paper">
      <meta name="robots" content="noindex, nofollow" />
      {/* Red accent stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-danger z-[60]" />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0.5 left-0 right-0 z-40 h-14 bg-ink flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-white/70 hover:text-white transition-colors duration-fast"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          HawkLeads
        </span>
        <span className="ml-2 text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">
          ADMIN
        </span>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-sidebar bg-ink flex flex-col transition-transform duration-normal lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Red stripe */}
        <div className="h-0.5 bg-danger" />

        <div className="h-14 flex items-center px-5 border-b border-white/10">
          <Link href="/admin" className="font-display text-lg font-semibold tracking-tight text-white">
            HawkLeads
          </Link>
          <span className="ml-2 text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2 rounded-sm text-sm font-body transition-colors duration-fast ${
                isActive(item.href)
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center px-3 py-2 rounded-sm text-sm font-body text-white/40 hover:text-white/60 transition-colors duration-fast"
          >
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-sidebar pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-[1100px]">
          {children}
        </div>
      </main>
    </div>
  );
}
