export const STATS = [
  { number: '78%', body: 'of deals go to whoever responds first, per InsideSales.com research. Your competitor already knows this.' },
  { number: '47hrs', body: 'is the average response time to a web form, per a Harvard Business Review study. Every hour costs you revenue.' },
  { number: '5min', body: 'is the window to reach a lead before your odds drop 10x, per Lead Response Management research.' },
] as const;

export const STEPS = [
  {
    num: '01',
    title: 'Build your flow',
    body: 'Pick an industry template or start blank. Add 2 to 5 qualifying questions. Assign score weights. Five minutes.',
  },
  {
    num: '02',
    title: 'Paste two lines',
    body: 'Copy the embed snippet onto your site. WordPress, Shopify, Webflow, plain HTML. A floating button appears.',
  },
  {
    num: '03',
    title: 'Get scored leads',
    body: 'You instantly know if a lead is worth calling. Hot leads trigger alerts. Your dashboard shows a call list sorted by score.',
  },
] as const;

export const FEATURES = [
  {
    title: 'Three-dimensional scoring',
    body: 'Every lead scored 0 to 100 across three dimensions: form answers, behavioral signals, and intent signals. Weighted, combined, and tiered as hot, warm, or cold automatically.',
  },
  {
    title: 'Instant alerts',
    body: 'Hot leads trigger an email within seconds. Score, answers, and a suggested opener. You respond in minutes, not days.',
  },
  {
    title: 'Conversion analytics',
    body: 'Funnel visualization, drop-off rates, tier breakdowns, and submission trends. See where visitors bail.',
  },
  {
    title: 'Custom branding',
    body: 'Your colors, your fonts, your button styles. The widget looks native to your site. Remove our branding on paid plans.',
  },
  {
    title: 'Lead routing',
    body: 'Auto-assign incoming leads to the right team member based on score tier or specific answers. No manual sorting.',
  },
  {
    title: 'A/B testing',
    body: 'Split test different questions and options. See which wording gets more conversions with built-in statistical significance.',
  },
  {
    title: 'Drip sequences',
    body: 'Auto-enroll warm and cold leads into timed email nurture. Three steps, spaced over days. Leads that get contacted or convert are paused automatically.',
  },
  {
    title: 'Integrations',
    body: 'Connect to any tool with webhooks. Works with Zapier, Make, and custom endpoints. Full delivery log for debugging.',
  },
  {
    title: 'Shared analytics',
    body: 'Generate password-protected, read-only analytics links for clients. They see results without accessing your dashboard.',
  },
] as const;

export interface PricingPlan {
  readonly name: string;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly description: string;
  readonly bestFor: string;
  readonly features: readonly string[];
  readonly highlighted: boolean;
}

export const PLANS: readonly PricingPlan[] = [
  {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 82,
    description: 'One widget. 500 submissions/month.',
    bestFor: 'Best for single-location businesses.',
    features: [
      'Lead scoring',
      'Email alerts',
      'Basic analytics',
      'Webhook integrations',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 149,
    annualPrice: 124,
    description: 'Five widgets. 2,000 submissions/month.',
    bestFor: 'Best for teams doing $1M+ with multiple locations.',
    features: [
      'Everything in Starter',
      'Lead routing rules',
      'A/B testing',
      'Drip email sequences',
      'Advanced analytics',
    ],
    highlighted: true,
  },
  {
    name: 'Agency',
    monthlyPrice: 249,
    annualPrice: 207,
    description: '25 widgets. Unlimited submissions.',
    bestFor: 'Best for agencies managing client accounts.',
    features: [
      'Everything in Pro',
      'Drip email sequences (10)',
      'Shared analytics links',
      'White-label branding',
      'Priority support',
    ],
    highlighted: false,
  },
] as const;

export const TEMPLATES_PREVIEW = [
  { name: 'Home Services', steps: 4, topics: 'Service type, timeline, property size, budget' },
  { name: 'Legal', steps: 3, topics: 'Case type, urgency, consultation preference' },
  { name: 'Real Estate', steps: 4, topics: 'Buy/sell, property type, price range, timeline' },
] as const;

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'How do I install it?',
    answer:
      'Two lines of JavaScript. Copy them from your dashboard and paste into your site header. Works with WordPress, Shopify, Squarespace, Wix, Webflow, and plain HTML. No developer needed. Most customers are live in under 10 minutes.',
  },
  {
    question: 'Will it slow down my site?',
    answer:
      'No. The widget script loads asynchronously and weighs under 25KB gzipped. It renders inside an isolated Shadow DOM so it cannot conflict with your existing CSS or JavaScript. It does not block page rendering, set cookies, or load third-party trackers.',
  },
  {
    question: 'What happens when a lead comes in?',
    answer:
      'Every answer is scored based on weights you configure. The total produces a 0 to 100 score and a tier: hot, warm, or cold. Hot leads trigger an instant email with the score, all their answers, and their contact info. Everything appears in your dashboard as a prioritized call list. Webhooks fire in parallel so your CRM is updated within seconds.',
  },
  {
    question: 'Does it integrate with my CRM?',
    answer:
      'All plans include webhook integrations. When a lead submits, a signed webhook fires to any URL you configure with the full payload: score, tier, answers, contact info, and UTM data. Connect to Salesforce, HubSpot, Zapier, Make, or any tool that accepts HTTP. Pro plans add lead routing rules to auto-assign leads to the right team member based on score or answers.',
  },
  {
    question: 'How is the score calculated?',
    answer:
      'You assign a weight (0 to 100) to each answer option in your flow. When a visitor completes the widget, their answer weights are summed and normalized to a 0 to 100 scale. You set the thresholds for hot, warm, and cold tiers. A visitor who picks "budget over $10k" and "timeline this week" will score higher than one who picks "just browsing." You control the math entirely.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No. All plans are month-to-month. Cancel anytime from your billing settings. When you cancel, your access continues through the end of the current billing period. Annual billing is available and saves 17%. Your data is retained for 90 days after cancellation.',
  },
  {
    question: 'What if I need more than 25 widgets?',
    answer:
      'Contact us at support@hawkleads.io for custom pricing. We can accommodate higher widget counts, custom SLAs, and dedicated support for enterprise needs.',
  },
] as const;

export const COMPARISON_ROWS = [
  { form: 'All leads look the same', hawkleads: 'Every lead scored 0 to 100' },
  { form: 'No idea who is serious', hawkleads: 'Budget, timeline, and intent before you dial' },
  { form: 'Your competitor calls first', hawkleads: 'Instant alerts. You call first.' },
  { form: '$0 insight into lead quality', hawkleads: 'Know the dollar value before you pick up' },
] as const;

export const INDUSTRY_HOOKS = [
  {
    title: 'Home Services',
    body: 'A $200 repair and a $15,000 remodel look identical in your inbox. Not anymore.',
  },
  {
    title: 'Legal',
    body: 'Your intake team spends 40% of their day on cases you will never take. Score them first.',
  },
  {
    title: 'Real Estate',
    body: 'The buyer with pre-approval and a 30-day timeline gets your call before the browser.',
  },
] as const;

export const BEFORE_ITEMS = [
  'Every lead looks the same in your inbox',
  'Your team wastes hours calling tire-kickers',
  'Your competitor responds first and wins the deal',
] as const;

export const AFTER_ITEMS = [
  'Budget, timeline, and intent scored before you dial',
  'Your team calls the $10k jobs first, every time',
  'Hot leads get a call in minutes, not days',
] as const;
