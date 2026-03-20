import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'HawkLeads — Score Every Lead Before You Pick Up the Phone',
    template: '%s | HawkLeads',
  },
  description:
    'HawkLeads is an embeddable lead qualification widget that scores website visitors in real time. Replace your contact form with a guided qualifying flow. Know who to call first. 14-day free trial.',
  keywords: [
    'lead scoring',
    'lead qualification',
    'website widget',
    'contact form alternative',
    'lead generation',
    'sales prioritization',
    'lead scoring software',
    'website lead capture',
    'smart contact form',
    'B2B lead scoring',
    'inbound lead management',
    'lead qualification tool',
    'sales automation',
    'lead routing',
    'conversion optimization',
    'visitor scoring',
    'hot lead alerts',
    'lead scoring widget',
    'embeddable widget',
    'SaaS lead generation',
  ],
  metadataBase: new URL('https://hawkleads.netlify.app'),
  alternates: {
    canonical: 'https://hawkleads.netlify.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hawkleads.netlify.app',
    siteName: 'HawkLeads',
    title: 'HawkLeads — Score Every Lead Before You Pick Up the Phone',
    description:
      'An embeddable widget that qualifies website visitors through scored questionnaires. Get a prioritized call list. Close more deals. 14-day free trial.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'HawkLeads: Score every lead before you pick up the phone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HawkLeads — Score Every Lead Before You Pick Up the Phone',
    description:
      'An embeddable widget that qualifies website visitors through scored questionnaires. Get a prioritized call list. Close more deals.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HawkLeads',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Embeddable lead qualification widget that scores website visitors in real time and delivers a prioritized call list.',
    url: 'https://hawkleads.netlify.app',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '99',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        description: '1 widget, 500 submissions/month, lead scoring, email alerts',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '149',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        description: '5 widgets, 2000 submissions/month, webhooks, advanced analytics',
      },
      {
        '@type': 'Offer',
        name: 'Agency',
        price: '249',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        description: '25 widgets, unlimited submissions, white-label, priority support',
      },
    ],
    featureList: [
      'Real-time lead scoring',
      'Embeddable website widget',
      'Multi-step qualification flows',
      'Hot, warm, cold lead tiers',
      'Email and Slack notifications',
      'Webhook integrations',
      'Advanced analytics',
      'Team collaboration',
      'White-label branding',
      'API access',
    ],
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HawkLeads',
    url: 'https://hawkleads.netlify.app',
    description: 'Lead qualification and scoring platform for businesses.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@hawkleads.io',
      contactType: 'customer support',
    },
  };

  return (
    <html lang="en" className="font-body">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
