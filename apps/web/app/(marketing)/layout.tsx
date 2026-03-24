'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Logo } from '@/components/shared/Logo';

import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/agency', label: 'Agencies' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll(): void {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 rounded-sm hover:bg-surface-alt transition-colors duration-fast"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          mobileMenuOpen ? '' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <nav
          className={`absolute top-0 right-0 bottom-0 w-72 bg-paper border-l border-border flex flex-col transition-transform duration-200 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
            <span className="text-sm font-semibold text-ink font-body">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-sm hover:bg-surface-alt transition-colors duration-fast"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer links */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-md text-sm font-body transition-colors duration-fast ${
                  pathname === link.href
                    ? 'text-ink font-medium bg-surface-alt'
                    : 'text-stone hover:text-ink hover:bg-surface-alt'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-3 border-t border-border" />

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-3 rounded-md text-sm font-body text-stone hover:text-ink hover:bg-surface-alt transition-colors duration-fast"
            >
              Log In
            </Link>
          </div>

          {/* Drawer footer CTA */}
          <div className="px-4 pb-6 pt-2 flex-shrink-0">
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center text-sm"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>
      </div>

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

          <div className="mt-10 pt-6 border-t border-border text-xs text-stone" suppressHydrationWarning>
            &copy; 2026 HawkLeads. All rights reserved. A Workbird LLC Company.
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
