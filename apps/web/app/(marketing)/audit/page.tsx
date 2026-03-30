'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';

import { APP_URL } from '@/lib/constants';

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

interface AuditResult {
  id: string;
  url: string;
  domain: string;
  scores: AuditScores;
  details: AuditDetails;
}

type AuditState = 'idle' | 'loading' | 'success' | 'error';

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
  if (score >= 70) return 'Your lead capture setup is solid. A few improvements could still increase conversion.';
  if (score >= 40) return 'Your lead capture has gaps. You are likely losing qualified leads to competitors who respond faster.';
  return 'Your lead capture needs serious attention. Most visitors leave your site without converting.';
}

// ---------------------------------------------------------------------------
// Check icon (reused)
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

// ---------------------------------------------------------------------------
// Loading modal
// ---------------------------------------------------------------------------

const LOADING_STEPS = [
  'Fetching your website',
  'Checking contact pages',
  'Analyzing forms and fields',
  'Detecting qualification signals',
  'Scoring your setup',
] as const;

function LoadingModal(): React.ReactElement {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="status" aria-label="Analyzing website">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-md p-8">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 border-2 border-border border-t-ink rounded-full animate-spin" />
        </div>

        <h3 className="font-display text-lg font-semibold text-ink text-center mb-6">
          Analyzing your site
        </h3>

        {/* Step progress */}
        <div className="space-y-3">
          {LOADING_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              {index < activeStep ? (
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : index === activeStep ? (
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                </div>
              ) : (
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                </div>
              )}
              <span className={`text-sm font-body ${
                index <= activeStep ? 'text-ink' : 'text-stone-light'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confetti burst (CSS-only, for perfect scores)
// ---------------------------------------------------------------------------

const CONFETTI_PIECES = [
  { color: '#16A34A', x: -60, y: -80, rotation: 15, delay: 0 },
  { color: '#2563EB', x: 50, y: -90, rotation: -20, delay: 40 },
  { color: '#CA8A04', x: 80, y: -40, rotation: 45, delay: 80 },
  { color: '#16A34A', x: 70, y: 50, rotation: -35, delay: 120 },
  { color: '#2563EB', x: -30, y: 70, rotation: 60, delay: 60 },
  { color: '#CA8A04', x: -80, y: 20, rotation: -50, delay: 100 },
  { color: '#0F172A', x: 20, y: -100, rotation: 30, delay: 20 },
  { color: '#0F172A', x: -50, y: -50, rotation: -10, delay: 140 },
  { color: '#16A34A', x: 90, y: 10, rotation: 75, delay: 50 },
  { color: '#2563EB', x: -70, y: 60, rotation: -65, delay: 90 },
  { color: '#CA8A04', x: 40, y: 80, rotation: 40, delay: 110 },
  { color: '#16A34A', x: -90, y: -30, rotation: -25, delay: 70 },
] as const;

function ConfettiBurst(): React.ReactElement {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CONFETTI_PIECES.map((piece, i) => (
        <div
          key={i}
          className="audit-confetti-piece"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 8,
            height: 8,
            borderRadius: i % 3 === 0 ? '50%' : '1px',
            backgroundColor: piece.color,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            ['--confetti-x' as string]: `${String(piece.x)}px`,
            ['--confetti-y' as string]: `${String(piece.y)}px`,
            ['--confetti-r' as string]: `${String(piece.rotation)}deg`,
            animationDelay: `${String(piece.delay)}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score ring (SVG circle)
// ---------------------------------------------------------------------------

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold" style={{ color }}>{score}</span>
        <span className="text-xs text-stone font-body">/100</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score breakdown line item
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Score breakdown generators
// ---------------------------------------------------------------------------

function getQualificationBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];
  items.push({ pass: details.formCount > 0, label: details.formCount > 0 ? `${String(details.formCount)} form(s) detected` : 'No forms found' });
  items.push({ pass: details.inputCount >= 4, label: details.inputCount >= 4 ? `${String(details.inputCount)} input fields (good depth)` : `Only ${String(details.inputCount)} input field(s) (too few for qualification)` });
  items.push({ pass: details.hasSelect, label: details.hasSelect ? 'Dropdown menus for structured answers' : 'No dropdown menus for structured answers' });
  items.push({ pass: details.hasRadio, label: details.hasRadio ? 'Radio buttons for multi-choice questions' : 'No radio buttons for multi-choice questions' });

  const kwCount = details.qualificationKeywordsFound.length;
  if (kwCount >= 3) {
    items.push({ pass: true, label: `${String(kwCount)} qualification keywords: ${details.qualificationKeywordsFound.slice(0, 4).join(', ')}` });
  } else if (kwCount > 0) {
    items.push({ pass: false, label: `Only ${String(kwCount)} qualification keyword(s): ${details.qualificationKeywordsFound.join(', ')}` });
  } else {
    items.push({ pass: false, label: 'No qualification keywords (budget, timeline, service type, etc.)' });
  }

  return items;
}

function getSpeedBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];

  if (details.hasFormHandler) {
    items.push({ pass: true, label: 'Form submits to a server handler' });
  } else if (details.hasMailtoAction) {
    items.push({ pass: false, label: 'Form uses mailto: (opens email client instead of capturing)' });
  } else if (details.formCount > 0) {
    items.push({ pass: false, label: 'Form exists but no clear submission handler detected' });
  } else {
    items.push({ pass: false, label: 'No form found for electronic lead capture' });
  }

  items.push({ pass: details.formCount > 0, label: details.formCount > 0 ? 'Electronic lead capture available' : 'No electronic lead capture' });

  if (details.hasPhoneLink && details.formCount === 0) {
    items.push({ pass: false, label: 'Relies on phone calls only (visitors who prefer writing will leave)' });
  } else if (details.hasPhoneLink) {
    items.push({ pass: true, label: 'Phone option available alongside form' });
  } else {
    items.push({ pass: true, label: 'No phone-only dependency' });
  }

  items.push({ pass: details.inputCount >= 3, label: details.inputCount >= 3 ? `${String(details.inputCount)} fields capture structured data` : 'Too few fields for structured data capture' });

  return items;
}

function getRoutingBreakdown(details: AuditDetails): BreakdownItemProps[] {
  const items: BreakdownItemProps[] = [];
  items.push({ pass: details.hasSelect, label: details.hasSelect ? 'Dropdowns enable automatic segmentation' : 'No dropdowns for automatic segmentation' });
  items.push({ pass: details.hasRadio, label: details.hasRadio ? 'Multi-choice inputs enable categorization' : 'No multi-choice inputs for categorization' });

  const routingKeywords = details.qualificationKeywordsFound.filter(
    (k) => k === 'budget' || k === 'timeline' || k === 'service type' || k === 'industry'
  );
  items.push({ pass: routingKeywords.length >= 2, label: routingKeywords.length >= 2 ? `Routing signals found: ${routingKeywords.join(', ')}` : 'Missing routing signals (budget, timeline, service type)' });
  items.push({ pass: details.formCount >= 2, label: details.formCount >= 2 ? `${String(details.formCount)} forms suggest segment-specific capture` : 'Single form serves all visitor types equally' });

  return items;
}

// ---------------------------------------------------------------------------
// Score category card (with detailed breakdown)
// ---------------------------------------------------------------------------

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
        <span
          className="text-xs font-medium font-body px-2 py-0.5 rounded-pill"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {tierLabel}
        </span>
      </div>
      <div className="flex items-end gap-1 mb-3">
        <span className="font-display text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-sm text-stone font-body mb-1">/100</span>
      </div>
      <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${String(score)}%`, backgroundColor: color }}
        />
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
// Before / After comparison (matches landing page pattern)
// ---------------------------------------------------------------------------

function BeforeAfterSection({ details }: { readonly details: AuditDetails }): React.ReactElement {
  const hasQualification = details.qualificationKeywordsFound.length > 0;
  const hasStructured = details.hasSelect || details.hasRadio;
  const hasHandler = details.hasFormHandler;
  const hasForm = details.formCount > 0;

  return (
    <section className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink text-center">
          Before and after.
        </h2>
        <p className="mt-3 text-base text-stone text-center">
          What changes when you add HawkLeads to your site.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before card */}
          <div className="card">
            <h3 className="font-body text-base font-semibold text-stone mb-4">Your current setup</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                {hasForm
                  ? `${String(details.formCount)} form(s) with ${String(details.inputCount)} fields`
                  : 'No contact forms found'}
              </li>
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                {hasQualification
                  ? `${String(details.qualificationKeywordsFound.length)} qualification signal(s)`
                  : 'No qualification questions'}
              </li>
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                {hasStructured ? 'Some structured inputs' : 'No dropdowns or multi-choice'}
              </li>
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                {hasHandler ? 'Form handler detected' : 'No proper form handler'}
              </li>
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                No lead scoring or prioritization
              </li>
              <li className="flex items-start gap-2 text-sm text-stone">
                <MinusIcon />
                Manual routing to team members
              </li>
            </ul>
          </div>

          {/* After card */}
          <div className="card border-signal border-2">
            <h3 className="font-body text-base font-semibold text-ink mb-4">With HawkLeads</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Multi-step qualifying flow replaces your form
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Budget, timeline, and service type scored automatically
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Structured dropdowns feed directly into scoring
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Instant submission with real-time alerts
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Automatic 0-100 score with Hot / Warm / Cold tiers
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon />
                Auto-route leads to the right person on your team
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AuditPage(): React.ReactElement {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<AuditState>('idle');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUrl || !trimmedEmail) return;

    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, email: trimmedEmail }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Something went wrong' })) as { error?: string };
        setErrorMessage(data.error ?? `Request failed (${String(response.status)})`);
        setState('error');
        return;
      }

      const data = await response.json() as AuditResult;
      setResult(data);
      setState('success');
    } catch {
      setErrorMessage('Network error. Check your connection and try again.');
      setState('error');
    }
  }, [url, email]);

  // Scroll to results when they load
  useEffect(() => {
    if (state === 'success' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state]);

  const handleCopyLink = useCallback((): void => {
    if (!result) return;
    const shareUrl = `${APP_URL}/audit/${result.id}`;
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="font-display text-5xl font-semibold text-ink leading-tight">
              Your contact form is losing you money.
            </h1>
            <p className="mt-6 text-lg text-stone leading-relaxed max-w-[520px]">
              Enter your URL below. We will crawl your site, analyze your forms, and score
              your lead capture setup across three categories. Free, instant, no signup.
            </p>

            {/* Input form */}
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 max-w-[520px]">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yoursite.com"
                  className="input-field flex-1"
                  disabled={state === 'loading'}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field flex-1"
                  disabled={state === 'loading'}
                  required
                />
              </div>

              {/* Consent checkbox */}
              <label className="mt-4 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-sm border-border text-signal focus:ring-signal flex-shrink-0"
                  disabled={state === 'loading'}
                />
                <span className="text-xs text-stone leading-relaxed">
                  I authorize HawkLeads to crawl the publicly accessible pages of this website
                  (homepage, /contact, /contact-us, /get-in-touch, /get-started) to analyze
                  forms, input fields, and page structure. No data is modified. Results are
                  stored and emailed to the address provided. By proceeding you agree to our{' '}
                  <a href="/terms" className="text-signal hover:text-signal-hover underline" target="_blank" rel="noopener noreferrer">Terms</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-signal hover:text-signal-hover underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={state === 'loading' || url.trim().length === 0 || email.trim().length === 0 || !consent}
                className="btn-primary-lg w-full mt-4"
              >
                Get Your Score
              </button>
            </form>

            {state === 'error' && errorMessage && (
              <p className="mt-3 text-sm text-danger">{errorMessage}</p>
            )}

            <p className="mt-3 text-sm text-stone-light">
              We will send the full report to your email. No spam.
            </p>
          </div>

          {/* Right side: what we check */}
          <div className="hidden lg:block">
            <div className="card">
              <h3 className="font-body text-sm font-semibold text-ink mb-4 uppercase tracking-wide">What we analyze</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-4xl font-light text-border-dark select-none">01</span>
                    <span className="font-display text-base font-semibold text-ink">Qualification</span>
                  </div>
                  <p className="text-sm text-stone ml-12">
                    Do your forms ask about budget, timeline, service type, or company size?
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-4xl font-light text-border-dark select-none">02</span>
                    <span className="font-display text-base font-semibold text-ink">Speed</span>
                  </div>
                  <p className="text-sm text-stone ml-12">
                    Are leads captured electronically or stuck in mailto links and voicemail?
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-4xl font-light text-border-dark select-none">03</span>
                    <span className="font-display text-base font-semibold text-ink">Routing</span>
                  </div>
                  <p className="text-sm text-stone ml-12">
                    Can leads be automatically sorted and assigned to the right team member?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Loading modal ── */}
      {state === 'loading' && <LoadingModal />}

      {/* ── Stats (idle only) ── */}
      {state === 'idle' && (
        <section className="py-16 px-6 bg-surface-alt border-y border-border">
          <div className="max-w-content mx-auto">
            <h2 className="font-display text-2xl font-semibold text-ink text-center mb-10">
              Most businesses fail at lead capture. Here is why.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
              <div>
                <p className="font-display text-5xl font-bold text-ink">78%</p>
                <p className="mt-2 text-sm text-stone max-w-[240px] mx-auto">
                  of contact forms collect only name and email. No budget, no timeline, no way to prioritize.
                </p>
              </div>
              <div>
                <p className="font-display text-5xl font-bold text-ink">5 min</p>
                <p className="mt-2 text-sm text-stone max-w-[240px] mx-auto">
                  is the window to respond before a lead goes cold. Most businesses take hours or days.
                </p>
              </div>
              <div>
                <p className="font-display text-5xl font-bold text-ink">0%</p>
                <p className="mt-2 text-sm text-stone max-w-[240px] mx-auto">
                  of standard forms route leads to the right person. Every inquiry hits the same inbox.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Results ── */}
      {state === 'success' && result && (
        <>
          {/* Overall score hero */}
          <section ref={resultsRef} className="py-24 px-6 bg-ink">
            <div className="max-w-content mx-auto text-center">
              <p className="text-sm text-stone-light font-body mb-2">Lead Capture Score</p>
              <h2 className="font-display text-3xl font-semibold text-white mb-2">
                {result.domain}
              </h2>

              <div className="relative mt-8 mb-6 inline-block">
                <ScoreRing score={result.scores.overall} size={140} />
                {result.details.hasHawkLeads && <ConfettiBurst />}
              </div>

              <p className="text-base text-stone-light max-w-md mx-auto leading-relaxed">
                {getOverallVerdict(result.scores.overall, result.details.hasHawkLeads)}
              </p>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-10 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  {copied ? 'Link Copied' : 'Share Report'}
                </button>
              </div>
            </div>
          </section>

          {/* Category scores */}
          <section className="py-24 px-6">
            <div className="max-w-content mx-auto">
              <h2 className="font-display text-3xl font-semibold text-ink text-center mb-10">
                Your scores.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCategory
                  label="Qualification"
                  score={result.scores.qualification}
                  description="How well your forms identify high-value leads through budget, timeline, and service questions."
                  breakdown={getQualificationBreakdown(result.details)}
                />
                <ScoreCategory
                  label="Speed"
                  score={result.scores.speed}
                  description="How quickly leads are captured and delivered to your team for follow-up."
                  breakdown={getSpeedBreakdown(result.details)}
                />
                <ScoreCategory
                  label="Routing"
                  score={result.scores.routing}
                  description="Whether leads are automatically sorted and sent to the right team member."
                  breakdown={getRoutingBreakdown(result.details)}
                />
              </div>
            </div>
          </section>

          {/* Findings (skip for HawkLeads sites — covered in the "nailed it" section) */}
          {result.details.findings.length > 0 && !result.details.hasHawkLeads && (
            <section className="py-24 px-6 bg-surface-alt border-y border-border">
              <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-ink">
                    What we found.
                  </h2>
                  <p className="mt-3 text-base text-stone">
                    Specific issues we detected while crawling {result.domain}.
                  </p>
                </div>
                <div>
                  <ul className="space-y-4">
                    {result.details.findings.map((finding) => (
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

          {/* Stats row */}
          <section className="py-16 px-6">
            <div className="max-w-content mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
                <div>
                  <p className="font-display text-5xl font-bold text-ink">{result.details.formCount}</p>
                  <p className="mt-2 text-sm text-stone">Forms found</p>
                </div>
                <div>
                  <p className="font-display text-5xl font-bold text-ink">{result.details.inputCount}</p>
                  <p className="mt-2 text-sm text-stone">Input fields</p>
                </div>
                <div>
                  <p className="font-display text-5xl font-bold text-ink">{result.details.qualificationKeywordsFound.length}</p>
                  <p className="mt-2 text-sm text-stone">Qualification signals</p>
                </div>
                <div>
                  <p className="font-display text-5xl font-bold text-ink">{result.details.pagesChecked.length}</p>
                  <p className="mt-2 text-sm text-stone">Pages analyzed</p>
                </div>
              </div>
            </div>
          </section>

          {result.details.hasHawkLeads ? (
            <>
              {/* ── Perfect score: what you're doing right ── */}
              <section className="py-24 px-6 bg-surface-alt border-y border-border">
                <div className="max-w-content mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="font-display text-3xl font-semibold text-ink">
                        You nailed it.
                      </h2>
                      <p className="mt-4 text-base text-stone leading-relaxed max-w-[460px]">
                        Your site is running HawkLeads. Every visitor who fills out your widget is
                        being qualified, scored, and routed to the right person on your team. That
                        puts you ahead of 95% of businesses we audit.
                      </p>
                      <p className="mt-3 text-sm text-ink font-medium">
                        There is nothing to fix. Keep closing deals.
                      </p>
                    </div>
                    <div className="card border-signal border-2">
                      <h3 className="font-body text-base font-semibold text-ink mb-4">What you are doing right</h3>
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
                          Structured data feeds directly into your pipeline
                        </li>
                        <li className="flex items-start gap-2 text-sm text-ink">
                          <CheckIcon />
                          Real-time alerts so your team responds in minutes, not hours
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

              {/* ── Share CTA ── */}
              <section className="bg-ink py-24 px-6">
                <div className="max-w-content mx-auto text-center">
                  <h2 className="font-display text-4xl font-semibold text-white">
                    Know someone still using a basic contact form?
                  </h2>
                  <p className="mt-4 text-base text-stone-light leading-relaxed max-w-md mx-auto">
                    Share this audit tool with them. It takes 10 seconds and they will see exactly
                    what they are missing.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                    >
                      {copied ? 'Link Copied' : 'Share This Report'}
                    </button>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Before / After */}
              <BeforeAfterSection details={result.details} />

              {/* Final CTA */}
              <section className="bg-ink py-24 px-6">
                <div className="max-w-content mx-auto text-center">
                  <h2 className="font-display text-4xl font-semibold text-white">
                    Fix this in 2 minutes.
                  </h2>
                  <p className="mt-4 text-base text-stone-light leading-relaxed max-w-md mx-auto">
                    Add a HawkLeads widget to your site. Qualify, score, and route every lead
                    automatically. No code changes. 30-day free trial.
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
        </>
      )}
    </div>
  );
}
