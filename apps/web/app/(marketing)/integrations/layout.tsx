import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Integrations — Works With Every Website Platform and CRM',
  description:
    'HawkLeads integrates with Wix, WordPress, Shopify, Squarespace, Webflow, Zapier, Make, Salesforce, and HubSpot. Two lines of code. Any platform.',
};

interface IntegrationsLayoutProps {
  readonly children: ReactNode;
}

export default function IntegrationsLayout({ children }: IntegrationsLayoutProps): React.ReactElement {
  return <>{children}</>;
}
