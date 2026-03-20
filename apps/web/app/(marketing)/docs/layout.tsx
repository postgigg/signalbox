import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'API Documentation — Integrate HawkLeads Into Your Stack',
  description: 'HawkLeads API docs. REST endpoints for leads, widgets, flows, analytics, and webhooks. API key authentication. Comprehensive integration guide.',
  keywords: ['lead scoring API', 'widget API', 'lead management API', 'webhook integration', 'REST API lead scoring'],
  alternates: { canonical: 'https://hawkleads.netlify.app/docs' },
  openGraph: {
    title: 'HawkLeads API Documentation',
    description: 'REST API for lead scoring, widgets, flows, analytics, and webhooks. Full integration guide.',
    url: 'https://hawkleads.netlify.app/docs',
  },
};

export default function DocsLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
