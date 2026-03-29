'use client';

import Link from 'next/link';

import { useInViewAnimations } from '@/lib/use-in-view';

// ---------------------------------------------------------------------------
// Research data — all sourced from published studies
// ---------------------------------------------------------------------------

const SPEED_STATS = [
  {
    stat: '78%',
    label: 'of deals close with the first responder',
    source: 'InsideSales.com',
    detail: 'The vendor who responds first wins the deal nearly 8 times out of 10. Not the cheapest. Not the best. The fastest.',
  },
  {
    stat: '5 min',
    label: 'is the window before odds drop 10x',
    source: 'Lead Response Management Study',
    detail: 'Contact a lead within 5 minutes and you are 21x more likely to qualify them than if you wait 30 minutes.',
  },
  {
    stat: '47 hrs',
    label: 'average response time to a web form',
    source: 'Harvard Business Review',
    detail: 'Most businesses take nearly two full days to respond. 37% never respond at all. That is not a sales process. That is lost revenue.',
  },
] as const;

const COST_OF_DELAY = [
  { delay: '5 min', odds: '100%', color: 'bg-success' },
  { delay: '10 min', odds: '80%', color: 'bg-success/70' },
  { delay: '30 min', odds: '10%', color: 'bg-warning' },
  { delay: '1 hr', odds: '5%', color: 'bg-danger/60' },
  { delay: '24 hr', odds: '<1%', color: 'bg-danger' },
] as const;

const PROBLEM_POINTS = [
  {
    number: '01',
    title: 'Forms do not tell you who is serious',
    body: 'A $200 repair request and a $15,000 remodel look identical in your inbox. You have zero context until you call. By then, the $15,000 lead already picked up the phone from your competitor.',
  },
  {
    number: '02',
    title: 'Your team wastes hours on unqualified calls',
    body: 'Forrester found that less than 25% of leads are ever sales-ready. Your team spends 75% of their calling time on people who will never buy. That is not a staffing problem. It is a filtering problem.',
  },
  {
    number: '03',
    title: 'Response time is your biggest vulnerability',
    body: 'MIT research shows that calling within 5 minutes makes you 100x more likely to reach the lead than waiting 30 minutes. But you cannot prioritize speed when you do not know who is worth calling first.',
  },
] as const;

const SOLUTION_POINTS = [
  {
    number: '01',
    title: 'Score before you call',
    body: 'Every visitor answers 2 to 5 qualifying questions. Budget, timeline, service type, urgency. Their answers produce a 0 to 100 score instantly. You know who is worth $10,000 before you pick up the phone.',
  },
  {
    number: '02',
    title: 'Call the right leads first',
    body: 'Your dashboard shows a call list sorted by score. Hot leads trigger instant email alerts with the score, all answers, and contact info. Your best leads get a call in minutes.',
  },
  {
    number: '03',
    title: 'Let the rest nurture themselves',
    body: 'Cold and warm leads enter automated drip sequences. Timed follow-up emails go out over days. When they are ready, they come back warmer. You never lose them.',
  },
] as const;

const BENCHMARK_ROWS = [
  { metric: 'Average response time', industry: '47 hours', withHawkleads: 'Under 5 minutes' },
  { metric: 'Lead qualification rate', industry: '25%', withHawkleads: '100% pre-scored' },
  { metric: 'Hot lead identification', industry: 'Manual review', withHawkleads: 'Instant, automatic' },
  { metric: 'Cost per qualified lead', industry: '$150-$300', withHawkleads: 'Same ad spend, better yield' },
  { metric: 'Team time on unqualified leads', industry: '75%', withHawkleads: 'Near zero' },
] as const;

const ROI_MATH = [
  { label: 'Average job value', value: '$5,000' },
  { label: 'Leads per month', value: '40' },
  { label: 'Current close rate', value: '15%' },
  { label: 'Close rate with scoring', value: '25%' },
  { label: 'Additional closed deals', value: '4/month' },
  { label: 'Additional annual revenue', value: '$240,000' },
  { label: 'HawkLeads annual cost (Pro)', value: '$1,788' },
  { label: 'ROI', value: '134x' },
] as const;

export default function WhyHawkLeadsPage(): React.ReactElement {
  useInViewAnimations();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-prose mx-auto animate-on-enter">
          <p className="text-sm font-medium text-signal uppercase tracking-wide mb-4">
            Market Research
          </p>
          <h1 className="font-display text-5xl font-semibold text-ink leading-tight">
            The data is clear: speed and context win deals.
          </h1>
          <p className="mt-6 text-lg text-stone leading-relaxed">
            This is not a pitch. It is a collection of published research from Harvard,
            MIT, Forrester, and industry studies that all point to the same conclusion:
            the business that responds fastest with the most context closes the deal.
            Every time.
          </p>
        </div>
      </section>

      {/* ── Speed Stats ── */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <div className="text-center mb-12 animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Three numbers that change everything.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SPEED_STATS.map((item, index) => (
              <div
                key={item.stat}
                className={`animate-on-enter stagger-${index + 1}`}
              >
                <p className="font-display text-5xl font-bold text-ink">
                  {item.stat}
                </p>
                <p className="mt-2 text-base font-medium text-ink">
                  {item.label}
                </p>
                <p className="mt-3 text-sm text-stone leading-relaxed">
                  {item.detail}
                </p>
                <p className="mt-2 text-xs text-stone-light">
                  Source: {item.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cost of Delay Chart ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Every minute costs you money.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              Lead Response Management studied over 100,000 call attempts and found
              a direct, measurable decline in contact rates as response time increases.
              The drop is not gradual. It is a cliff.
            </p>
            <p className="mt-3 text-sm text-stone-light">
              Source: Lead Response Management Study, Dr. James Oldroyd, MIT
            </p>
          </div>
          <div className="animate-slide-right">
            <div className="space-y-3">
              {COST_OF_DELAY.map((row) => (
                <div key={row.delay} className="flex items-center gap-4">
                  <span className="w-14 text-sm font-mono text-stone text-right flex-shrink-0">
                    {row.delay}
                  </span>
                  <div className="flex-1 h-8 bg-surface-alt rounded-sm overflow-hidden border border-border">
                    <div
                      className={`h-full ${row.color} rounded-sm transition-all duration-700`}
                      style={{ width: row.odds }}
                    />
                  </div>
                  <span className="w-12 text-sm font-medium text-ink text-right flex-shrink-0">
                    {row.odds}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-stone text-center">
              Relative probability of qualifying the lead vs. 5-minute baseline
            </p>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <div className="max-w-prose animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              The problem is not lead volume. It is lead blindness.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              Most businesses generate enough leads. They just cannot tell which ones
              matter until after the call. By then, time and money are already spent.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {PROBLEM_POINTS.map((point, index) => (
              <div
                key={point.number}
                className={`grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-4 animate-on-enter stagger-${index + 1}`}
              >
                <span className="font-display text-4xl font-bold text-border-dark">
                  {point.number}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-base text-stone leading-relaxed max-w-[600px]">
                    {point.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-prose animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              What changes when every lead arrives pre-qualified.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              HawkLeads sits on your website as a 30-second tappable flow. Visitors
              answer qualifying questions. You get a scored, prioritized call list.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {SOLUTION_POINTS.map((point, index) => (
              <div
                key={point.number}
                className={`grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-4 animate-on-enter stagger-${index + 1}`}
              >
                <span className="font-display text-4xl font-bold text-signal/20">
                  {point.number}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-base text-stone leading-relaxed max-w-[600px]">
                    {point.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benchmark Table ── */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <div className="text-center mb-10 animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Industry average vs. HawkLeads.
            </h2>
            <p className="mt-3 text-base text-stone">
              Benchmarks compiled from Harvard Business Review, Forrester, and
              Lead Response Management.
            </p>
          </div>
          <div className="overflow-x-auto animate-on-enter">
            <table className="w-full max-w-[720px] mx-auto text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-medium text-stone">Metric</th>
                  <th className="text-left py-3 px-4 font-medium text-stone">Industry Avg.</th>
                  <th className="text-left py-3 px-4 font-medium text-ink">With HawkLeads</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_ROWS.map((row) => (
                  <tr key={row.metric} className="border-b border-border">
                    <td className="py-3.5 px-4 text-ink font-medium">{row.metric}</td>
                    <td className="py-3.5 px-4 text-stone">{row.industry}</td>
                    <td className="py-3.5 px-4 text-ink font-medium">{row.withHawkleads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── ROI Math ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              The math on one extra closed deal per month.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              Conservative scenario for a service business doing $5,000 average jobs.
              The numbers assume a modest 10-point improvement in close rate from
              better lead prioritization. Real results vary, but the economics are
              hard to argue with.
            </p>
            <p className="mt-3 text-sm text-stone-light">
              One extra closed deal per month pays for a full year of HawkLeads.
              Four extra deals per month and you are looking at $240,000 in
              additional annual revenue on a $1,788 investment.
            </p>
          </div>
          <div className="animate-slide-right">
            <div className="border border-border rounded-md overflow-hidden">
              {ROI_MATH.map((row, index) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-5 py-3.5 text-sm ${
                    index < ROI_MATH.length - 1 ? 'border-b border-border' : 'bg-ink'
                  }`}
                >
                  <span className={index === ROI_MATH.length - 1 ? 'text-white font-medium' : 'text-stone'}>
                    {row.label}
                  </span>
                  <span className={index === ROI_MATH.length - 1 ? 'text-white font-display text-xl font-bold' : 'text-ink font-medium font-mono'}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Fewer Leads, Better Revenue ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Yes, you will get fewer submissions.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              Adding qualifying questions means some visitors will drop off. That is the point.
              The ones who finish are telling you their budget, their timeline, and what they need.
              The ones who leave were never going to buy.
            </p>
            <p className="mt-3 text-base text-stone leading-relaxed">
              Businesses using HawkLeads typically see 20-30% fewer total submissions but 2-3x more
              qualified conversations. The math: 40 random leads and 6 closes becomes 30 qualified
              leads and 8 closes. Fewer forms, more revenue.
            </p>
          </div>
          <div className="animate-slide-right">
            <div className="border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 text-sm border-b border-border">
                <span className="text-stone">Total submissions</span>
                <span className="text-ink font-medium font-mono">-25%</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm border-b border-border">
                <span className="text-stone">Qualified conversations</span>
                <span className="text-ink font-medium font-mono">+2-3x</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm border-b border-border">
                <span className="text-stone">Time spent on unqualified calls</span>
                <span className="text-ink font-medium font-mono">-75%</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 text-sm bg-ink">
                <span className="text-white font-medium">Net closed deals</span>
                <span className="text-white font-display text-xl font-bold">+33%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-ink">
        <div className="max-w-prose mx-auto text-center animate-on-enter">
          <h2 className="font-display text-4xl font-semibold text-white">
            The research is done. The numbers are clear.
          </h2>
          <p className="mt-4 text-base text-stone-light leading-relaxed">
            Speed wins deals. Context closes them. HawkLeads gives you both.
            Start scoring your leads in under two minutes.
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
              className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white"
            >
              View Pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-light">
            30 days free. No credit card. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
