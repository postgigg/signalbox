import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'SignalBox — Your contact page is costing you money.',
    template: '%s | SignalBox',
  },
  description:
    'Replace your contact form with a guided qualifying flow that scores every lead before you pick up the phone. 14-day free trial.',
  metadataBase: new URL('https://signalbox.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://signalbox.io',
    siteName: 'SignalBox',
    title: 'SignalBox | Your Contact Page is Costing You Money',
    description:
      'Replace your contact form with a guided qualifying flow that scores every lead before you pick up the phone.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'SignalBox: Your contact page is costing you money.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SignalBox | Your Contact Page is Costing You Money',
    description:
      'Replace your contact form with a guided qualifying flow that scores every lead before you pick up the phone.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className="font-body">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
