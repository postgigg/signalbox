import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'API Documentation — Integrate SignalBox Into Your Stack',
  description: 'SignalBox API docs. REST endpoints for leads, widgets, flows, analytics, and webhooks. API key authentication. Comprehensive integration guide.',
  keywords: ['lead scoring API', 'widget API', 'lead management API', 'webhook integration', 'REST API lead scoring'],
  alternates: { canonical: 'https://signalbox.netlify.app/docs' },
  openGraph: {
    title: 'SignalBox API Documentation',
    description: 'REST API for lead scoring, widgets, flows, analytics, and webhooks. Full integration guide.',
    url: 'https://signalbox.netlify.app/docs',
  },
};

export default function DocsLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
