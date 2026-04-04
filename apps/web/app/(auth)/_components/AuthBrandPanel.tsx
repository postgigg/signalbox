'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/shared/Logo';

interface BrandContent {
  readonly headline: string;
  readonly sub: string;
}

const BRAND_COPY: Record<string, BrandContent> = {
  '/login': {
    headline: 'Welcome back.',
    sub: 'Your scored leads are waiting. Log in to see who to call first.',
  },
  '/signup': {
    headline: 'Stop chasing cold leads.',
    sub: 'Join HawkLeads and know the budget, timeline, and intent of every lead before you pick up the phone.',
  },
  '/forgot-password': {
    headline: 'It happens.',
    sub: 'Enter your email and we will send you a link to reset your password.',
  },
  '/reset-password': {
    headline: 'Almost there.',
    sub: 'Pick a new password and you are back in business.',
  },
  '/onboarding': {
    headline: 'Let us get you set up.',
    sub: 'Three steps. Two minutes. Your first scored lead is closer than you think.',
  },
};

const DEFAULT_CONTENT: BrandContent = {
  headline: 'Know which leads are worth your time.',
  sub: 'Qualify. Score. Route. Follow up. One widget does it all.',
};

export function AuthBrandPanel(): React.ReactElement {
  const pathname = usePathname();
  const content = BRAND_COPY[pathname] ?? DEFAULT_CONTENT;

  return (
    <div className="hidden lg:flex lg:w-1/2 flex-shrink-0 items-center justify-center relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Background watermark mark */}
      <svg
        viewBox="0 0 180 180"
        fill="none"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '460px', height: '460px', opacity: 0.04 }}
        aria-hidden="true"
      >
        <path d="M20 90 L62 16 L62 164 Z" fill="#E8E4DF" />
        <path d="M42 90 L76 28 L76 152 Z" fill="#E8E4DF" />
        <path d="M64 90 L92 44 L92 136 Z" fill="#E8E4DF" />
      </svg>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-[400px]">
        <Link href="/" className="no-underline mb-10">
          <Logo size="lg" dark />
        </Link>

        <h2 className="font-display text-3xl font-semibold leading-tight" style={{ color: '#E8E4DF' }}>
          {content.headline}
        </h2>

        <p className="mt-4 text-sm" style={{ color: '#4a4540', lineHeight: '1.7' }}>
          {content.sub}
        </p>

        {/* Score dimension bars */}
        <div className="mt-10 w-full" style={{ borderTop: '1px solid rgba(228, 224, 223, 0.06)' }}>
          <div className="pt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-left" style={{ color: '#4a4540', width: '56px', flexShrink: 0 }}>Form</span>
              <div className="flex-1 h-1" style={{ background: 'rgba(228, 224, 223, 0.06)' }}>
                <div className="h-full" style={{ width: '60%', background: '#2563EB' }} />
              </div>
              <span className="text-xs" style={{ color: '#4a4540', width: '28px', textAlign: 'right', flexShrink: 0 }}>60%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-left" style={{ color: '#4a4540', width: '56px', flexShrink: 0 }}>Behavior</span>
              <div className="flex-1 h-1" style={{ background: 'rgba(228, 224, 223, 0.06)' }}>
                <div className="h-full" style={{ width: '20%', background: '#16A34A' }} />
              </div>
              <span className="text-xs" style={{ color: '#4a4540', width: '28px', textAlign: 'right', flexShrink: 0 }}>20%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-left" style={{ color: '#4a4540', width: '56px', flexShrink: 0 }}>Intent</span>
              <div className="flex-1 h-1" style={{ background: 'rgba(228, 224, 223, 0.06)' }}>
                <div className="h-full" style={{ width: '20%', background: '#CA8A04' }} />
              </div>
              <span className="text-xs" style={{ color: '#4a4540', width: '28px', textAlign: 'right', flexShrink: 0 }}>20%</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs" style={{ color: '#4a4540' }}>
          hawkleads.io
        </p>
      </div>
    </div>
  );
}
