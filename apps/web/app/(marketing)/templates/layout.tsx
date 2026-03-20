import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Flow Templates — Pre-Built Qualification Flows by Industry',
  description: 'Ready-to-use lead qualification flow templates for SaaS, e-commerce, agencies, real estate, home services, healthcare, and more. Customize in minutes.',
  keywords: ['lead qualification templates', 'sales flow templates', 'industry lead scoring', 'qualification questionnaire', 'lead capture templates'],
  alternates: { canonical: 'https://hawkleads.netlify.app/templates' },
  openGraph: {
    title: 'HawkLeads Flow Templates — Start Scoring Leads in Minutes',
    description: 'Pre-built qualification flows for every industry. Pick a template, customize your questions, install the widget.',
    url: 'https://hawkleads.netlify.app/templates',
  },
};

export default function TemplatesLayout({ children }: { readonly children: ReactNode }): React.ReactElement {
  return <>{children}</>;
}
