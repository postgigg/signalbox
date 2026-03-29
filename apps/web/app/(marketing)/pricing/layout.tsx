import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pricing — Simple, Honest Plans for Every Team Size',
  description: 'HawkLeads pricing starts at $99/month. 30-day free trial on every plan. No credit card required. Starter, Pro, and Agency tiers for solo operators to large agencies.',
  keywords: ['lead scoring pricing', 'lead qualification cost', 'affordable lead scoring', 'lead scoring plans', 'SaaS pricing', 'contact form widget pricing'],
  alternates: { canonical: 'https://hawkleads.netlify.app/pricing' },
  openGraph: {
    title: 'HawkLeads Pricing — Plans Starting at $99/month',
    description: 'Simple pricing for lead scoring. Starter $99/mo, Pro $149/mo, Agency $249/mo. 30-day free trial, no credit card.',
    url: 'https://hawkleads.netlify.app/pricing',
  },
};

export default function PricingLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
