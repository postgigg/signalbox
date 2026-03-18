'use client';

import Link from 'next/link';
import { useState } from 'react';

const INDUSTRIES = [
  'All',
  'Home Services',
  'Legal',
  'Medical',
  'Agency',
  'Hospitality',
  'Consulting',
  'Real Estate',
  'Financial',
  'Fitness',
  'Education',
] as const;

interface TemplateCard {
  readonly name: string;
  readonly industry: string;
  readonly steps: number;
  readonly description: string;
  readonly questions: readonly string[];
}

const TEMPLATES: readonly TemplateCard[] = [
  {
    name: 'Home Services Qualifier',
    industry: 'Home Services',
    steps: 4,
    description: 'Qualify homeowners by service type, timeline, property size, and budget range.',
    questions: [
      'What type of service do you need?',
      'When do you need this done?',
      'What size is your property?',
      'What is your budget range?',
    ],
  },
  {
    name: 'Legal Consultation',
    industry: 'Legal',
    steps: 3,
    description: 'Pre-qualify potential clients by case type, urgency, and preferred consultation format.',
    questions: [
      'What type of legal matter?',
      'How urgent is this?',
      'How would you prefer to consult?',
    ],
  },
  {
    name: 'Medical Practice Intake',
    industry: 'Medical',
    steps: 4,
    description: 'Screen new patients by service needed, insurance status, patient type, and scheduling preference.',
    questions: [
      'What service are you interested in?',
      'Do you have insurance?',
      'Are you a new or existing patient?',
      'When are you available?',
    ],
  },
  {
    name: 'Marketing Agency Lead',
    industry: 'Agency',
    steps: 4,
    description: 'Qualify prospects by service interest, monthly budget, timeline, and company size.',
    questions: [
      'What services are you looking for?',
      'What is your monthly budget?',
      'When do you want to start?',
      'How large is your company?',
    ],
  },
  {
    name: 'Real Estate Inquiry',
    industry: 'Real Estate',
    steps: 4,
    description: 'Qualify buyers and sellers by transaction type, property type, price range, and timeline.',
    questions: [
      'Are you looking to buy or sell?',
      'What type of property?',
      'What is your price range?',
      'What is your timeline?',
    ],
  },
  {
    name: 'Business Consulting',
    industry: 'Consulting',
    steps: 3,
    description: 'Pre-qualify consulting leads by area of need, company size, and engagement type.',
    questions: [
      'What area do you need help with?',
      'How large is your company?',
      'What type of engagement are you looking for?',
    ],
  },
  {
    name: 'Hotel Booking Qualifier',
    industry: 'Hospitality',
    steps: 4,
    description: 'Screen potential guests by stay type, group size, date range, and room preference.',
    questions: [
      'What is the purpose of your stay?',
      'How many guests?',
      'When are you looking to stay?',
      'What room type do you prefer?',
    ],
  },
  {
    name: 'Financial Advisory',
    industry: 'Financial',
    steps: 4,
    description: 'Qualify financial leads by service type, portfolio size, timeline, and goals.',
    questions: [
      'What financial service do you need?',
      'What is your investable portfolio size?',
      'What is your investment timeline?',
      'What are your primary goals?',
    ],
  },
  {
    name: 'Fitness Studio Lead',
    industry: 'Fitness',
    steps: 3,
    description: 'Qualify prospective members by goals, experience level, and membership preference.',
    questions: [
      'What are your fitness goals?',
      'What is your experience level?',
      'What membership type interests you?',
    ],
  },
  {
    name: 'Education Enrollment',
    industry: 'Education',
    steps: 4,
    description: 'Screen prospective students by program interest, timeline, funding, and level.',
    questions: [
      'What program are you interested in?',
      'When would you like to start?',
      'How will you fund your education?',
      'What is your current education level?',
    ],
  },
] as const;

export default function TemplatesPage(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredTemplates =
    activeFilter === 'All'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.industry === activeFilter);

  return (
    <div>
      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-5xl font-semibold text-ink">
            Flow templates.
          </h1>
          <p className="mt-4 text-lg text-stone max-w-prose">
            Pre-built qualifying flows for common industries. Pick one, customize the
            questions and score weights, and deploy in minutes.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-6 px-6">
        <div className="max-w-content mx-auto">
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => setActiveFilter(industry)}
                className={`px-3 py-1.5 rounded-sm text-sm font-body transition-colors duration-fast ${
                  activeFilter === industry
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-border text-stone hover:text-ink hover:border-border-dark'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Template Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-content mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-stone font-body">
                No templates found for this industry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.name} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-ink">
                        {template.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-stone-light font-body">
                          {template.industry}
                        </span>
                        <span className="text-xs text-border">|</span>
                        <span className="text-xs text-stone-light font-body">
                          {template.steps} steps
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone">{template.description}</p>
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-stone uppercase tracking-wide mb-2">
                      Questions
                    </h4>
                    <ol className="space-y-1.5">
                      {template.questions.map((q, i) => (
                        <li key={q} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-xs text-stone-light mt-0.5 w-4 flex-shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-stone">{q}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border">
                    <Link href="/signup" className="btn-secondary text-sm">
                      Use This Template
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-20 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="font-display text-4xl font-semibold text-white">
            Pick a template and go live in 5 minutes.
          </h2>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper"
            >
              Start Free Trial
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-light">
            14 days free. No credit card. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
