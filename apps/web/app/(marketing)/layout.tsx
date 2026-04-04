'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Logo } from '@/components/shared/Logo';
import { CookieBanner } from '@/components/shared/CookieBanner';

import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/why-hawkleads', label: 'Why HawkLeads' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/agency', label: 'Agencies' },
  { href: '/templates', label: 'Templates' },
  { href: '/integrations', label: 'Integrations' },
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
  { href: '/cookies', label: 'Cookies' },
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-fast ${
          scrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-zinc-800'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="w-full max-w-content mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="no-underline">
            <Logo size="md" dark />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-body transition-colors duration-fast ${
                  pathname === link.href
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/audit"
              className={`inline-flex items-center gap-1.5 text-sm font-body font-medium transition-colors duration-fast ${
                pathname === '/audit'
                  ? 'text-white'
                  : 'text-emerald-400 hover:text-emerald-300 nav-audit-nudge'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Free Audit
            </Link>
            <Link href="/login" className="text-sm font-body font-medium text-zinc-400 hover:text-white transition-colors duration-fast">
              Log In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 rounded-sm hover:bg-zinc-800 transition-colors duration-fast"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <nav className={`absolute top-0 right-0 bottom-0 w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col transition-transform duration-200 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 flex-shrink-0">
            <span className="text-sm font-semibold text-white font-body">Menu</span>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 rounded-sm hover:bg-zinc-800 transition-colors duration-fast" aria-label="Close menu">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-3 py-3 rounded-md text-sm font-body transition-colors duration-fast ${pathname === link.href ? 'text-white font-medium bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
                {link.label}
              </Link>
            ))}
            <Link href="/audit" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-1.5 px-3 py-3 rounded-md text-sm font-body transition-colors duration-fast ${pathname === '/audit' ? 'text-white font-medium bg-zinc-800' : 'text-emerald-400 font-medium hover:bg-emerald-400/10'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Free Audit
            </Link>
            <div className="my-3 border-t border-zinc-800" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-3 rounded-md text-sm font-body text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors duration-fast">Log In</Link>
          </div>
          <div className="px-4 pb-6 pt-2 flex-shrink-0">
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center w-full rounded-md bg-white text-black font-body font-medium text-sm h-10 px-4 transition-all duration-fast hover:bg-zinc-100">Start Free Trial</Link>
          </div>
        </nav>
      </div>

      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black">
        <div className="max-w-content mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="no-underline"><Logo size="sm" dark /></Link>
              <p className="mt-2 text-sm text-zinc-500">Built in Virginia.</p>
            </div>
            <div>
              <h4 className="font-body text-sm font-semibold text-zinc-300 mb-3">Product</h4>
              <ul className="space-y-2">
                {FOOTER_PRODUCT.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-fast">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body text-sm font-semibold text-zinc-300 mb-3">Account</h4>
              <ul className="space-y-2">
                {FOOTER_COMPANY.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-fast">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body text-sm font-semibold text-zinc-300 mb-3">Support</h4>
              <ul className="space-y-2">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors duration-fast">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-zinc-800 text-xs text-zinc-600" suppressHydrationWarning>
            &copy; 2026 HawkLeads. All rights reserved. A Workbird LLC Company.
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `window.HawkLeadsConfig={key:"f60fc7fb2a37017dbcf20a28",apiUrl:"https://hawkleads.io"};` }} />
      <script src="/widget/sb.js" async />
      <CookieBanner />
    </div>
  );
}
