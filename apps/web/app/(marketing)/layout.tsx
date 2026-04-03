'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { AuditPromoModal } from '@/components/shared/AuditPromoModal';
import { CookieBanner } from '@/components/shared/CookieBanner';
import { Logo } from '@/components/shared/Logo';

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
  { href: '/integrations', label: 'Integrations' },
  { href: '/agency', label: 'Agencies' },
] as const;

const FOOTER_COMPANY = [
  { href: '/why-hawkleads', label: 'Why HawkLeads' },
  { href: '/login', label: 'Log In' },
  { href: '/signup', label: 'Sign Up' },
] as const;

const FOOTER_LEGAL = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: 'mailto:support@hawkleads.io', label: 'Contact' },
] as const;

interface MarketingLayoutProps {
  readonly children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHeroPage = pathname === '/' || pathname === '/why-hawkleads' || pathname === '/agency';

  useEffect(() => {
    function handleScroll(): void {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const headerBg = isHeroPage && !scrolled
    ? 'bg-transparent'
    : 'bg-paper/95 backdrop-blur-sm';

  const headerBorder = scrolled
    ? 'border-b border-border'
    : 'border-b border-transparent';

  const navTextClass = isHeroPage && !scrolled
    ? 'text-white/70 hover:text-white'
    : 'text-stone hover:text-ink';

  const navActiveClass = isHeroPage && !scrolled
    ? 'text-white font-medium'
    : 'text-ink font-medium';

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-200 ${headerBg} ${headerBorder}`}
      >
        <nav className="w-full max-w-content mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="no-underline">
            <Logo size="md" dark={isHeroPage && !scrolled} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-body transition-colors duration-fast ${
                  pathname === link.href ? navActiveClass : navTextClass
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/audit"
              className={`inline-flex items-center gap-1.5 text-sm font-body font-medium transition-colors duration-fast ${
                pathname === '/audit'
                  ? navActiveClass
                  : isHeroPage && !scrolled
                    ? 'text-signal-light hover:text-white'
                    : 'text-signal hover:text-signal-hover'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Free Audit
            </Link>
            <Link href="/login" className={`text-sm font-body transition-colors duration-fast ${
              isHeroPage && !scrolled ? 'text-white/70 hover:text-white' : 'text-stone hover:text-ink'
            }`}>
              Log In
            </Link>
            <Link
              href="/signup"
              className={`inline-flex items-center justify-center rounded-md font-body font-medium text-sm h-9 px-4 transition-all duration-fast ${
                isHeroPage && !scrolled
                  ? 'bg-white text-ink hover:bg-white/90'
                  : 'bg-ink text-white hover:bg-ink/90'
              }`}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 rounded-sm hover:bg-white/10 transition-colors duration-fast"
            aria-label="Open menu"
          >
            <svg className={`w-5 h-5 ${isHeroPage && !scrolled ? 'text-white' : 'text-ink'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile slide-in drawer */}
      <div className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <nav className={`absolute top-0 right-0 bottom-0 w-72 bg-paper border-l border-border flex flex-col transition-transform duration-200 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-1.5 px-3 py-3 rounded-md text-sm font-body transition-colors duration-fast ${
                pathname === '/audit'
                  ? 'text-ink font-medium bg-surface-alt'
                  : 'text-signal font-medium hover:bg-signal-light'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Free Audit
            </Link>
            <div className="my-3 border-t border-border" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-3 rounded-md text-sm font-body text-stone hover:text-ink hover:bg-surface-alt transition-colors duration-fast"
            >
              Log In
            </Link>
          </div>
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

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-surface-alt border-t border-border">
        <div className="max-w-content mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="no-underline">
                <Logo size="sm" />
              </Link>
              <p className="mt-3 text-sm text-stone leading-relaxed">
                Score every lead before you pick up the phone.
              </p>
              <p className="mt-2 text-xs text-stone-light">Built in Virginia.</p>
            </div>

            <div>
              <h4 className="font-body text-xs font-semibold text-stone uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5">
                {FOOTER_PRODUCT.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone hover:text-ink transition-colors duration-fast">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-body text-xs font-semibold text-stone uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                {FOOTER_COMPANY.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone hover:text-ink transition-colors duration-fast">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-body text-xs font-semibold text-stone uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone hover:text-ink transition-colors duration-fast">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-light" suppressHydrationWarning>
            <span>&copy; 2026 HawkLeads. All rights reserved.</span>
            <span>A WorkBird LLC Company.</span>
          </div>
        </div>
      </footer>

      <script
        dangerouslySetInnerHTML={{
          __html: `window.HawkLeadsConfig={key:"f60fc7fb2a37017dbcf20a28",apiUrl:"https://hawkleads.io"};`,
        }}
      />
      <script src="/widget/sb.js" async />

      <CookieBanner />
      {!pathname.startsWith('/audit') && <AuditPromoModal />}
    </div>
  );
}
