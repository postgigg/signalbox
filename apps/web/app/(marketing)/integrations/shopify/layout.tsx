import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HawkLeads for Shopify — Score Every Lead on Your Shopify Store',
  description:
    'Install HawkLeads from the Shopify App Store. Score leads 0-100 with qualifying questions. One-click install, auto-embeds on your storefront. 30-day free trial.',
};

interface ShopifyLayoutProps {
  readonly children: ReactNode;
}

export default function ShopifyLayout({ children }: ShopifyLayoutProps): React.ReactElement {
  return <>{children}</>;
}
