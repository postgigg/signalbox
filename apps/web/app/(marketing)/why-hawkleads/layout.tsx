import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Why HawkLeads — The Data Behind Faster Lead Response',
  description: 'Market research, industry benchmarks, and the evidence behind why qualifying leads before the first call closes more deals, faster.',
  keywords: ['lead response time', 'lead qualification', 'speed to lead', 'lead scoring research', 'sales conversion data'],
  alternates: { canonical: 'https://hawkleads.netlify.app/why-hawkleads' },
  openGraph: {
    title: 'Why HawkLeads — The Data Behind Faster Lead Response',
    description: 'Market research and benchmarks proving that speed, scoring, and qualification win more deals.',
    url: 'https://hawkleads.netlify.app/why-hawkleads',
  },
};

export default function WhyLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
