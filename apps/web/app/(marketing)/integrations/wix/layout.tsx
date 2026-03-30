import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HawkLeads for Wix — Score Every Lead on Your Wix Site',
  description:
    'Install HawkLeads from the Wix App Market. Score website leads 0-100 with qualifying questions. One-click install, no code needed. 30-day free trial.',
};

interface WixLayoutProps {
  readonly children: ReactNode;
}

export default function WixLayout({ children }: WixLayoutProps): React.ReactElement {
  return <>{children}</>;
}
