'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { PRIORITY_SUPPORT_EMAIL } from '@/lib/constants';
import { Logo } from '@/components/shared/Logo';
import { OnboardingOverlay } from '@/components/dashboard/OnboardingOverlay';

import type { ReactNode } from 'react';

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
  readonly agencyOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/leads',
    label: 'Leads',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/inbox',
    label: 'Inbox',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/widgets',
    label: 'Widgets',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/integrations',
    label: 'Integrations',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    href: '/dashboard/clients',
    label: 'Clients',
    agencyOnly: true,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
] as const;

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  useEffect(() => {
    async function loadAccountData(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('members')
          .select('account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        const { data: accountData } = await supabase
          .from('accounts')
          .select('plan, onboarding_completed_at')
          .eq('id', memberData.account_id)
          .single();

        if (accountData) {
          setAccountPlan(accountData.plan);
          if (accountData.onboarding_completed_at === null) {
            setShowOnboarding(true);
          }
        }
      } catch {
        // Failed to load account data
      }
    }
    void loadAccountData();
  }, []);

  useEffect(() => {
    async function fetchUnreadCount(): Promise<void> {
      try {
        const response = await fetch('/api/v1/admin/inbox/unread-count');
        if (!response.ok) return;
        const data = (await response.json()) as { count: number };
        setInboxUnreadCount(data.count);
      } catch {
        // Failed to fetch unread count
      }
    }
    void fetchUnreadCount();
  }, []);

  const handleOnboardingComplete = useCallback((): void => {
    setShowOnboarding(false);
  }, []);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setLoggingOut(false);
    }
  }

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.agencyOnly === true && accountPlan !== 'agency') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-paper">
      <meta name="robots" content="noindex, nofollow" />

      {/* Onboarding overlay */}
      {showOnboarding && (
        <OnboardingOverlay onComplete={handleOnboardingComplete} />
      )}

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface border-b border-border flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-sm hover:bg-surface-alt transition-colors duration-fast"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <Link href="/dashboard" className="no-underline">
          <Logo size="sm" />
        </Link>
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
        className={`fixed top-0 left-0 z-50 h-full w-sidebar bg-surface border-r border-border flex flex-col transition-transform duration-normal lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center px-5 border-b border-border">
          <Link href="/dashboard" className="no-underline">
            <Logo size="sm" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors duration-fast ${
                isActive(item.href)
                  ? 'bg-signal-light text-signal font-medium'
                  : 'text-stone hover:text-ink hover:bg-surface-alt'
              }`}
            >
              {item.icon}
              {item.label}
              {item.label === 'Inbox' && inboxUnreadCount > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-pill bg-signal-light text-signal font-medium min-w-[20px] text-center">
                  {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-2">
          {accountPlan === 'agency' && (
            <a
              href={`mailto:${PRIORITY_SUPPORT_EMAIL}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body text-stone hover:text-ink hover:bg-surface-alt transition-colors duration-fast w-full"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <span>Priority Support</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-pill bg-signal-light text-signal font-medium">Pro</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body text-stone hover:text-ink hover:bg-surface-alt transition-colors duration-fast w-full"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {loggingOut ? (
              <>
                <span className="spinner w-[14px] h-[14px]" />
                Logging out...
              </>
            ) : 'Log out'}
          </button>
          <div className="px-3 py-2 text-xs text-stone-light font-body">
            HawkLeads v1.0
          </div>
        </div>
      </aside>

      {/* Main content — fills full width beside sidebar */}
      <main className="lg:ml-sidebar pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
