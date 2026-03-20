export const STATS = [
  { number: '78%', body: 'of deals go to whoever responds first. Your competitor already knows this.' },
  { number: '47hrs', body: 'is the average response time to a web form. Every hour costs you revenue.' },
  { number: '$1.2M', body: 'in pipeline lost per year by mid-size service companies from slow follow-up.' },
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
    title: 'Lead scoring',
    body: 'You instantly know if a lead is worth calling. Every submission scored 0 to 100 based on the answers they give.',
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
      'Two lines of JavaScript. Paste them onto your site. Works with WordPress, Shopify, Squarespace, Wix, Webflow, and plain HTML. No developer needed.',
  },
  {
    question: 'Will it slow down my site?',
    answer:
      'No. The script loads asynchronously and weighs under 25KB gzipped. It does not block your page from rendering.',
  },
  {
    question: 'What happens when a lead comes in?',
    answer:
      'Answers are scored based on the weights you set. Hot leads trigger an instant email with the score and a suggested response. Everything appears in your dashboard, sorted by score.',
  },
  {
    question: 'Does it integrate with my CRM?',
    answer:
      'All plans include webhooks. When a lead comes in, a webhook fires to any URL you configure. Connect to your CRM, Zapier, Make, or any tool that accepts HTTP. Pro plans add lead routing to auto-assign leads to the right rep.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No. Month-to-month. Cancel anytime from your dashboard. Annual billing saves 17%.',
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
