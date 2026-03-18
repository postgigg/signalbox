# SIGNALBOX — COMPLETE BUILD SPECIFICATION
# Single Document | Claude Code Ready | Zero Ambiguity
# Version 2.0 | All prior docs merged and resolved

---

## TABLE OF CONTENTS

1. Product Definition & Glossary
2. Brand Identity & Anti-AI-Slop Doctrine
3. Design System (Complete)
4. Component Library
5. Psychology Engine
6. Tech Stack & Infrastructure
7. Monorepo Structure
8. Database Schema (Complete)
9. API Routes (Complete)
10. Embeddable Widget (Full Spec)
11. Widget Visual Spec
12. Dashboard (Full Spec with Wireframes)
13. Super Admin Panel (Full Spec)
14. Landing Page (Full Copy & Layout)
15. Marketing Pages
16. Authentication & Authorization
17. Security Hardening
18. Rate Limiting & Abuse Prevention
19. Lead Scoring Engine
20. Stripe Integration
21. Email System & Templates
22. Edge Cases & Error Handling (Comprehensive)
23. Full Customization Matrix
24. Performance Budgets
25. SEO & Meta
26. Analytics & Tracking
27. Environment Variables
28. Build Order (Day-by-Day)
29. Acceptance Criteria
30. Post-MVP Roadmap

---

## 1. PRODUCT DEFINITION & GLOSSARY

### What SignalBox Is
An embeddable smart contact widget that replaces broken contact forms on business websites. It guides visitors through a 3-5 step qualifying flow with tappable options, scores each lead automatically, and delivers qualified leads to a clean business dashboard with real-time notifications.

### One-Line Pitch
"Typeform meets lead scoring, deployed as a 2-line embed, for $99/mo."

### What SignalBox Is NOT
- NOT a chatbot or conversational AI
- NOT a live chat widget
- NOT a generic form builder (no drag-and-drop, no arbitrary fields)
- NOT a CRM (no pipelines, no deal stages)
- NOT AI-powered (zero LLM calls, zero "AI" branding, zero slop)
- NOT a scheduling tool (no calendar integration in v1)

### Glossary

| Term | Definition |
|------|-----------|
| Widget | The embeddable JavaScript component that renders the qualifying flow on a client's website |
| Flow | A configured sequence of 2-5 qualifying steps/questions |
| Step | A single question in a flow with 2-6 answer options |
| Option | A single tappable answer choice within a step, with an associated score weight |
| Submission | A completed flow from a visitor, including all answers and computed lead score |
| Lead Score | Numeric value (0-100) computed from weighted option selections |
| Account | A paying SignalBox customer (the business using the widget) |
| Member | A user within an Account (owner, admin, or viewer) |
| Visitor | An anonymous person interacting with the widget on a client's website |
| Embed Code | The script tag + config a client pastes on their site |
| Hot Lead | Submission with lead score >= account-defined threshold (default 70) |
| Warm Lead | Submission with lead score 40-69 |
| Cold Lead | Submission with lead score < 40 |
| Widget Key | Public identifier for a widget (safe to expose in embed code) |
| API Key | Secret key for programmatic access (webhooks, API) |
| Flow Template | Pre-built flow configuration for common industries |

---

## 2. BRAND IDENTITY & ANTI-AI-SLOP DOCTRINE

### Name
SignalBox. One word. Capital S, capital B. Never "Signal Box" or "Signalbox" or "SIGNALBOX".

### Tagline
"Your contact page is costing you money."

Secondary taglines:
- "Stop treating every lead the same."
- "Know who's worth calling before you pick up the phone."
- "The contact form replacement that scores your leads."

### Voice & Tone
Direct. Specific. No filler. Write like a smart founder explaining their product at a bar, not a marketing team writing copy in a conference room. Every sentence should pass the test: "Would a real person actually say this out loud?"

GOOD: "78% of deals go to whoever responds first. Your contact form makes that impossible."
BAD: "Leverage our cutting-edge lead qualification platform to supercharge your pipeline."

GOOD: "You'll know their budget before you pick up the phone."
BAD: "Seamlessly harness the power of intelligent data to elevate your customer journey."

Copy rules:
- No em dashes anywhere. Use periods, commas, colons.
- No exclamation marks in body copy. One maximum in a CTA.
- No "we" when you mean the product. Say "SignalBox does X" not "We do X."
- Numbers are specific. "$47,000" not "thousands." "78%" not "most."
- No weasel words: "helps", "enables", "empowers", "allows you to." Instead: "does", "shows", "sends", "scores."
- No filler adjectives: "robust", "powerful", "innovative", "cutting-edge", "state-of-the-art."
- No buzzwords: "leverage", "synergy", "ecosystem", "holistic", "disrupt", "revolutionize."
- Never use "delve", "tapestry", "landscape", "moreover", "furthermore", "elevate", "empower", "seamless", "supercharge", "unleash", "game-changing."

### Logo
Wordmark only in v1. "SignalBox" in the display serif font (Newsreader or Instrument Serif), weight 600, tracked tight (-0.02em). No icon, no symbol, no abstract mark. The typography IS the brand.

Color: #0F172A on light backgrounds, #FAFAFA on dark backgrounds.
Minimum size: 16px font-size for digital.

### Brand Colors (Primary Palette)

```
Ink:     #0F172A    (near-black, primary text, logo, buttons)
Paper:   #FAFAFA    (near-white, page backgrounds)
Signal:  #2563EB    (blue, primary action, links, active states)
Stone:   #64748B    (gray, secondary text, borders, muted elements)
```

Four colors. Everything else is a shade of these.

### What the Brand Is NOT
- Not playful or whimsical
- Not techy or futuristic (no neon, no dark mode with cyan accents)
- Not corporate or enterprise (no stock photos of handshakes)
- Not startup-y (no purple gradients, no blob illustrations, no "powered by AI" badges)

The brand is: editorial, confident, dry, specific. Think: a well-designed invoice meets a sharp business newsletter.

### THE 25 ANTI-AI-SLOP RULES

LAYOUT:
1. No centered-everything layouts. Left-align body text. Always.
2. No symmetrical 3-column grids for features (the #1 AI slop layout). Use 2 columns, or 1 column with generous width, or asymmetric grids.
3. No full-width colored sections stacked like a PowerPoint deck. Use a single background color with content breathing inside it.
4. Sections are separated by space, not by background color changes.
5. Maximum content width: 1140px. Most body text maxes at 680px.

COLOR:
6. No purple. No purple gradients. No purple-to-blue gradients. Zero purple.
7. No gradients on buttons or backgrounds. Flat solid colors only.
8. No more than 2 hue families on any page (blue + neutral is enough).
9. Color is used for INFORMATION (status, score tier, alerts), not decoration.
10. Dark backgrounds are allowed but must be true dark (#0F172A), never gray-dark (#374151).

TYPOGRAPHY:
11. No Inter. No Roboto. No system-ui as the visible font. These are invisible.
12. Display font (headings): a real serif with character. Use: Newsreader, Instrument Serif, Lora, Source Serif 4, or Literata. Do NOT use: Playfair Display (overused), Merriweather (dated).
13. Body font: a clean, slightly warm sans-serif. Use: Instrument Sans, Plus Jakarta Sans, General Sans, Satoshi. Do NOT use: Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Space Grotesk.
14. Maximum 2 font families on the entire site. No exceptions.
15. Headings are serif. Body is sans-serif. Never the reverse. Never both serif.
16. Line height for body: 1.6. For headings: 1.1-1.2. These are not suggestions.

COMPONENTS:
17. Buttons have 2 styles only: solid fill (primary) and ghost/outline (secondary). No gradient buttons. No rounded-full pill buttons for primary actions (pills are for tags/badges only). Border-radius on buttons: 6-8px max.
18. Cards use 1px solid borders (#E2E8F0) as their primary visual container. No drop shadows on cards as default. Shadow only on hover/focus state.
19. Inputs: 1px border, 6-8px radius, 48px height. No floating labels. Labels above input, always visible. Placeholder text is hint, not label.
20. No icon-only buttons without tooltip or aria-label.

IMAGERY & DECORATION:
21. No illustrations. No abstract blob shapes. No wavy SVG dividers. No floating 3D objects. No isometric icons. No "person at laptop" drawings.
22. If you need visual interest, use: typography scale contrast, generous whitespace, a single accent line or border, or real data/screenshots.
23. No decorative gradients, glows, or blur effects on backgrounds.
24. The only acceptable background texture: a very subtle (opacity 0.02-0.04) noise grain overlay. Nothing else.

MOTION:
25. Animations are functional, not decorative. Transitions on state changes (hover, focus, open/close) at 150-200ms. No entrance animations on page load. No parallax. No scroll-triggered reveals. No bouncing elements. The page loads, the content is there. Done.

### Self-Check Before Shipping
- Could I screenshot this and post it as "AI-generated UI" and people would believe it? If yes, redesign.
- Is there purple anywhere? Remove it.
- Is there a gradient anywhere? Remove it.
- Are there 3 feature cards in a row with icons above them? Redesign.
- Does every heading use the serif font and every body text use the sans? If mixed, fix.
- Are there more than 4 colors on this page (excluding grays)? Remove some.
- Would this page look good printed in black and white? If yes, the hierarchy is working.

---

## 3. DESIGN SYSTEM (Complete)

### Colors (CSS Custom Properties)

```css
:root {
  --sb-ink:          #0F172A;
  --sb-paper:        #FAFAFA;
  --sb-signal:       #2563EB;
  --sb-signal-hover: #1D4ED8;
  --sb-signal-light: #EFF6FF;
  --sb-stone:        #64748B;
  --sb-stone-light:  #94A3B8;
  --sb-border:       #E2E8F0;
  --sb-border-dark:  #CBD5E1;
  --sb-surface:      #FFFFFF;
  --sb-surface-alt:  #F8FAFC;
  --sb-success:      #16A34A;
  --sb-success-light:#F0FDF4;
  --sb-warning:      #CA8A04;
  --sb-warning-light:#FEFCE8;
  --sb-danger:       #DC2626;
  --sb-danger-light: #FEF2F2;
  --sb-tier-hot:     #DC2626;
  --sb-tier-warm:    #CA8A04;
  --sb-tier-cold:    #94A3B8;
}
```

### Typography

```css
:root {
  --font-display: 'Newsreader', 'Instrument Serif', Georgia, 'Times New Roman', serif;
  --font-body:    'Instrument Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', ui-monospace, 'Cascadia Code', monospace;
}
```

Type scale: xs 12px, sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px, 5xl 48px, 6xl 60px.

Font usage rules (enforced):
- ALL h1-h6 and display text: var(--font-display), weight 500-700
- ALL body, labels, UI text: var(--font-body), weight 400-600
- ALL code, data, numbers in tables: var(--font-mono), weight 400
- NEVER mix: no serif in body, no sans in headings

### Spacing
Base unit: 4px. Section padding: py-16 to py-24. Card padding: p-5 to p-6. Stack gap: space-y-3 to space-y-4. Page max-width: max-w-6xl (1140px). Prose max-width: max-w-2xl (672px).

### Borders & Radius

```
--radius-sm:   6px     (inputs, small cards, buttons)
--radius-md:   8px     (cards, dropdowns)
--radius-lg:   12px    (panels, modals, widget panel)
--radius-pill:  9999px  (tags, badges, dots ONLY)
```

### Shadows

```
--shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.04)
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)
--shadow-xl:  0 25px 50px -12px rgba(0,0,0,0.12)
```

Shadow usage: Cards at rest = NO shadow, use border. Cards on hover = shadow-sm. Dropdowns = shadow-md. Modals = shadow-lg. Widget panel = shadow-xl.

### Transitions

```
--ease-default: 150ms ease
--ease-slow:    250ms ease-out
--ease-spring:  350ms cubic-bezier(0.16, 1, 0.3, 1)
```

---

## 4. COMPONENT LIBRARY

Build from scratch. No shadcn. No MUI. No Radix. No Headless UI.

### Button
Variants: primary (bg-ink text-white), secondary (bg-transparent border text-ink), danger (bg-danger text-white), ghost (bg-transparent text-stone).
Sizes: sm (h-8 px-3 text-sm), md (h-10 px-4 text-sm), lg (h-12 px-6 text-base).
States: hover (brightness), focus (ring-2 ring-signal ring-offset-2), disabled (opacity-50), loading (text invisible, CSS spinner).
Never gradient. Never rounded-full. Max 1 primary button per section.

### Input
Label above, always visible, font-body weight-500 text-sm. Input: h-12 w-full px-3, border border-border rounded-6px. Focus: border-signal ring-1. Error: border-danger with message below. No floating labels. No input icons.

### Card
bg-surface border border-border rounded-8px p-5. No shadow at rest. Shadow-sm on hover if interactive.

### Table
Full-width. Header: bg-surface-alt text-xs uppercase tracking-wide. Body rows: text-sm, border-b. Row hover: bg-surface-alt. Left-align text, right-align numbers. No zebra striping.

### Badge / Tag
Tier: Hot = bg-danger-light text-danger, Warm = bg-warning-light text-warning, Cold = bg-surface-alt text-stone. Status: New = bg-signal-light text-signal, Contacted = bg-success-light text-success. Always pill-shaped (rounded-full). This is the ONE place pills are used.

### Modal
Overlay: bg-black/40 backdrop-blur-sm. Panel: bg-surface rounded-12px shadow-lg max-w-md p-6. Focus trapped. Escape closes.

### Slide-Over Panel
Fixed right-0 top-0 h-full w-480px bg-surface border-l shadow-lg. Mobile: w-full. Enter: translateX(100%) to 0, 250ms. Click overlay or Escape closes.

### Toast
Top-right, 20px from edges. bg-surface border rounded-8px shadow-md p-4. Left color stripe by type (green/red/blue). Auto-dismiss 5s. Max 3 visible.

---

## 5. PSYCHOLOGY ENGINE

### Trigger 1: Micro-Commitment Escalation (Cialdini)
Step 1 is always easiest. Questions escalate: general to timeline to budget to contact info. NEVER ask personal info until final step. Each completed step triggers micro-animation reward.

### Trigger 2: Zeigarnik Effect
Always-visible progress bar. Smooth 300ms transition. Final step (contact info): 85-90% full, NOT 100%. 100% only on confirmation screen.

### Trigger 3: Reduced Cognitive Load (Hick's Law)
Min 2, max 6 options per step. Tappable cards only. No dropdowns, radio buttons, or checkboxes. 48px minimum tap target. Max 40 chars per option.

### Trigger 4: Variable Reward Anticipation
Confirmation screen varies by lead tier. Hot: VIP treatment. Warm: standard acknowledgment. Cold: resources offered. Visitor doesn't know their tier.

### Trigger 5: Social Proof
Optional counter: "[X] businesses qualified this month." Uses REAL numbers. If count < 10, DON'T show (low numbers = negative proof).

### Trigger 6: Reciprocity Setup
Dashboard shows all answers at a glance. Email includes answers inline. Template-based suggested opener (NOT AI-generated).

### Trigger 7: Loss Aversion
Hot lead email subject: "Hot Lead: [Name] scored [score]. Respond before they go to a competitor." 1-hour follow-up if status still "new." Response time metric with color coding: green < 1hr, yellow 1-4hr, red > 4hr.

### Trigger 8: Endowment Effect
Generous customization creates ownership. After 30 days, show value: "Your widget has qualified [X] leads worth an estimated $[Y]."

---

## 6. TECH STACK & INFRASTRUCTURE

### Stack

```
APPLICATION:     Netlify (Next.js via @netlify/plugin-nextjs)
DATABASE:        Supabase Cloud (Postgres + Auth + Realtime + RLS)
WIDGET CDN:      Cloudflare R2 + Cloudflare CDN
EMAIL:           Resend
PAYMENTS:        Stripe
RATE LIMITING:   Upstash Redis (serverless, works with Netlify Functions)
DNS/SSL:         Cloudflare (full strict)
```

### Frontend: Embeddable Widget
Vanilla TypeScript compiled to single IIFE bundle via esbuild. Shadow DOM encapsulation. Zero runtime dependencies. Target: < 25KB gzipped (hard ceiling 35KB). Browser support: Chrome 90+, Safari 15+, Firefox 90+, Edge 90+, iOS Safari 15+, Android Chrome 90+. No innerHTML. State machine. fetch() to SignalBox API only.

### Frontend: Dashboard + Marketing Site
Next.js 14+ App Router. TypeScript strict mode. Tailwind CSS with custom design tokens. No UI component libraries. No animation libraries (CSS only). React Hook Form + Zod. Recharts for analytics. All components custom-built.

### Backend
Next.js API Routes (Route Handlers). Supabase (Postgres, Auth, Realtime, RLS). Stripe (Checkout, Portal, Webhooks). Resend (transactional email). Zod (runtime validation). No ORMs.

### Netlify Configuration

```toml
[build]
  command = "cd apps/web && npm run build"
  publish = "apps/web/.next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions.hot-lead-followup]
  schedule = "*/5 * * * *"

[functions.retry-dead-letters]
  schedule = "*/5 * * * *"

[functions.retry-webhooks]
  schedule = "*/5 * * * *"

[functions.check-trial-expirations]
  schedule = "0 8 * * *"

[functions.hash-old-ips]
  schedule = "0 3 * * *"

[functions.reset-monthly-counts]
  schedule = "0 0 1 * *"

[functions.cleanup-deleted-accounts]
  schedule = "0 4 * * 0"

[[headers]]
  for = "/api/v1/widget/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=60"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### Geo/Device Detection
Country: Netlify context.geo.country or x-country header from edge function.
IP: x-forwarded-for header (first value).
Device: Parse User-Agent server-side via ua-parser-js.

### Widget Deployment
Build with esbuild to dist/sb.v{version}.js. Upload to Cloudflare R2. Cloudflare CDN caches with immutable headers. Version in filename, "latest" redirect from sb.js.

### Scheduled Functions

```
apps/web/netlify/functions/
  hot-lead-followup.ts            Every 5 min: check unresponded hot leads > 1hr
  retry-dead-letters.ts           Every 5 min: retry failed emails
  retry-webhooks.ts               Every 5 min: retry failed webhook deliveries
  check-trial-expirations.ts      Daily 8am UTC: send trial ending/expired emails
  hash-old-ips.ts                 Daily 3am UTC: hash IPs older than 30 days
  reset-monthly-counts.ts         1st of month midnight: zero submission counts
  cleanup-deleted-accounts.ts     Sunday 4am UTC: purge soft-deleted > 90 days
```

---

## 7. MONOREPO STRUCTURE

```
signalbox/
  apps/
    web/
      app/
        (marketing)/
          page.tsx                       Landing page
          pricing/page.tsx
          templates/page.tsx
        (auth)/
          login/page.tsx
          signup/page.tsx
          forgot-password/page.tsx
        (dashboard)/
          layout.tsx                     Dashboard shell
          page.tsx                       Overview/stats
          leads/
            page.tsx                     Lead list
            [id]/page.tsx               Lead detail
          widgets/
            page.tsx                     Widget list
            new/page.tsx
            [id]/
              page.tsx                   Widget detail
              flow/page.tsx             Flow builder
              design/page.tsx           Appearance
              embed/page.tsx            Embed code
          analytics/page.tsx
          settings/
            page.tsx                     Account
            team/page.tsx
            billing/page.tsx
            notifications/page.tsx
            api/page.tsx
          onboarding/page.tsx
        (admin)/
          layout.tsx                     Admin shell (dark sidebar)
          page.tsx                       Platform overview
          accounts/
            page.tsx                     All accounts
            [id]/page.tsx               Account detail + actions
          submissions/page.tsx          Global submission feed
          analytics/page.tsx            Platform metrics
          revenue/page.tsx              MRR, churn, LTV
          templates/
            page.tsx                     Manage templates
            [id]/page.tsx
          email-templates/
            page.tsx
            [id]/page.tsx
          settings/page.tsx             Platform settings
          audit/page.tsx                Audit log
        api/
          v1/
            submit/route.ts
            widget/[key]/route.ts
            leads/route.ts
            leads/[id]/route.ts
            widgets/route.ts
            widgets/[id]/route.ts
            analytics/route.ts
            account/route.ts
          webhooks/
            stripe/route.ts
          auth/
            callback/route.ts
      components/
        ui/
        dashboard/
        marketing/
        admin/
        shared/
      lib/
        supabase/
          client.ts
          server.ts
          admin.ts
          types.ts
        stripe/
          client.ts
          plans.ts
          webhooks.ts
        email/
          client.ts
          templates.ts
        scoring.ts
        validation.ts
        constants.ts
        utils.ts
      netlify/
        functions/
          hot-lead-followup.ts
          retry-dead-letters.ts
          retry-webhooks.ts
          check-trial-expirations.ts
          hash-old-ips.ts
          reset-monthly-counts.ts
          cleanup-deleted-accounts.ts
      styles/
        globals.css
      tailwind.config.ts
      netlify.toml
  packages/
    widget/
      src/
        index.ts
        widget.ts
        state.ts
        renderer.ts
        styles.ts
        api.ts
        animations.ts
        validators.ts
        types.ts
      esbuild.config.ts
      package.json
  supabase/
    migrations/
      001_create_accounts.sql
      002_create_members.sql
      003_create_widgets.sql
      004_create_flows.sql
      005_create_submissions.sql
      006_create_api_keys.sql
      007_create_webhook_endpoints.sql
      008_create_flow_templates.sql
      009_create_widget_analytics.sql
      010_create_notification_preferences.sql
      011_create_platform_tables.sql
      012_rls_policies.sql
      013_indexes.sql
    seed.sql
  .env.example
  package.json
  netlify.toml
```

---

## 8. DATABASE SCHEMA (Complete)

### Table: accounts

```sql
CREATE TABLE accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  owner_id              UUID NOT NULL REFERENCES auth.users(id),
  plan                  TEXT NOT NULL DEFAULT 'trial'
                        CHECK (plan IN ('trial', 'starter', 'pro', 'agency')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status   TEXT DEFAULT 'trialing'
                        CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at         TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  hot_lead_threshold    INT NOT NULL DEFAULT 70 CHECK (hot_lead_threshold BETWEEN 1 AND 100),
  warm_lead_threshold   INT NOT NULL DEFAULT 40 CHECK (warm_lead_threshold BETWEEN 1 AND 99),
  timezone              TEXT NOT NULL DEFAULT 'America/New_York',
  notification_email    TEXT,
  webhook_secret        TEXT,
  branding_removed      BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended          BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_reason      TEXT,
  suspended_at          TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  internal_notes        TEXT,
  is_featured           BOOLEAN DEFAULT FALSE,
  referral_source       TEXT,
  lifetime_revenue      DECIMAL(10,2) DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_thresholds CHECK (hot_lead_threshold > warm_lead_threshold)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Table: members

```sql
CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'viewer')),
  invited_email TEXT,
  invited_at    TIMESTAMPTZ,
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, user_id)
);
```

### Table: widgets

```sql
CREATE TABLE widgets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  widget_key        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  name              TEXT NOT NULL DEFAULT 'My Widget',
  domain            TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  theme             JSONB NOT NULL DEFAULT '{
    "mode": "light",
    "primaryColor": "#0F172A",
    "accentColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1E293B",
    "borderRadius": 12,
    "fontFamily": "system",
    "buttonStyle": "filled",
    "position": "bottom-right",
    "triggerType": "button",
    "triggerText": "Get Started",
    "triggerIcon": "arrow",
    "triggerOffsetX": 20,
    "triggerOffsetY": 20,
    "panelWidth": 400,
    "showBranding": true,
    "showSocialProof": false
  }'::jsonb,
  confirmation      JSONB NOT NULL DEFAULT '{
    "hot": {"headline":"You are a priority!","body":"Expect to hear from us within 1 business hour.","ctaText":null,"ctaUrl":null},
    "warm": {"headline":"Thanks for reaching out!","body":"A team member will review your request and get back to you within 24 hours.","ctaText":null,"ctaUrl":null},
    "cold": {"headline":"Thanks for your interest!","body":"We will send you some helpful resources to get started.","ctaText":null,"ctaUrl":null}
  }'::jsonb,
  social_proof_text     TEXT DEFAULT 'businesses qualified this month',
  social_proof_min      INT DEFAULT 10,
  contact_show_phone    BOOLEAN DEFAULT TRUE,
  contact_phone_required BOOLEAN DEFAULT FALSE,
  contact_show_message  BOOLEAN DEFAULT TRUE,
  contact_message_required BOOLEAN DEFAULT FALSE,
  contact_message_placeholder TEXT DEFAULT 'Anything else we should know?',
  contact_submit_text   TEXT DEFAULT 'Submit',
  submission_count      INT NOT NULL DEFAULT 0,
  submission_limit      INT NOT NULL DEFAULT 500,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER widgets_updated_at BEFORE UPDATE ON widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Table: flows

```sql
CREATE TABLE flows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id   UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  version     INT NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  steps       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER flows_updated_at BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX one_active_flow_per_widget ON flows (widget_id) WHERE is_active = TRUE;
```

#### Flow Steps JSONB Validation Rules

steps array: min 2, max 5 items. step.id: unique within flow, max 20 chars, alphanumeric + underscore. step.order: sequential from 1. step.question: max 120 chars. step.description: optional, max 200 chars. step.type: "single_select" only in v1. step.options: min 2, max 6. option.id: unique within step, max 20 chars. option.label: max 60 chars. option.icon: optional, max 4 chars (emoji). option.scoreWeight: integer, -50 to +50.

Contact info step is hardcoded in widget, NOT in flow JSONB.

### Table: submissions

```sql
CREATE TABLE submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id           UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  flow_version        INT NOT NULL,
  visitor_name        TEXT NOT NULL,
  visitor_email       TEXT NOT NULL,
  visitor_phone       TEXT,
  visitor_message     TEXT,
  answers             JSONB NOT NULL,
  raw_score           INT NOT NULL,
  lead_score          INT NOT NULL CHECK (lead_score BETWEEN 0 AND 100),
  lead_tier           TEXT NOT NULL CHECK (lead_tier IN ('hot', 'warm', 'cold')),
  source_url          TEXT,
  ip_address          INET,
  user_agent          TEXT,
  referrer            TEXT,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  country             TEXT,
  device_type         TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'viewed', 'contacted', 'qualified', 'disqualified', 'converted', 'archived')),
  viewed_at           TIMESTAMPTZ,
  contacted_at        TIMESTAMPTZ,
  notes               TEXT,
  notification_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_submissions_account_id ON submissions(account_id);
CREATE INDEX idx_submissions_widget_id ON submissions(widget_id);
CREATE INDEX idx_submissions_lead_tier ON submissions(account_id, lead_tier);
CREATE INDEX idx_submissions_status ON submissions(account_id, status);
CREATE INDEX idx_submissions_created_at ON submissions(account_id, created_at DESC);
CREATE INDEX idx_submissions_lead_score ON submissions(account_id, lead_score DESC);
CREATE INDEX idx_submissions_email ON submissions(account_id, visitor_email);
```

Answers JSONB is denormalized: each item stores stepId, optionId, question text, label text, and scoreWeight. This is intentional so flow changes don't corrupt historical data.

### Table: api_keys

```sql
CREATE TABLE api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'Default',
  key_hash     TEXT NOT NULL,
  key_prefix   TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;
```

### Table: webhook_endpoints

```sql
CREATE TABLE webhook_endpoints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  url               TEXT NOT NULL,
  events            TEXT[] NOT NULL DEFAULT '{submission.created}',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  secret            TEXT NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  last_status_code  INT,
  failure_count     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table: flow_templates

```sql
CREATE TABLE flow_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  industry    TEXT NOT NULL,
  steps       JSONB NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Industries: home_services, legal, medical, agency, hospitality, consulting, real_estate, financial, fitness, education, other.

### Table: widget_analytics

```sql
CREATE TABLE widget_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id       UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  impressions     INT NOT NULL DEFAULT 0,
  opens           INT NOT NULL DEFAULT 0,
  step_1_views    INT NOT NULL DEFAULT 0,
  step_2_views    INT NOT NULL DEFAULT 0,
  step_3_views    INT NOT NULL DEFAULT 0,
  step_4_views    INT NOT NULL DEFAULT 0,
  step_5_views    INT NOT NULL DEFAULT 0,
  completions     INT NOT NULL DEFAULT 0,
  submissions     INT NOT NULL DEFAULT 0,
  hot_count       INT NOT NULL DEFAULT 0,
  warm_count      INT NOT NULL DEFAULT 0,
  cold_count      INT NOT NULL DEFAULT 0,
  avg_score       DECIMAL(5,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(widget_id, date)
);
CREATE INDEX idx_analytics_account_date ON widget_analytics(account_id, date DESC);
```

### Table: notification_preferences

```sql
CREATE TABLE notification_preferences (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  member_id               UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email_on_hot_lead       BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_warm_lead      BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_cold_lead      BOOLEAN NOT NULL DEFAULT FALSE,
  email_hot_followup      BOOLEAN NOT NULL DEFAULT TRUE,
  email_weekly_digest     BOOLEAN NOT NULL DEFAULT TRUE,
  email_trial_alerts      BOOLEAN NOT NULL DEFAULT TRUE,
  email_billing_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, member_id)
);
CREATE TRIGGER notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Table: platform_metrics (Super Admin)

```sql
CREATE TABLE platform_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                  DATE NOT NULL UNIQUE,
  total_accounts        INT NOT NULL DEFAULT 0,
  new_accounts          INT NOT NULL DEFAULT 0,
  churned_accounts      INT NOT NULL DEFAULT 0,
  trial_accounts        INT NOT NULL DEFAULT 0,
  starter_accounts      INT NOT NULL DEFAULT 0,
  pro_accounts          INT NOT NULL DEFAULT 0,
  agency_accounts       INT NOT NULL DEFAULT 0,
  mrr                   DECIMAL(10,2) DEFAULT 0,
  new_mrr               DECIMAL(10,2) DEFAULT 0,
  churned_mrr           DECIMAL(10,2) DEFAULT 0,
  expansion_mrr         DECIMAL(10,2) DEFAULT 0,
  total_submissions     INT NOT NULL DEFAULT 0,
  hot_submissions       INT NOT NULL DEFAULT 0,
  warm_submissions      INT NOT NULL DEFAULT 0,
  cold_submissions      INT NOT NULL DEFAULT 0,
  total_active_widgets  INT NOT NULL DEFAULT 0,
  total_impressions     INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table: admin_audit_log

```sql
CREATE TABLE admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID NOT NULL,
  details     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_log_date ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_target ON admin_audit_log(target_type, target_id);
```

### Table: platform_settings

```sql
CREATE TABLE platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": ""}'),
  ('signup_enabled', '{"enabled": true}'),
  ('trial_days', '{"days": 14}'),
  ('max_accounts_per_email', '{"limit": 3}'),
  ('widget_bundle_version', '{"version": "1.0.0"}'),
  ('global_rate_limits', '{"submit_per_min": 10, "config_per_min": 100}'),
  ('disposable_email_domains', '{"domains": ["tempmail.com", "guerrillamail.com"]}'),
  ('blocked_ips', '{"ips": []}'),
  ('blocked_domains', '{"domains": []}');
```

### Table: email_templates

```sql
CREATE TABLE email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  subject     TEXT NOT NULL,
  body_html   TEXT NOT NULL,
  body_text   TEXT NOT NULL,
  variables   TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Row Level Security (All Tables)

```sql
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY accounts_select ON accounts FOR SELECT
  USING (id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY accounts_update ON accounts FOR UPDATE
  USING (id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role = 'owner'));

CREATE POLICY members_select ON members FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY members_modify ON members FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY widgets_select ON widgets FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY widgets_modify ON widgets FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY flows_select ON flows FOR SELECT
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())));
CREATE POLICY flows_modify ON flows FOR ALL
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))));

CREATE POLICY submissions_select ON submissions FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY submissions_update ON submissions FOR UPDATE
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY api_keys_all ON api_keys FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role = 'owner'));
CREATE POLICY webhooks_all ON webhook_endpoints FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY analytics_select ON widget_analytics FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY templates_select ON flow_templates FOR SELECT USING (TRUE);
```

---

## 9. API ROUTES (Complete)

### Public: GET /api/v1/widget/[key]
Returns widget config + active flow. CORS: widget domain + signalbox.io. Cache: 60s. Rate limit: 100/min per widget_key.
404 = not found. 410 = inactive. 402 = expired (show fallback contact info).

### Public: POST /api/v1/submit
Receives completed submission. Validates widget, JS challenge token, timing (reject < 2s), honeypot, answers match flow, duplicate check (same email + widget within 5min), submission limit. Computes score, determines tier, stores submission, sends notifications async, fires webhooks async, updates analytics.
201 = success with tier-appropriate confirmation. 400 = validation error. 404 = widget not found. 409 = duplicate. 429 = rate limited or limit exceeded.
Rate limit: 10/min per IP per widget, 3/min per IP global.

### Authenticated: GET /api/v1/leads
Paginated, sortable, filterable. Params: page, limit (max 100), sort (created_at|lead_score|status), order, tier, status, widget_id, search, from, to.

### Authenticated: GET /api/v1/leads/[id]
Full lead detail.

### Authenticated: PATCH /api/v1/leads/[id]
Update status or notes. Auto-sets viewed_at and contacted_at timestamps.

### Authenticated: GET/POST /api/v1/widgets
List and create. Creation validates widget count vs plan limit.

### Authenticated: PATCH/DELETE /api/v1/widgets/[id]
Update settings or delete.

### Authenticated: GET /api/v1/widgets/[id]/flow
Active flow.

### Authenticated: PUT /api/v1/widgets/[id]/flow
Replace flow. Creates new version, deactivates old.

### Authenticated: GET /api/v1/analytics
Dashboard analytics. Params: widget_id, from, to, granularity.

### Authenticated: POST/PATCH /api/v1/account
Create (onboarding) and update.

### Webhook: POST /api/webhooks/stripe
Stripe webhook handler. Verify signature. Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed, invoice.paid.

---

## 10. EMBEDDABLE WIDGET (Full Spec)

### Embed Code

```html
<script>
  (function(w,d,s,k){
    w.SignalBoxConfig={key:k};
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
    j.async=true;j.src='https://widget.signalbox.io/v1/sb.js';
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','WIDGET_KEY_HERE');
</script>
```

### State Machine

IDLE > LOADING > READY > OPEN > SUBMITTING > COMPLETE > READY (loop). Error and Disabled as branching states. See prior docs for full transition table.

### DOM Structure (Shadow DOM)

#sb-root > #sb-trigger, #sb-panel > #sb-header (progress + close), #sb-content (.sb-question, .sb-options > .sb-option), #sb-contact (fields, #sb-submit, #sb-honeypot), #sb-confirmation, #sb-error, #sb-footer.

### Animations (CSS Only)

Trigger entrance: fadeIn + translateY, 400ms, 1s delay. Panel open: translateY(100%) to 0, 350ms spring. Panel close: reverse, 250ms. Step forward: current slides left + fades, next slides in from right. Option tap: scale(0.97) bounce 150ms. Progress bar: width transition 400ms. Confirmation: scale(0.95)+fadeIn 350ms. All respect prefers-reduced-motion.

### Sizing

Trigger: 48px height, fixed position, z-index 2147483647. Panel desktop: 400px wide, max-height 640px. Panel mobile (<640px): 100% width, bottom-sheet, max-height 85vh. Option cards: full width, min-height 52px, 48px tap target. Inputs: full width, 48px height.

### Accessibility

Keyboard operable. Tab order. Escape closes. ARIA roles (button, dialog, radiogroup). Focus trap when open. Progress bar with aria-valuenow. Color contrast 4.5:1. Screen reader announcements.

### Security

Shadow DOM isolation. No innerHTML. No cookies on host domain. No localStorage on host domain. fetch() to signalbox.io only. CSP-compatible. SRI hash on script.

---

## 11. WIDGET VISUAL SPEC

### Trigger Button
Default: bg-[primaryColor] text-white, 15px font, weight 500, h-48px, px-5, radius 8px (or theme), shadow 0 4px 12px rgba(0,0,0,0.15). Icon: 18px, right of text. Hover: shadow deepens, translateY(-1px).

### Panel
Desktop: theme.panelWidth, max-height 640px, radius 12px, bg theme.backgroundColor, border 1px rgba(0,0,0,0.08), shadow-xl. Mobile: 100vw, max-height 85vh, radius 16px 16px 0 0.

### Header
Progress bar: h-1 (4px), bg theme.accentColor, smooth width transition. Step counter: 12px, text opacity 0.5. Close: 32x32 ghost, X icon.

### Question
20px, weight 600. Description: 14px, opacity 0.6.

### Option Cards
Full width, min-h 52px, p-14px-16px, border 1px rgba(0,0,0,0.08), radius theme (capped 12px). Hover: border accent, bg accent 0.04. Tap: scale(0.98) 100ms then advance.

### Contact Form
Labels: 13px weight 500 opacity 0.7. Inputs: h-12, border 1px, radius 6px, focus accent. Submit: full width, h-52px, bg primaryColor, 15px weight 600. Loading: text fades, spinner.

### Confirmation
48px circle bg accent 0.1 with checkmark. Headline 20px weight 600. Body 14px opacity 0.6. Optional CTA button.

### Footer
"Powered by SignalBox": 11px, opacity 0.3. Hidden if branding_removed.

---

## 12. DASHBOARD (Full Spec with Wireframes)

### Layout Rules

Sidebar: bg-surface, border-r, w-60 (240px), fixed. Logo: serif wordmark. Nav: font-body text-sm, Lucide 18px icons. Active: bg-signal-light text-signal. Main: bg-paper, ml-60, p-8, max content 1000px. Page header: font-display text-2xl weight-600. Below 1024px: sidebar collapses.

### Overview Page

4 stat cards (Total Leads, Hot Leads, Avg Score, Avg Response Time). Numbers in font-mono text-3xl. Trend arrows green/red. Recent Hot Leads table (top 3-5). Conversion Funnel (horizontal bars: opens > step1 > step2 > ... > submitted). Submissions Over Time (Recharts line chart). Date range selector.

### Leads List

Search bar + tier filter + status filter + date filter. Table: Name, Email, Score, Tier badge, Status badge, When. Sortable by score and date. Click row opens slide-over. Pagination.

### Lead Detail (Slide-Over)

Name, email, phone. Score badge with tier. All qualifying answers with questions, labels, and point values. Suggested opener (template-based, copy button). Visitor message. Status dropdown. Internal notes textarea. Metadata (source, device, country, UTM, timestamp). Archive button.

### Flow Builder

Left: step editor (question, options with score weights, add/remove). Right: live preview of actual widget. Template selector dropdown. Max 5 steps. Contact step auto-appended (not editable in flow).

### Widget Design Page

Live preview updating in real-time. Theme controls: colors (picker), border radius (slider 0-24), font family (dropdown: system/serif/sans), trigger text, trigger icon, trigger position, panel width. Confirmation messages per tier (hot/warm/cold). Contact form toggles (show phone, require phone, show message, require message, placeholder text, submit button text). Social proof toggle + text + minimum threshold.

### Embed Code Page

Code snippet with copy button. Platform-specific guides (WordPress, Shopify, Squarespace, Wix, Webflow, HTML). Verification tool: enter URL, check if widget is detected.

### Settings Pages

Account: name, slug, timezone, notification email, lead score thresholds. Team: member list, invite, roles, remove. Billing: Stripe portal link, current plan, usage. Notifications: per-member toggles for each email type. API: key management (create, revoke, prefix display), webhook endpoints (add, test, view failures).

---

## 13. SUPER ADMIN PANEL

### Authentication
Protected by SUPER_ADMIN_EMAILS env var only. No database role. Middleware checks session email against env var.

### Visual Differentiation
Dark sidebar (bg-ink, text-white). Red accent stripe. "ADMIN" badge on page headers. Impersonation mode: yellow fixed banner with exit button.

### Admin Home
Stat cards: Total Accounts, MRR, New This Month, Uptime. Plan breakdown. Today's submissions. Active widgets. Failed webhooks (24h). Recent signups. Accounts at risk (past_due or no login 14 days). System health status.

### Accounts List
Search, filter by plan/status/suspended. Table: Name, Owner Email, Plan, Status, MRR, Since. Export CSV.

### Account Detail
Full stats, members, widgets, billing history. Admin actions: Impersonate (read-only), Change Plan, Suspend/Unsuspend, Delete (requires typing name), Extend Trial (+7/14/30/custom days), Reset Submission Limit, Gift Plan (assign without Stripe). Internal notes (admin-only). Audit log for this account.

### Revenue Dashboard
MRR current + net new + churned + expansion. MRR over time chart. Plan distribution. Churn analysis (rate, reasons). Trial conversion rate + avg days to convert. Upcoming renewals. Past due accounts.

### Platform Settings
Maintenance mode toggle + message. Signup enabled toggle. Default trial days. Max accounts per email. Widget bundle version. Rate limits. Blocked IPs. Blocked domains. Disposable email domains.

### Template Management
CRUD for flow templates. Name, industry, steps, featured flag, sort order. Changes affect new widgets only.

### Audit Log
All admin actions with timestamp, admin email, action, target, details. Searchable, filterable.

### Admin Action Specs

IMPERSONATE: read-only dashboard access. Banner visible. URL does not change. Action logged.
CHANGE PLAN: overrides account.plan. Does not change Stripe. Updates widget limits.
SUSPEND: sets is_suspended=true. Widgets return 410. Dashboard blocked. Email sent.
UNSUSPEND: reverses suspension. Widgets resume.
DELETE: requires typing name. Cascading delete. Stripe canceled. Permanent.
EXTEND TRIAL: adds days to trial_ends_at. Works on expired trials.
RESET LIMIT: zeros submission_count on all account widgets.
GIFT PLAN: sets plan + active status without Stripe. For comps/partnerships.

---

## 14. LANDING PAGE (Full Copy & Layout)

Background: --sb-paper for entire page. Max-width 1140px centered. 80-128px between sections.

### Nav
Fixed top. Logo left (serif wordmark). "Pricing" "Templates" text links. "Log In" ghost button. 64px height. Border-bottom on scroll.

### Hero
Left-aligned, max-width 680px. No image.

Headline (font-display text-5xl weight-600): "Your contact page is costing you money."

Body (font-body text-lg text-stone): "Every lead that hits your contact form gets the same treatment: a generic thank-you and a 47-hour wait. The $100K prospect and the tire-kicker. Side by side. Invisible to each other, invisible to you. SignalBox fixes that."

"Replace your contact form with a guided qualifying flow that scores every lead before you pick up the phone."

CTA: [Start Free Trial] primary button large. "14 days free. No credit card." text-sm text-stone-light.

pt-32 pb-24.

### Problem Section
Title (font-display text-3xl): "The math on your broken contact page."

3-column stat cards:
- "78%" / "of deals go to whoever responds first." / "Lead Connect"
- "47 hours" / "average time a business takes to respond to a form submission." / "Drift Research"
- "27%" / "of inbound leads are ever contacted at all." / "InsideSales"

Stat number: font-display text-5xl weight-700. Description: font-body text-base text-stone. Source: text-xs text-stone-light italic.

Closing: "Your contact form can't tell you who to call first. SignalBox can."

### How It Works
Title: "Three steps. Five minutes. Done."

Single column, stacked vertically. Each step:
- Number: font-mono text-6xl weight-300 text-border (very faint)
- Title: font-display text-xl weight-600
- Body: font-body text-base text-stone, max-width 580px

01: "Build your flow." Copy about templates, questions, score weights. 5 minutes.
02: "Paste two lines of code." Copy about embed, platforms, floating button.
03: "Get scored leads, instantly." Copy about 0-100 scores, email alerts, prioritization.

48px gap between steps.

### Interactive Demo
Title: "Try it yourself."

Intro: "This is a real SignalBox widget. Go through the flow. Feel what your visitors will feel."

Live widget embedded inline (not floating). Pre-configured "Marketing Agency" scenario. Container: border rounded-12px, centered, max-w-md.

After completion: "You just told us your budget, timeline, and service interest without hesitating. That's what your leads will do."

### Features
Title: "What you get."

2-column grid (NOT 3). Cards with border, no shadow, p-5. No icons.
- Smart qualifying flows
- Automatic lead scoring
- Instant notifications
- Conversion analytics
- Custom branding
- 2-minute install

Card title: font-body weight-600 text-base. Card body: text-sm text-stone.

### Pricing
Title: "Pricing that makes the decision easy."

"Every plan includes a 14-day free trial. No credit card required. Cancel anytime."

Monthly/Annual toggle (annual saves 17%).

3-column cards. Pro has blue border (--sb-signal). Price: font-display text-4xl weight-700. Features: text-sm text-stone with small checkmarks.

Starter $99/mo: 1 widget, 500 subs, scoring, email alerts, basic analytics.
Pro $149/mo: 5 widgets, 2000 subs, plus Slack, webhooks, advanced analytics.
Agency $249/mo: 25 widgets, unlimited, plus white-label, multi-client dashboard.

### Templates Preview
Title: "Pre-built for your industry."

6 cards (3x2): Home Services, Legal, Medical, Agency, Real Estate, Consulting. Card shows name, step count, key topics.

### FAQ
Title: "Common questions." Accordion, single column, max-width 680px. 8 questions with full answers covering: installation, site speed, customization, lead handling, CRM integration, submission limits, contracts, Typeform comparison.

### Final CTA
Full-width dark section (bg-ink). Centered.
Headline (font-display text-4xl text-white): "Stop losing leads to your contact page."
Button: inverted (white bg, ink text). "14 days free. No credit card. Cancel anytime." text-sm text-stone-light.

### Footer
bg-paper. Border-top. 3-column links: Product (Pricing, Templates, Docs) / Company (About, Blog, Changelog) / Legal (Privacy, Terms). "Built in Virginia." Copyright.

---

## 15. MARKETING PAGES

### /pricing
Full pricing table with feature comparison matrix. Monthly/annual toggle. FAQ specific to pricing.

### /templates
Gallery of all flow templates with interactive previews. Filter by industry.

---

## 16. AUTHENTICATION & AUTHORIZATION

### Auth Flow
Signup: email+password > Supabase auth > confirmation email > onboarding (create account + widget + template) > Stripe checkout or trial.
Login: signInWithPassword > redirect to dashboard. Session: httpOnly cookie via Supabase SSR.
Password reset: resetPasswordForEmail > email link > callback > set new password.

### Authorization Matrix

```
Action                     Owner  Admin  Viewer
View leads                  YES    YES    YES
Update lead status/notes    YES    YES    NO
Export leads                YES    YES    NO
View/create/edit widgets    YES    YES    NO (view only)
View analytics              YES    YES    YES
Edit account settings       YES    NO     NO
Manage team                 YES    YES    NO
Manage billing              YES    NO     NO
Manage API keys             YES    NO     NO
Manage webhooks             YES    YES    NO
Delete account              YES    NO     NO
```

---

## 17. SECURITY HARDENING

### Input Validation
Zod strict mode on every endpoint. Strip HTML tags, trim whitespace, enforce max length. Email: format + MX record lookup. URLs: HTTPS only, no localhost, no private IPs. JSONB: strict schema validation.

### XSS
Widget: Shadow DOM + no innerHTML. Dashboard: React escaping, no dangerouslySetInnerHTML.

### CORS
Widget endpoints: widget.domain + *.signalbox.io. Dashboard: same-origin.

### Bot Detection
1. Honeypot: hidden "website" field, display:none. If filled: 200 fake success, don't store.
2. Timing: reject if < 2s from loadedAt.
3. JS challenge: token from widget (hash of key + timestamp + salt).

### Data Privacy
IPs hashed after 30 days. Cascade delete on account deletion. No third-party analytics in widget. GDPR: data export + account deletion in settings. Webhook payloads HMAC-SHA256 signed.

### API Keys
Format: sb_live_ + 32 random bytes (base62). Only hash stored. Shown once. Revocable. Optional expiration.

### Webhooks
HTTPS only. HMAC-SHA256 signed (X-SignalBox-Signature). Timestamp header for replay protection. 3 retries (1s, 30s, 5min). Auto-disable after 10 failures. 10s timeout. No redirect following (SSRF prevention). Reject internal IPs.

### Stripe Webhooks
Verify via constructEvent(). Idempotent (store processed event IDs).

---

## 18. RATE LIMITING

```
GET  /api/v1/widget/[key]     100/min     per widget_key
POST /api/v1/submit            10/min      per IP + widget_key
POST /api/v1/submit            3/min       per IP global
POST /api/v1/auth/*            5/min       per IP
GET  /api/v1/leads             30/min      per user_id
POST /api/v1/widgets           10/min      per user_id
ALL  /api/v1/*                 120/min     per user_id
```

Implementation: Upstash Redis sliding window. 429 with Retry-After header.

---

## 19. LEAD SCORING ENGINE

```
rawScore = sum of selected option scoreWeights
minPossible = sum of min scoreWeight per step
maxPossible = sum of max scoreWeight per step
range = maxPossible - minPossible
leadScore = range === 0 ? 50 : round(((rawScore - minPossible) / range) * 100)
clamp to 0-100
tier: >= hot_threshold = "hot", >= warm_threshold = "warm", else "cold"
```

### Suggested Opener (Template-Based, NOT AI)

```
"Hi [firstName], thanks for reaching out about [answer1.label] with a [answer2.label] timeline in the [answer3.label] range. Here's what I'd suggest as a next step..."
```

---

## 20. STRIPE INTEGRATION

### Plans

```
Trial:    Free, 14 days, 1 widget, 50 subs/mo
Starter:  $99/mo ($990/yr), 1 widget, 500 subs/mo
Pro:      $149/mo ($1490/yr), 5 widgets, 2000 subs/mo
Agency:   $249/mo ($2490/yr), 25 widgets, unlimited
```

### Lifecycle
TRIAL > ACTIVE (payment succeeds). ACTIVE > PAST_DUE (payment fails, 7-day grace). PAST_DUE > CANCELED (3 failures). CANCELED: widget shows fallback, dashboard read-only, data retained 90 days.

---

## 21. EMAIL SYSTEM

All emails: system font stack, 600px max-width, text-based logo, no images, no gradients, no purple. Manage preferences link in footer.

### Templates
1. New Lead Notification (immediate): subject with score + tier, body with all answers, suggested opener, dashboard link.
2. Hot Lead Follow-Up (1hr if still "new"): urgency framing.
3. Welcome (on signup).
4. Trial Ending (3 days before).
5. Trial Expired.
6. Weekly Digest (Monday, optional).
7. Payment Failed.
8. Webhook Failures (after 3 consecutive).

---

## 22. EDGE CASES (Comprehensive)

### Widget

- Script blocked by ad blocker: fail silently, render nothing.
- Config fetch fails: fail silently, no trigger.
- 402 expired: show fallback contact info, don't expose subscription status.
- 404 invalid key: fail silently.
- 429 rate limited: "Please try again in a moment."
- 409 duplicate: show normal confirmation.
- 500 error: show retry message, auto-retry once after 2s.
- Navigate away mid-flow: state resets (no persistence).
- Multiple widgets same page: independent Shadow DOM instances.
- Wrong domain: still works, flag domain_mismatch in metadata.
- Browser back: doesn't affect widget (floating panel).
- Slow connection: skeleton during fetch, spinner during submit, 15s timeout.
- JS disabled: no render.
- Inside iframe: must work (test Shopify, WP, Wix).
- Submission limit hit: 429 with fallback message.
- CSP blocking: document requirements for clients.
- Duplicate widget key same page: only first initializes.
- Shadow DOM host site: nested Shadow DOM works.
- localhost/file://: localhost works, file:// fetch fails silently.
- Do Not Track: skip storing IP, user_agent, referrer.
- Trigger overlaps chat widget: configurable position + offset.
- Screen reader: full ARIA implementation.
- Score weights all equal (min=max): all get score 50, show warning in builder.
- Long option label (60 chars): truncate 2 lines with ellipsis.
- Very old browser (no Shadow DOM): fail silently.
- Embed code in head: defers until DOMContentLoaded.
- Browser zoom 200%: rem/em units, flexbox layout.
- Old flow version on submit: accept, store version, match against that version.

### Dashboard

- Zero submissions: empty state with embed CTA.
- Zero widgets: redirect to creation.
- Viewer on admin page: "No permission" with link.
- Realtime drops: auto-reconnect, fallback 30s polling.
- Stripe inconsistent: trust Stripe, reconcile if stale > 24h.
- Delete only widget: allow, submissions preserved.
- Flow changed after submissions: old subs retain denormalized answers.
- Concurrent flow edits: last write wins, show "updated by [user]" banner.
- Account delete: soft delete, 30-day recovery, widgets 404 immediately.
- Downgrade with too many widgets: block, show which to deactivate.
- Owner self-removal: prevent, require ownership transfer.
- Member already has own account: one user, multiple accounts, account switcher.
- Invite link revoked then used: "Invite no longer valid."
- Duplicate submission 6 min apart: both stored (window is 5 min).
- Emoji in name/message: store as-is (UTF-8), strip HTML only.
- Webhook 301 redirect: treat as failure (SSRF prevention).
- Unicode business name: accept, slug strips non-alphanumeric.
- Impersonate deleted account: "Account no longer exists."
- Stripe webhook before redirect: webhook updates account, redirect reads current state.
- 50 submissions in 1 second: batch UI updates, show "+47 new" badge.
- JS/HTML in flow question text: strip tags on save, render textContent.

### API

- Body > 1MB: 413.
- Invalid JSON: 400.
- Wrong schema: 400 with Zod errors.
- DB pool exhausted: 503 with Retry-After.
- Supabase down: 503, widget config from edge cache if available.
- Stripe down: billing page unavailable, everything else works.
- Resend down: queue to dead letter table, retry every 5 min.
- Email with +alias: accept, don't normalize.
- Same IP hitting 10 widgets in 1 min: global rate limit catches it.
- API key in browser: document "server-only" warning.
- Webhook to internal IP: reject on save and delivery.
- flowVersion mismatch: accept, store as submitted.
- Migration failure: transactional, rolls back.

---

## 23. FULL CUSTOMIZATION MATRIX

### Widget Theme (JSONB)

mode: light|dark. primaryColor: hex. accentColor: hex. backgroundColor: hex. textColor: hex. borderRadius: 0-24. fontFamily: system|serif|sans. buttonStyle: filled. position: bottom-right|bottom-left|bottom-center. triggerType: button|tab. triggerText: max 30 chars. triggerIcon: arrow|chat|plus|none. triggerOffsetX: 0-100px. triggerOffsetY: 0-100px. panelWidth: 340-500px. showBranding: boolean (agency can disable). showSocialProof: boolean.

### Widget Confirmation (JSONB per tier)

Per hot/warm/cold: headline (max 100), body (max 300), ctaText (max 40, null = no button), ctaUrl.

### Contact Form (widget columns)

contact_show_phone, contact_phone_required, contact_show_message, contact_message_required, contact_message_placeholder (max 100), contact_submit_text (max 40).

### Account Settings

hot_lead_threshold (1-100), warm_lead_threshold (1-99, must be < hot), timezone, notification_email.

### Notification Preferences (per member)

email_on_hot_lead, email_on_warm_lead, email_on_cold_lead, email_hot_followup, email_weekly_digest, email_trial_alerts, email_billing_alerts.

### Social Proof (per widget)

social_proof_text (max 60), social_proof_min (threshold), showSocialProof toggle in theme.

### Webhooks (per endpoint)

url (HTTPS), events array (submission.created, submission.updated), is_active, secret (auto-generated, regeneratable).

---

## 24. PERFORMANCE BUDGETS

Widget: bundle < 25KB gzip, config fetch < 200ms p95, TTI < 500ms, submit < 500ms p95, zero host site impact.
Dashboard: FCP < 1.2s, TTI < 2.5s, LCP < 2s, CLS < 0.05, JS < 200KB gzip, API < 300ms p95.
Database: lead list < 50ms, analytics < 100ms, submission insert < 30ms, widget config < 20ms.

---

## 25. SEO & META

Landing: "SignalBox | Your Contact Page is Costing You Money." OG image: dark card, serif logo, tagline. Dashboard: noindex nofollow. Marketing: index follow. Sitemap + robots.txt.

---

## 26. ANALYTICS & TRACKING

Widget: fire events to SignalBox API only (impression, open, step_view, completion, submission). No third-party. Dashboard: privacy-friendly only. All analytics in widget_analytics table, aggregated daily. Real-time social proof from submission count (1-min cache).

---

## 27. ENVIRONMENT VARIABLES

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_STARTER_ANNUAL=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_ANNUAL=
STRIPE_PRICE_AGENCY_MONTHLY=
STRIPE_PRICE_AGENCY_ANNUAL=
RESEND_API_KEY=
EMAIL_FROM=notifications@signalbox.io
EMAIL_REPLY_TO=support@signalbox.io
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=signalbox-widget
R2_ENDPOINT=
NEXT_PUBLIC_APP_URL=https://signalbox.io
NEXT_PUBLIC_WIDGET_URL=https://widget.signalbox.io
WEBHOOK_SIGNING_SECRET=
IP_HASH_SALT=
SUPER_ADMIN_EMAILS=your@email.com
```

NEXT_PUBLIC_ = client-safe. Everything else = server-only. Never commit .env files.

---

## 28. BUILD ORDER

### Day 1: Foundation + Widget
Morning: Init monorepo, Tailwind with design tokens, Supabase migrations, seed templates, auth setup.
Afternoon: Build widget (state machine, Shadow DOM, multi-step flow, contact form, honeypot, progress bar, animations, esbuild). Public API routes (config fetch, submit with scoring). E2E test.
Evening: Mobile polish, accessibility, basic email notification.

### Day 2: Dashboard + Admin
Morning: Auth pages, onboarding, dashboard layout, overview page.
Afternoon: Leads page + detail slide-over, widget management, flow builder with live preview.
Evening: Embed code page, settings, realtime notifications. Admin middleware, admin layout (dark sidebar), admin home, accounts list, account detail with actions, audit logging.

### Day 3: Billing + Marketing + Ship
Morning: Stripe (checkout, portal, webhooks), plan enforcement, billing page.
Afternoon: Landing page (every section per spec), interactive demo, pricing page.
Evening: Admin revenue dashboard, platform settings, template management. Security pass, performance audit, deploy to Netlify, smoke test full flow.

### Day 4 (If Needed): Hardening
Load test widget. Security audit. Mobile testing. Edge case testing. Admin action testing. Lighthouse. Platform-specific embed guides.

---

## 29. ACCEPTANCE CRITERIA

WIDGET: Loads via script tag. Trigger renders. Panel opens with animation. Multi-step flow works. Progress bar. Back button. Contact form validates. Honeypot + timing check. Tier confirmation. Mobile responsive. Shadow DOM isolation. < 35KB. Cross-browser. Keyboard accessible. Graceful network failure.

DASHBOARD: Auth works. Onboarding creates account+widget+flow. Overview stats. Leads list sortable/filterable. Lead detail with answers+opener. Status+notes editable. Flow builder with live preview. Widget customizer. Embed code copy. Settings. Billing with Stripe.

ADMIN: Routes protected by SUPER_ADMIN_EMAILS. Dark sidebar visual distinction. Platform overview stats. Accounts CRUD. Impersonate (read-only). Suspend/unsuspend. Delete. Extend trial. Gift plan. Reset limits. Revenue dashboard. Platform settings. Template management. Audit log.

API: Config returns correct data. Submit validates/scores/stores/notifies. RLS enforced. Rate limiting. Zod validation.

MARKETING: Landing page per spec (hero, problem, how it works, demo, features, pricing, templates, FAQ, final CTA, footer). Interactive demo works. Pricing links to Stripe.

SECURITY: RLS on all tables. No client secrets. CORS per-widget. Bot detection. Stripe verified. Input sanitized. Webhook SSRF prevented.

DESIGN: Zero purple. Zero gradients. Serif headings, sans body. 1px borders not shadows. No AI slop copy. No illustrations. No component libraries.

INFRASTRUCTURE: Netlify deployed. Widget on R2+Cloudflare. Supabase for data. Upstash for rate limiting. Scheduled functions running.

---

## 30. POST-MVP ROADMAP (Do NOT Build in v1)

v1.1: Slack alerts, webhook delivery, CSV export, GA events.
v1.2: Multi-select steps, conditional logic, A/B testing, Zapier.
v1.3: API keys + REST API, HubSpot/Salesforce, custom widget domain, dark mode.
v2.0: Agency dashboard, white-label, advanced analytics, scheduled reports.

---

END OF SPECIFICATION

Feed this single document to Claude Code.
Say: "Build SignalBox. Follow this spec exactly. Start with Day 1."
