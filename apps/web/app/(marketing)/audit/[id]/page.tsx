import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createAdminClient } from '@/lib/supabase/admin';

import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditScores {
  qualification: number;
  speed: number;
  routing: number;
  overall: number;
}

interface AuditDetails {
  formCount: number;
  inputCount: number;
  hasSelect: boolean;
  hasRadio: boolean;
  hasPhoneLink: boolean;
  hasMailtoAction: boolean;
  hasFormHandler: boolean;
  hasHawkLeads: boolean;
  qualificationKeywordsFound: string[];
  pagesChecked: string[];
  findings: string[];
}

interface AuditRow {
  id: string;
  url: string;
  domain: string;
  scores: AuditScores;
  details: AuditDetails;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 40) return '#CA8A04';
  return '#DC2626';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

function getOverallVerdict(score: number, hasHawkLeads: boolean): string {
  if (hasHawkLeads) return 'This site uses HawkLeads. Leads are qualified, scored, and routed automatically. Nothing to fix here.';
  if (score >= 70) return 'This site has a solid lead capture setup. A few improvements could still increase conversion.';
  if (score >= 40) return 'This site has gaps in lead capture. Qualified leads are likely being lost to competitors.';
  return 'This site needs serious attention on lead capture. Most visitors leave without converting.';
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getAudit(id: string): Promise<AuditRow | null> {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('audits')
      .select('id, url, domain, scores, details, created_at')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id as string,
      url: data.url as string,
      domain: data.domain as string,
      scores: data.scores as unknown as AuditScores,
      details: data.details as unknown as AuditDetails,
      created_at: data.created_at as string,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return { title: 'Audit Not Found | HawkLeads' };
  }

  const title = `${audit.domain} scored ${String(audit.scores.overall)}/100 on lead capture | HawkLeads`;
  const description = `Lead capture audit: Qualification ${String(audit.scores.qualification)}/100, Speed ${String(audit.scores.speed)}/100, Routing ${String(audit.scores.routing)}/100.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function CheckIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4 text-signal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MinusIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4 text-border-dark flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
}

interface ScoreRingProps {
  readonly score: number;
  readonly size?: number;
}

function ScoreRing({ score, size = 120 }: ScoreRingProps): React.ReactElement {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold" style={{ color }}>{score}</span>
        <span className="text-xs text-stone font-body">/100</span>
      </div>
    </div>
  );
}

interface BreakdownItemProps {
  readonly pass: boolean;
  readonly label: string;
}

function BreakdownItem({ pass, label }: BreakdownItemProps): React.ReactElement {
  return (
    <li className="flex items-start gap-2 text-sm">
      {pass ? (
        <svg className="w-4 h-4 text-signal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-border-dark flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={pass ? 'text-ink' : 'text-stone'}>{label}</span>
    </li>
  );
}

function getQualificationBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];
  items.push({ pass: details.formCount > 0, label: details.formCount > 0 ? `${String(details.formCount)} form(s) detected` : 'No forms found' });
  items.push({ pass: details.inputCount >= 4, label: details.inputCount >= 4 ? `${String(details.inputCount)} input fields (good depth)` : `Only ${String(details.inputCount)} input field(s)` });
  items.push({ pass: details.hasSelect, label: details.hasSelect ? 'Dropdown menus for structured answers' : 'No dropdown menus' });
  items.push({ pass: details.hasRadio, label: details.hasRadio ? 'Radio buttons for multi-choice' : 'No radio buttons' });
  const kwCount = details.qualificationKeywordsFound.length;
  if (kwCount >= 3) {
    items.push({ pass: true, label: `${String(kwCount)} qualification keywords: ${details.qualificationKeywordsFound.slice(0, 4).join(', ')}` });
  } else if (kwCount > 0) {
    items.push({ pass: false, label: `Only ${String(kwCount)} qualification keyword(s): ${details.qualificationKeywordsFound.join(', ')}` });
  } else {
    items.push({ pass: false, label: 'No qualification keywords (budget, timeline, etc.)' });
  }
  return items;
}

function getSpeedBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];
  if (details.hasFormHandler) {
    items.push({ pass: true, label: 'Form submits to a server handler' });
  } else if (details.hasMailtoAction) {
    items.push({ pass: false, label: 'Form uses mailto: (opens email client)' });
  } else if (details.formCount > 0) {
    items.push({ pass: false, label: 'Form exists but no submission handler detected' });
  } else {
    items.push({ pass: false, label: 'No form for electronic lead capture' });
  }
  items.push({ pass: details.formCount > 0, label: details.formCount > 0 ? 'Electronic lead capture available' : 'No electronic lead capture' });
  if (details.hasPhoneLink && details.formCount === 0) {
    items.push({ pass: false, label: 'Relies on phone calls only' });
  } else if (details.hasPhoneLink) {
    items.push({ pass: true, label: 'Phone option alongside form' });
  } else {
    items.push({ pass: true, label: 'No phone-only dependency' });
  }
  items.push({ pass: details.inputCount >= 3, label: details.inputCount >= 3 ? `${String(details.inputCount)} fields capture structured data` : 'Too few fields for structured data' });
  return items;
}

function getRoutingBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];
  items.push({ pass: details.hasSelect, label: details.hasSelect ? 'Dropdowns enable segmentation' : 'No dropdowns for segmentation' });
  items.push({ pass: details.hasRadio, label: details.hasRadio ? 'Multi-choice inputs enable categorization' : 'No multi-choice for categorization' });
  const routingKw = details.qualificationKeywordsFound.filter(
    (k) => k === 'budget' || k === 'timeline' || k === 'service type' || k === 'industry'
  );
  items.push({ pass: routingKw.length >= 2, label: routingKw.length >= 2 ? `Routing signals: ${routingKw.join(', ')}` : 'Missing routing signals (budget, timeline, service type)' });
  items.push({ pass: details.formCount >= 2, label: details.formCount >= 2 ? `${String(details.formCount)} forms suggest segment-specific capture` : 'Single form serves all visitor types' });
  return items;
}

interface ScoreCategoryProps {
  readonly label: string;
  readonly score: number;
  readonly description: string;
  readonly breakdown: BreakdownItemProps[];
}

function ScoreCategory({ label, score, description, breakdown }: ScoreCategoryProps): React.ReactElement {
  const color = getScoreColor(score);
  const tierLabel = getScoreLabel(score);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-semibold text-ink">{label}</h3>
        <span className="text-xs font-medium font-body px-2 py-0.5 rounded-pill" style={{ color, backgroundColor: `${color}18` }}>
          {tierLabel}
        </span>
      </div>
      <div className="flex items-end gap-1 mb-3">
        <span className="font-display text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-sm text-stone font-body mb-1">/100</span>
      </div>
      <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full" style={{ width: `${String(score)}%`, backgroundColor: color }} />
      </div>
      <p className="text-sm text-stone leading-relaxed mb-4">{description}</p>
      <div className="border-t border-border pt-4">
        <ul className="space-y-2.5">
          {breakdown.map((item) => (
            <BreakdownItem key={item.label} pass={item.pass} label={item.label} />
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function AuditResultPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    notFound();
  }

  const { scores, details, domain } = audit;
  const hasQualification = details.qualificationKeywordsFound.length > 0;
  const hasStructured = details.hasSelect || details.hasRadio;
  const hasHandler = details.hasFormHandler;
  const hasForm = details.formCount > 0;

  return (
    <div>
      {/* ── Overall score hero ── */}
      <section className="pt-32 pb-24 px-6 bg-ink">
        <div className="max-w-content mx-auto text-center">
          <p className="text-sm text-stone-light font-body mb-2">Lead Capture Audit Report</p>
          <h1 className="font-display text-4xl font-semibold text-white mb-2">{domain}</h1>

          <div className="mt-8 mb-6">
            <ScoreRing score={scores.overall} size={140} />
          </div>

          <p className="text-base text-stone-light max-w-md mx-auto leading-relaxed">
            {getOverallVerdict(scores.overall, details.hasHawkLeads)}
          </p>

          <div className="mt-6">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-10 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
            >
              Run your own audit
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category scores ── */}
      <section className="py-24 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink text-center mb-10">
            Category scores.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCategory
              label="Qualification"
              score={scores.qualification}
              description="How well forms identify high-value leads through budget, timeline, and service questions."
              breakdown={getQualificationBreakdown(details)}
            />
            <ScoreCategory
              label="Speed"
              score={scores.speed}
              description="How quickly leads are captured and delivered to the team for follow-up."
              breakdown={getSpeedBreakdown(details)}
            />
            <ScoreCategory
              label="Routing"
              score={scores.routing}
              description="Whether leads are automatically sorted and sent to the right team member."
              breakdown={getRoutingBreakdown(details)}
            />
          </div>
        </div>
      </section>

      {/* ── Findings (skip for HawkLeads sites) ── */}
      {details.findings.length > 0 && !details.hasHawkLeads && (
        <section className="py-24 px-6 bg-surface-alt border-y border-border">
          <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink">What we found.</h2>
              <p className="mt-3 text-base text-stone">
                Specific issues detected while crawling {domain}.
              </p>
            </div>
            <div>
              <ul className="space-y-4">
                {details.findings.map((finding) => (
                  <li key={finding} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-sm text-stone leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="py-16 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            <div>
              <p className="font-display text-5xl font-bold text-ink">{details.formCount}</p>
              <p className="mt-2 text-sm text-stone">Forms found</p>
            </div>
            <div>
              <p className="font-display text-5xl font-bold text-ink">{details.inputCount}</p>
              <p className="mt-2 text-sm text-stone">Input fields</p>
            </div>
            <div>
              <p className="font-display text-5xl font-bold text-ink">{details.qualificationKeywordsFound.length}</p>
              <p className="mt-2 text-sm text-stone">Qualification signals</p>
            </div>
            <div>
              <p className="font-display text-5xl font-bold text-ink">{details.pagesChecked.length}</p>
              <p className="mt-2 text-sm text-stone">Pages analyzed</p>
            </div>
          </div>
        </div>
      </section>

      {details.hasHawkLeads ? (
        <>
          {/* ── Perfect score: what they're doing right ── */}
          <section className="py-24 px-6 bg-surface-alt border-y border-border">
            <div className="max-w-content mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-ink">
                    This site nailed it.
                  </h2>
                  <p className="mt-4 text-base text-stone leading-relaxed max-w-[460px]">
                    {domain} is running HawkLeads. Every visitor who fills out their widget is
                    being qualified, scored, and routed to the right person. That puts them ahead
                    of 95% of businesses we audit.
                  </p>
                  <p className="mt-3 text-sm text-ink font-medium">
                    Nothing to fix here.
                  </p>
                </div>
                <div className="card border-signal border-2">
                  <h3 className="font-body text-base font-semibold text-ink mb-4">What they are doing right</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-ink">
                      <CheckIcon />
                      Multi-step qualifying flow captures budget, timeline, and intent
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink">
                      <CheckIcon />
                      Every lead scored 0-100 with Hot, Warm, and Cold tiers
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink">
                      <CheckIcon />
                      Structured data feeds directly into their pipeline
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink">
                      <CheckIcon />
                      Real-time alerts so their team responds in minutes, not hours
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink">
                      <CheckIcon />
                      Automatic routing sends the right lead to the right person
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA for visitors ── */}
          <section className="bg-ink py-24 px-6">
            <div className="max-w-content mx-auto text-center">
              <h2 className="font-display text-4xl font-semibold text-white">
                Want the same setup on your site?
              </h2>
              <p className="mt-4 text-base text-stone-light leading-relaxed max-w-md mx-auto">
                Run a free audit on your own website and see how your lead capture compares.
                Takes 10 seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/audit"
                  className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  Audit Your Own Site
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* ── Before / After ── */}
          <section className="py-24 px-6">
            <div className="max-w-content mx-auto">
              <h2 className="font-display text-3xl font-semibold text-ink text-center">Before and after.</h2>
              <p className="mt-3 text-base text-stone text-center">What changes with HawkLeads.</p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-body text-base font-semibold text-stone mb-4">Current setup</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-stone">
                      <MinusIcon />
                      {hasForm ? `${String(details.formCount)} form(s) with ${String(details.inputCount)} fields` : 'No contact forms found'}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone">
                      <MinusIcon />
                      {hasQualification ? `${String(details.qualificationKeywordsFound.length)} qualification signal(s)` : 'No qualification questions'}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone">
                      <MinusIcon />
                      {hasStructured ? 'Some structured inputs' : 'No dropdowns or multi-choice'}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone">
                      <MinusIcon />
                      {hasHandler ? 'Form handler detected' : 'No proper form handler'}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone"><MinusIcon />No lead scoring</li>
                    <li className="flex items-start gap-2 text-sm text-stone"><MinusIcon />Manual routing</li>
                  </ul>
                </div>

                <div className="card border-signal border-2">
                  <h3 className="font-body text-base font-semibold text-ink mb-4">With HawkLeads</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Multi-step qualifying flow</li>
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Budget, timeline, service scored automatically</li>
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Structured dropdowns feed into scoring</li>
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Instant submission with real-time alerts</li>
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Automatic 0-100 score with Hot / Warm / Cold tiers</li>
                    <li className="flex items-start gap-2 text-sm text-ink"><CheckIcon />Auto-route leads to the right person</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="bg-ink py-24 px-6">
            <div className="max-w-content mx-auto text-center">
              <h2 className="font-display text-4xl font-semibold text-white">Fix this in 2 minutes.</h2>
              <p className="mt-4 text-base text-stone-light leading-relaxed max-w-md mx-auto">
                Add a HawkLeads widget to your site. Qualify, score, and route every lead automatically. 30-day free trial.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  See pricing
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-light">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  2-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  30-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
