export const STATS = [
  { number: '42%', body: 'of sales reps say lead quality is their top problem. (Gleanster)' },
  { number: '5min', body: 'to reach a lead before your odds drop 10x. (Harvard Business Review)' },
  { number: '75%', body: 'of inbound leads are not sales-ready. Score before you call. (Gleanster)' },
] as const;

export const STEPS = [
  {
    num: '01',
    title: 'Build your flow',
    body: 'Pick an industry template or start blank. Add 2 to 5 qualifying questions. Assign score weights. Two minutes.',
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
    title: 'Ask. Watch. Score.',
    body: 'Every lead scored 0 to 100 across two signals: what they told you and what they did on your site. You control the weights. You see the math.',
  },
  {
    title: 'Your phone rings before theirs.',
    body: 'Hot leads trigger an email within seconds. You call while they are still on your website. Not tomorrow. Now.',
  },
  {
    title: 'See where you are losing them.',
    body: 'Funnel visualization shows exactly which step visitors bail on. Fix the question, recover the leads.',
  },
  {
    title: 'It looks like your site, not ours.',
    body: 'Your colors, your fonts, your button styles. Visitors never know it is a third-party tool. Remove our name on paid plans.',
  },
  {
    title: 'The right person gets the right lead.',
    body: 'Hot leads go to your closer. Cold leads go to your admin. Routed automatically by score or answers. No manual sorting.',
  },
  {
    title: 'Stop guessing which question works.',
    body: 'Test two versions of a question. See which wording gets more qualified submissions. Data picks the winner.',
  },
  {
    title: 'Cold leads warm themselves up.',
    body: 'Timed follow-up emails go out automatically. Three touchpoints over a week. Leads that convert are paused.',
  },
  {
    title: 'Your CRM updates itself.',
    body: 'Webhook fires on every submission. Works with Zapier, Make, Salesforce, HubSpot, or any HTTP endpoint. Full delivery log.',
  },
  {
    title: 'Show clients the proof.',
    body: 'Generate a read-only dashboard link per client. Submissions, scores, tier breakdowns. Real time. No login needed.',
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
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'One widget. 10 leads/month.',
    bestFor: 'Best for trying it out. Free forever.',
    features: [
      'Lead scoring (form answers)',
      'Email alerts',
      '1 widget, 1 team member',
    ],
    highlighted: false,
  },
  {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 82,
    description: 'One widget. 500 submissions/month.',
    bestFor: 'Best for single-location businesses.',
    features: [
      'Everything in Free',
      'Webhook integrations',
      'Basic analytics',
      '3 team members',
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

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'How do I install it?',
    answer:
      'Two lines of JavaScript. Copy them from your dashboard and paste into your site header. Works with WordPress, Shopify, Squarespace, Wix, Webflow, and plain HTML. No developer needed. Most customers are live in under 2 minutes.',
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
    question: 'How is the score calculated?',
    answer:
      'You assign a weight (0 to 100) to each answer option in your flow. When a visitor completes the widget, their answer weights are summed and normalized to a 0 to 100 scale. You set the thresholds for hot, warm, and cold tiers. A visitor who picks "budget over $10k" and "timeline this week" will score higher than one who picks "just browsing." You control the math entirely.',
  },
  {
    question: 'Will adding steps to my form reduce submissions?',
    answer:
      'Yes, intentionally. You will get fewer submissions, but every single one comes pre-qualified with budget, timeline, and service details. Businesses using HawkLeads typically see 20-30% fewer total submissions but 2-3x more qualified conversations. The math works: 40 random leads and 6 closes becomes 30 qualified leads and 8 closes. Fewer forms, more revenue.',
  },
] as const;

export const TRUST_METRICS = [
  { number: '2 min', label: 'Average setup time' },
  { number: '<25KB', label: 'Widget bundle size' },
  { number: '99.9%', label: 'API uptime' },
  { number: '0', label: 'Third-party trackers' },
] as const;

export const TRUST_GUARANTEES = [
  'No credit card to start',
  'Cancel anytime, no penalty',
  'Your data deleted on request',
  'HTTPS everywhere',
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

export const INDUSTRIES = [
  'Plumbing',
  'Roofing',
  'Electricians',
  'HVAC',
  'Landscaping',
  'Pest Control',
  'Solar',
  'Law Firms',
  'Real Estate',
  'Insurance',
  'Marketing Agencies',
  'Med Spas',
  'Dental',
  'Auto Body',
  'Financial Advisors',
  'Home Remodeling',
  'Cleaning Services',
  'Photography',
  'Architecture',
  'Accounting',
] as const;

export const BEFORE_ITEMS = [
  'Every lead looks the same in your inbox',
  'Your team wastes hours calling tire-kickers',
  'Your first words: "Hi, thanks for reaching out, what can I help you with?"',
] as const;

export const AFTER_ITEMS = [
  'Budget, timeline, and intent scored before you dial',
  'Your team calls the $10k jobs first, every time',
  'Your first words: "Hi Sarah, saw you need emergency plumbing this week and your budget is $5-10k. I have availability tomorrow morning."',
] as const;
