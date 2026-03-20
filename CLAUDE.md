# CLAUDE.md — HawkLeads Development Rules
# Enforced on every interaction. No exceptions.

---

## PROJECT IDENTITY

HawkLeads (hawkleads.io): Embeddable smart contact widget with lead scoring.
Stack: Next.js 14+ App Router, TypeScript strict, Tailwind CSS, Supabase (Postgres + Auth + Realtime + RLS), Stripe, Resend, Upstash Redis, Cloudflare R2, Netlify.
Monorepo: `apps/web` (Next.js dashboard + API + marketing), `packages/widget` (vanilla TS IIFE bundle), `supabase/` (migrations + seed).

---

## MANDATORY PRE-FLIGHT CHECKS

Before writing ANY code, Claude MUST run these checks mentally and flag violations:

### 1. TypeScript Strict Mode Enforcement
- `strict: true` in every `tsconfig.json` — no exceptions
- `noImplicitAny: true`, `strictNullChecks: true`, `strictFunctionTypes: true`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `noUncheckedIndexedAccess: true` — forces undefined checks on array/object access
- `exactOptionalPropertyTypes: true` — no `undefined` smuggling through optionals
- NEVER use `any` — use `unknown` + type guards, or explicit types
- NEVER use `@ts-ignore` or `@ts-expect-error` — fix the type error
- NEVER use non-null assertion `!` — narrow with guards instead
- All function parameters and return types MUST be explicitly typed
- All API responses MUST have typed interfaces
- All database query results MUST be typed via generated Supabase types

### 2. Lint Rules (ESLint + Enforced)
- `@typescript-eslint/strict-type-checked` preset
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unsafe-assignment`: error
- `@typescript-eslint/no-unsafe-member-access`: error
- `@typescript-eslint/no-unsafe-call`: error
- `@typescript-eslint/no-unsafe-return`: error
- `@typescript-eslint/no-floating-promises`: error — all promises awaited or void-returned
- `@typescript-eslint/no-misused-promises`: error
- `@typescript-eslint/require-await`: error
- `@typescript-eslint/prefer-nullish-coalescing`: error
- `@typescript-eslint/prefer-optional-chain`: error
- `import/no-cycle`: error — zero circular dependencies
- `import/order`: enforced (external, internal, relative, type imports last)
- `react-hooks/exhaustive-deps`: error
- `no-console`: warn in src, error in production builds
- Every file saved MUST pass `eslint --max-warnings 0`

### 3. Syntax Validation
- Run `tsc --noEmit` after every file change to catch type errors
- Run `eslint .` after every file change to catch lint errors
- JSON files validated with `JSON.parse` — no trailing commas, no comments
- SQL migrations: valid PostgreSQL syntax, tested against Supabase local
- Zod schemas MUST mirror database constraints exactly

---

## GAP AUDIT PROTOCOL

After completing any feature, run this gap audit checklist:

### Security Gap Audit
- [ ] All user inputs validated with Zod BEFORE any database operation
- [ ] All API routes check authentication (except public widget endpoints)
- [ ] RLS policies exist for every table that stores user data
- [ ] No secrets in client-side code (check for NEXT_PUBLIC_ prefix misuse)
- [ ] No `dangerouslySetInnerHTML` anywhere — use textContent or React escaping
- [ ] No `innerHTML` in widget code — DOM API only
- [ ] CORS configured per-endpoint (widget endpoints allow origin, dashboard same-origin)
- [ ] Rate limiting applied to every public endpoint via Upstash Redis
- [ ] Webhook URLs validated: HTTPS only, no localhost, no private IPs (10.x, 172.16-31.x, 192.168.x)
- [ ] Stripe webhooks verified via `constructEvent()` with signature
- [ ] API keys stored as hashes only — never plaintext
- [ ] SQL injection impossible — parameterized queries only (Supabase client handles this)
- [ ] XSS impossible — widget uses Shadow DOM, dashboard uses React
- [ ] CSRF impossible — API routes validate origin + session cookies
- [ ] No eval(), no Function(), no dynamic code execution
- [ ] Environment variables: server-only keys NEVER prefixed with NEXT_PUBLIC_

### Functional Gap Audit
- [ ] Every API route has request validation (Zod schema)
- [ ] Every API route has error responses for 400, 401, 403, 404, 429, 500
- [ ] Every API route returns proper HTTP status codes
- [ ] Every form has client-side AND server-side validation
- [ ] Every async operation has loading, success, and error states in UI
- [ ] Every database write has a corresponding read that reflects the change
- [ ] Pagination implemented for all list endpoints (never unbounded queries)
- [ ] All timestamps stored as TIMESTAMPTZ (UTC), displayed in account timezone
- [ ] Soft delete used for accounts (deleted_at), hard cascade for child records on account delete
- [ ] Optimistic UI updates revert on server error

### Scalability Gap Audit
- [ ] No N+1 queries — use joins or batch fetches
- [ ] Database indexes exist for every WHERE clause and ORDER BY in queries
- [ ] Widget config cached (60s) — not fetched on every page load
- [ ] API responses paginated with cursor or offset — max 100 per page
- [ ] Heavy operations (email, webhooks) are async — never block the request
- [ ] Widget bundle < 35KB gzipped (hard ceiling)
- [ ] Dashboard JS < 200KB gzipped
- [ ] Images optimized with Next.js Image component
- [ ] No blocking waterfall requests — parallel fetch where possible
- [ ] Database connection pooling via Supabase (no raw pg connections)

### Design System Gap Audit
- [ ] Zero purple anywhere — colors, gradients, borders, shadows
- [ ] Zero gradients on buttons or backgrounds
- [ ] Body text uses sans font (--font-body) — NEVER serif
- [ ] Cards use 1px borders — NOT shadows at rest
- [ ] Buttons: 6-8px radius max — NEVER rounded-full (pills for badges only)
- [ ] Max 2 font families total
- [ ] Content max-width 1140px, prose max-width 672px
- [ ] All interactive elements have visible focus states
- [ ] Color contrast ratio >= 4.5:1 for text
- [ ] No component libraries (no shadcn, MUI, Radix, Headless UI)
- [ ] No animation libraries — CSS transitions only, 150-200ms
- [ ] No decorative animations — functional only (hover, focus, open/close)

---

## CODE PATTERNS — ENFORCED

### API Route Pattern (Every Route Handler)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  // Strict Zod schema matching exact expected shape
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit check
  const rateLimitResult = await rateLimit(request, { limit: 10, window: '1m' });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  // 2. Auth check (skip for public endpoints)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Parse + validate body
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4. Authorization check (role-based)
  // 5. Business logic
  // 6. Database operation
  // 7. Return typed response
}
```

### Supabase Query Pattern
```typescript
// ALWAYS check for errors
const { data, error } = await supabase
  .from('submissions')
  .select('id, visitor_name, lead_score, lead_tier')
  .eq('account_id', accountId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

if (error) {
  console.error('Query failed:', error.message);
  return NextResponse.json({ error: 'Database error' }, { status: 500 });
}
// data is now typed and non-null
```

### Component Pattern
```typescript
// Explicit props interface — never inline
interface LeadCardProps {
  readonly lead: Submission;
  readonly onStatusChange: (id: string, status: SubmissionStatus) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps): React.ReactElement {
  // Component body
}
```

### Zod Schema Pattern (mirrors DB constraints exactly)
```typescript
export const submitSchema = z.object({
  widgetKey: z.string().min(1).max(24),
  answers: z.array(z.object({
    stepId: z.string().max(20).regex(/^[a-zA-Z0-9_]+$/),
    optionId: z.string().max(20).regex(/^[a-zA-Z0-9_]+$/),
  })).min(2).max(5),
  name: z.string().trim().min(1).max(200).transform(stripHtml),
  email: z.string().email().max(320).toLowerCase(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).transform(stripHtml).optional(),
  token: z.string().min(1),  // JS challenge token
  loadedAt: z.number(),       // Timing check
  honeypot: z.string().max(0).optional(), // Must be empty
});
```

---

## FILE NAMING CONVENTIONS

- Components: `PascalCase.tsx` (e.g., `LeadCard.tsx`, `FlowBuilder.tsx`)
- Utilities/libs: `kebab-case.ts` (e.g., `rate-limit.ts`, `scoring.ts`)
- API routes: `route.ts` inside directory structure
- Types: `types.ts` — co-located with feature, shared types in `lib/types.ts`
- Constants: `constants.ts` — never magic numbers or strings inline
- Tests: `*.test.ts` or `*.test.tsx` co-located with source

---

## IMPORT ORDER (Enforced)

```typescript
// 1. Node/Next built-ins
import { NextRequest } from 'next/server';

// 2. External packages
import { z } from 'zod';

// 3. Internal absolute imports (@/)
import { createClient } from '@/lib/supabase/server';
import type { Submission } from '@/lib/types';

// 4. Relative imports
import { LeadBadge } from './LeadBadge';

// 5. Type-only imports (always last, always explicit)
import type { Database } from '@/lib/supabase/types';
```

---

## ERROR HANDLING RULES

- NEVER swallow errors silently (no empty catch blocks)
- API routes: return structured JSON errors with status codes
- Widget: fail silently to user, log to console in dev
- Dashboard: show toast notifications for user-facing errors
- Database errors: log server-side, return generic message to client
- Network errors: show retry option in UI
- Validation errors: show inline field-level messages
- Auth errors: redirect to login with return URL

---

## SECURITY RULES — NON-NEGOTIABLE

1. **Input Sanitization**: Every string from user input goes through `stripHtml()` (removes all HTML tags) + `.trim()` before storage
2. **Output Encoding**: React handles escaping. Widget uses DOM API (textContent, setAttribute). NEVER innerHTML.
3. **Auth on Every Request**: Server components use `createClient()` from `@/lib/supabase/server`. API routes verify `getUser()`. No trusting client-sent user IDs.
4. **RLS Always On**: Every table with user data has RLS enabled + policies. Service role key used ONLY in server-side scheduled functions.
5. **Secrets Management**: `.env.local` never committed. `.env.example` has empty values only. Server keys never in client bundles.
6. **CORS**: Widget API endpoints allow widget domain + hawkleads.io. All other routes same-origin only.
7. **Rate Limiting**: Every public endpoint rate-limited via Upstash Redis sliding window.
8. **Bot Protection**: Honeypot field + timing check (reject < 2s) + JS challenge token on widget submissions.
9. **Webhook Security**: HMAC-SHA256 signing. HTTPS only. No redirects followed. Internal IPs blocked.
10. **Data Privacy**: IPs hashed after 30 days. Cascade delete on account deletion. No third-party analytics in widget.

---

## PERFORMANCE BUDGETS — ENFORCED

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Widget bundle (gzip) | < 25KB | 35KB |
| Widget config fetch (p95) | < 200ms | 500ms |
| Widget TTI | < 500ms | 1000ms |
| Dashboard FCP | < 1.2s | 2s |
| Dashboard TTI | < 2.5s | 4s |
| Dashboard JS (gzip) | < 200KB | 300KB |
| API response (p95) | < 300ms | 500ms |
| DB lead list query | < 50ms | 100ms |
| DB submission insert | < 30ms | 50ms |

---

## BRAND RULES — ENFORCED IN ALL UI CODE

- Product name: "HawkLeads" — capital H, capital L, one word. Never "Hawk Leads" or "hawkleads"
- Domain: hawkleads.io
- Logo: Three-stroke SVG mark + "HawkLeads" wordmark. Use the `Logo` component (`components/shared/Logo.tsx`) everywhere.
- Favicon: `app/icon.svg` (dark rounded square with white three-stroke mark)
- Zero purple. Check hex values — nothing in #7x, #8x, #9x with blue/red mix
- Zero gradients on buttons or backgrounds
- No component libraries. All UI built from scratch.
- No decorative illustrations, blobs, waves, or SVG dividers
- No AI-slop copy words: "delve", "tapestry", "leverage", "synergy", "empower", "seamless", "supercharge", "unleash", "game-changing", "cutting-edge", "robust", "powerful", "innovative"
- No em dashes in copy. Use periods, commas, colons.
- No exclamation marks in body copy. Max 1 in a CTA.
- Buttons: solid fill OR ghost/outline. 6-8px radius. Never pill-shaped (pills = badges only).
- Cards: 1px solid border `#E2E8F0`. No shadows at rest. Shadow on hover only.

---

## TESTING REQUIREMENTS

- Unit tests for: scoring engine, Zod schemas, utility functions
- Integration tests for: API routes (auth, validation, responses), Supabase RLS policies
- E2E tests for: widget full flow, signup > onboarding > first widget, Stripe checkout
- Widget tests: cross-browser (Chrome, Safari, Firefox, Edge), mobile, keyboard nav, screen reader
- Every PR must pass: `tsc --noEmit && eslint . --max-warnings 0 && npm test`

---

## GIT RULES

- Commit messages: imperative mood, < 72 chars, describe WHY not WHAT
- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/` prefixes
- Never commit: `.env`, `node_modules/`, `.next/`, `dist/`, `*.log`
- Never force-push to main
- Every commit must pass TypeScript + ESLint checks

---

## BUILD VERIFICATION COMMAND

Run after every significant change:
```bash
npm run typecheck && npm run lint && npm run build && npm test
```

If any step fails, fix before proceeding. No skipping.

---

## WHAT NOT TO DO — HARD RULES

- NO `any` types — EVER
- NO `@ts-ignore` or `@ts-expect-error`
- NO `innerHTML` or `dangerouslySetInnerHTML`
- NO component libraries (shadcn, MUI, Radix, Chakra, Headless UI)
- NO animation libraries (Framer Motion, GSAP, etc.) — CSS only
- NO ORM (Prisma, Drizzle, etc.) — Supabase client only
- NO AI/LLM calls — zero "AI" branding, zero slop
- NO purple anywhere in the UI
- NO gradient backgrounds or buttons
- NO floating label inputs
- NO `console.log` in production code (use structured logging)
- NO hardcoded strings — use constants
- NO magic numbers — use named constants
- NO barrel exports (index.ts re-exports) — direct imports only
- NO default exports — named exports only (except Next.js pages)
- NO class components — function components with hooks only
- NO `var` — `const` by default, `let` only when reassignment needed
- NO `==` — always `===`
- NO nested ternaries — use if/else or early returns
- NO functions longer than 50 lines — extract helpers
- NO files longer than 300 lines — split into modules
