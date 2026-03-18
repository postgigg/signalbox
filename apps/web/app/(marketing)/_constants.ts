export const STATS = [
  { number: '78%', body: 'of deals go to whoever responds first.' },
  { number: '47hrs', body: 'average response time to a form submission.' },
  { number: '27%', body: 'of inbound leads are ever contacted.' },
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
    bestFor: 'Best for solo operators with one site.',
    features: [
      'Lead scoring',
      'Email alerts',
      'Basic analytics',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 149,
    annualPrice: 124,
    description: 'Five widgets. 2,000 submissions/month.',
    bestFor: 'Best for growing teams with multiple sites.',
    features: [
      'Everything in Starter',
      'Webhooks',
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
      'Pro and Agency plans include webhooks. When a lead comes in, a webhook fires to any URL you configure. Use it with your CRM, Zapier, or any tool that accepts HTTP.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No. Month-to-month. Cancel anytime from your dashboard. Annual billing saves 17%.',
  },
] as const;

export const COMPARISON_ROWS = [
  { form: 'All leads look the same', signalbox: 'Every lead scored 0 to 100' },
  { form: 'No idea who is serious', signalbox: 'Hot, warm, cold tiers instantly' },
  { form: 'Average 47-hour response time', signalbox: 'Instant alerts for hot leads' },
  { form: 'No prioritization', signalbox: 'Dashboard sorted by score' },
] as const;

export const INDUSTRY_HOOKS = [
  {
    title: 'Home Services',
    body: 'Know instantly if it is a $200 repair or a $10,000 job.',
  },
  {
    title: 'Legal',
    body: 'Prioritize urgent, high-value cases first.',
  },
  {
    title: 'Real Estate',
    body: 'Focus on buyers ready this month, not just browsing.',
  },
] as const;

export const BEFORE_ITEMS = [
  'Inbox full of random leads',
  'No idea who is serious',
  'Slow responses, lost deals',
] as const;

export const AFTER_ITEMS = [
  'Every lead scored 0 to 100',
  'Hot leads highlighted and alerted',
  'Call list ready the moment they submit',
] as const;
