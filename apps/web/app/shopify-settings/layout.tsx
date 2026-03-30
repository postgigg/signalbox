import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HawkLeads Settings — Shopify',
  description: 'Configure your HawkLeads widget for your Shopify store.',
  robots: { index: false, follow: false },
};

interface ShopifySettingsLayoutProps {
  readonly children: ReactNode;
}

export default function ShopifySettingsLayout({ children }: ShopifySettingsLayoutProps): React.ReactElement {
  return <>{children}</>;
}
