import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HawkLeads Settings — Wix',
  description: 'Configure your HawkLeads widget for your Wix site.',
  robots: { index: false, follow: false },
};

interface WixSettingsLayoutProps {
  readonly children: ReactNode;
}

export default function WixSettingsLayout({ children }: WixSettingsLayoutProps): React.ReactElement {
  return <>{children}</>;
}
