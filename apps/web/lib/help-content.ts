/**
 * Centralized help tooltip and page guide content.
 * Keyed by page, then by field. Plain language for non-technical users.
 */

export const HELP_TIPS = {
  flowBuilder: {
    pageGuide:
      'The Flow Builder sets up the qualifying questions visitors answer before the contact form. Their answers determine the lead score.',
    scoreWeight:
      'How much this answer affects the lead score. Positive = hotter lead. Negative = colder. Range: -50 to +50.',
    description:
      'Optional text shown below the question in the widget. Use it to add context or instructions.',
    options:
      'Visitors pick one of these. Each option has a label they see and a score weight that affects lead scoring.',
  },
  abTests: {
    pageGuide:
      'A/B tests let you compare two versions of a flow step. Half your visitors see the original, half see the variant. After enough data, you pick the winner.',
    targetStepId:
      'The ID of the flow step to test (e.g. step_1). Find IDs in the Flow Builder.',
    trafficSplit:
      'Percentage of visitors who see Variant A (your original). The rest see Variant B. 50% = half see each.',
    variantBQuestion:
      'The alternative question wording visitors in the B group will see instead of the original.',
    variantBOptions:
      'Answer choices for Variant B, one per line. These replace the original options for visitors in the B group.',
  },
  abTestResults: {
    significance:
      'Statistical significance means the difference in conversion rates is unlikely due to random chance. Needs at least 100 impressions per variant.',
    variantControl:
      'Variant A is your original flow step. This is the baseline to compare against.',
    variantTest:
      'Variant B is the alternative you are testing. Compare its conversion rate to Variant A.',
    impressions:
      'Number of times this variant was shown to visitors.',
    conversionRate:
      'Percentage of visitors who submitted the form after seeing this variant.',
  },
  design: {
    socialProof:
      'Shows text like "Join 50+ others" in the widget. Builds trust with new visitors.',
    socialProofText:
      'The message shown to visitors. Use {count} as a placeholder for the number of submissions.',
    socialProofMin:
      'Social proof is hidden until this many submissions are reached. Avoids showing low numbers.',
    triggerType:
      'Button: floating button in the corner. Tab: vertical tab on the screen edge.',
    triggerOffsetX:
      'Horizontal distance from the edge of the screen in pixels.',
    triggerOffsetY:
      'Vertical distance from the bottom of the screen in pixels.',
    showBranding:
      'Shows "Powered by HawkLeads" at the bottom of the widget. Pro and Agency plans can remove it.',
    confirmationMessages:
      'Message shown after submission. Customize per lead tier so hot leads get a different response than cold.',
    confirmationHot:
      'Shown to visitors who score above the hot threshold. Use this for your highest-intent leads.',
    confirmationWarm:
      'Shown to visitors who score between warm and hot thresholds.',
    confirmationCold:
      'Shown to visitors who score below the warm threshold.',
  },
  sequences: {
    pageGuide:
      'Drip sequences send a series of timed emails to leads after they submit. Warm and cold leads can get different sequences.',
    targetTier:
      'Which leads get this sequence. Warm = between warm and hot thresholds. Cold = below warm threshold.',
    delay:
      'Hours to wait before sending. First step counts from submission time. Later steps count from the previous email.',
    variables:
      'Use these placeholders in your subject and body. They get replaced with the actual lead data when sending.',
  },
  embed: {
    widgetKey:
      'A public identifier for your widget. Not a secret. Safe to put in your website HTML.',
  },
  scoring: {
    pageGuide:
      'Lead scores combine three signals: form answers, on-site behavior, and purchase intent. Adjust the weights to prioritize what matters most for your business. Changes apply to new submissions only.',
    dimensionWeights:
      'Weights control how the final score is calculated. For example, 60% Form / 20% Behavioral / 20% Intent means form answers have three times more influence than each behavioral signal.',
    formWeight:
      'Score from the qualifying questions in your flow. Higher weight means the answers visitors choose matter more.',
    behavioralWeight:
      'Based on pages viewed, time on site, scroll depth, and return visits. Captures engagement even before the form is filled out.',
    intentWeight:
      'Tracks visits to high-value pages like pricing or demo. Repeat visitors and pricing page views signal stronger purchase intent.',
    decay:
      'Scores naturally lose points over time when a lead goes quiet. This keeps your hottest leads at the top. Decay stops once the maximum deduction is reached.',
    decayRate:
      'Points subtracted each week with no activity. A rate of 5 means a lead loses 5 points per week of silence.',
    decayMax:
      'The cap on total decay. With a max of 30, a lead scoring 80 can only drop to 50 from decay alone.',
    highIntentPages:
      'URL paths on your site that signal buying intent. Visitors who view these pages get a higher intent score. Use path prefixes like /pricing or /demo.',
  },
  settings: {
    hotThreshold:
      'Leads scoring at or above this are labeled Hot. Your highest-priority leads.',
    warmThreshold:
      'Leads scoring at or above this (but below hot) are Warm. Below this are Cold.',
    slug:
      'A short URL-friendly name for your account. Lowercase letters, numbers, and hyphens only.',
  },
  leads: {
    score:
      '0-100 number calculated by adding up the score weights of the visitor\'s answers.',
    tier:
      'Based on lead score. Hot: above hot threshold. Warm: between warm and hot. Cold: below warm. Set thresholds in Settings.',
    status:
      'New: just submitted. Viewed: you opened it. Contacted: you reached out. Qualified: good fit. Converted: became a customer. Archived: inactive.',
  },
  dashboard: {
    avgResponseTime:
      'Average time between submission and when a team member first views the lead.',
    conversionFunnel:
      'How visitors move through the widget: open it, complete each step, then submit the contact form.',
  },
  routing: {
    pageGuide:
      'Routing rules auto-assign leads from this widget to specific team members. Rules are evaluated in priority order: the first match wins.',
    matchType:
      'Score Tier matches leads by their hot/warm/cold score. Flow Answer matches leads who picked a specific option in a specific step.',
    tier:
      'Hot: highest-intent leads above the hot threshold. Warm: between warm and hot. Cold: below warm. Set thresholds in Settings > Scoring.',
    priority:
      'When multiple rules match the same lead, the one with the highest priority wins. Use 0 for default, higher numbers for exceptions.',
    assignTo:
      'The team member who will be assigned this lead. They will see the lead in their Leads view and receive a notification.',
    stepId:
      'The ID of the flow step to match against, e.g. step_1. Find step IDs in the Flow Builder.',
    optionId:
      'The ID of the specific answer option, e.g. opt_1. Leads who picked this option on the matching step will be routed.',
  },
  widgetOverview: {
    usage:
      'Submissions received out of your plan limit. The widget stops accepting submissions at the limit until next billing cycle.',
  },
} as const;
