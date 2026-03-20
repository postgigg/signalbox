'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Logo } from '@/components/shared/Logo';

import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/templates', label: 'Templates' },
] as const;

const FOOTER_PRODUCT = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'API Docs' },
  { href: '/templates', label: 'Templates' },
] as const;

const FOOTER_COMPANY = [
  { href: '/login', label: 'Log In' },
  { href: '/signup', label: 'Sign Up' },
] as const;

const FOOTER_LEGAL = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: 'mailto:support@hawkleads.io', label: 'Contact' },
] as const;

interface MarketingLayoutProps {
  readonly children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll(): void {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-sm h-16 flex items-center transition-[border-color] duration-fast ${
          scrolled ? 'border-b border-border' : 'border-b border-transparent'
        }`}
      >
        <nav className="w-full max-w-content mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="no-underline">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-body transition-colors duration-fast ${
                  pathname === link.href
                    ? 'text-ink font-medium'
                    : 'text-stone hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="btn-ghost text-sm">
              Log In
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-border bg-paper">
        <div className="max-w-content mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="no-underline">
                <Logo size="sm" />
              </Link>
              <p className="mt-2 text-sm text-stone">Built in Virginia.</p>
            </div>

            <div>
              <h4 className="font-body text-sm font-semibold text-ink mb-3">Product</h4>
              <ul className="space-y-2">
                {FOOTER_PRODUCT.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone hover:text-ink transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-body text-sm font-semibold text-ink mb-3">Account</h4>
              <ul className="space-y-2">
                {FOOTER_COMPANY.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone hover:text-ink transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-body text-sm font-semibold text-ink mb-3">Support</h4>
              <ul className="space-y-2">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone hover:text-ink transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-xs text-stone space-y-1">
            <p>&copy; 2026 HawkLeads. All rights reserved.</p>
            <p>A Workbird LLC Company.</p>
          </div>
        </div>
      </footer>

      {/* HawkLeads demo widget — loaded after page content */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.HawkLeadsConfig={key:"f60fc7fb2a37017dbcf20a28",apiUrl:"https://hawkleads.io"};`,
        }}
      />
      <script src="/widget/sb.js" async />
    </div>
  );
}
