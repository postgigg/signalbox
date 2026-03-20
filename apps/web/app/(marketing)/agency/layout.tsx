import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HawkLeads for Agencies — White-Label Lead Scoring for Your Clients',
  description: 'Install HawkLeads on every client site. Share real-time analytics. Justify your retainer with data. White-label, multi-client dashboard, priority support.',
  keywords: ['agency lead scoring', 'white-label lead widget', 'client lead management', 'agency tools', 'multi-client dashboard'],
  alternates: { canonical: 'https://hawkleads.io/agency' },
  openGraph: {
    title: 'HawkLeads for Agencies',
    description: 'White-label lead scoring across all your client sites. Shared analytics, lead routing, and priority support.',
    url: 'https://hawkleads.io/agency',
  },
};

export default function AgencyLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
