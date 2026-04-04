'use client';

import Link from 'next/link';
import { useState } from 'react';

const SECTIONS = [
  'overview',
  'authentication',
  'rate-limits',
  'leads',
  'widgets',
  'flows',
  'analytics',
  'submissions',
  'billing',
  'webhooks',
  'errors',
] as const;

type SectionId = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<SectionId, string> = {
  overview: 'Overview',
  authentication: 'Authentication',
  'rate-limits': 'Rate Limits',
  leads: 'Leads',
  widgets: 'Widgets',
  flows: 'Flows',
  analytics: 'Analytics',
  submissions: 'Submissions',
  billing: 'Billing',
  webhooks: 'Webhooks',
  errors: 'Errors',
};

function CodeBlock({ children }: { readonly children: string }): React.ReactElement {
  return (
    <pre className="mt-2 p-4 bg-ink text-paper text-xs font-mono rounded-md overflow-x-auto leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({
  method,
  path,
  description,
  auth,
}: {
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  readonly path: string;
  readonly description: string;
  readonly auth?: boolean;
}): React.ReactElement {
  const methodColors: Record<string, string> = {
    GET: 'bg-signal-light text-signal',
    POST: 'bg-success-light text-success',
    PATCH: 'bg-warning-light text-warning',
    PUT: 'bg-warning-light text-warning',
    DELETE: 'bg-danger-light text-danger',
    OPTIONS: 'bg-surface-alt text-stone',
  };

  return (
    <div className="mt-4 p-4 border border-border rounded-md">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${methodColors[method] ?? 'bg-surface-alt text-stone'}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-ink">{path}</code>
        {auth !== false && (
          <span className="text-xs text-stone bg-surface-alt px-1.5 py-0.5 rounded">Auth required</span>
        )}
        {auth === false && (
          <span className="text-xs text-stone-light bg-surface-alt px-1.5 py-0.5 rounded">Public</span>
        )}
      </div>
      <p className="mt-2 text-sm text-stone">{description}</p>
    </div>
  );
}

function ParamTable({
  params,
}: {
  readonly params: ReadonlyArray<{
    name: string;
    type: string;
    required?: boolean;
    description: string;
  }>;
}): React.ReactElement {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="py-2 pr-4 font-medium text-ink">Parameter</th>
            <th className="py-2 pr-4 font-medium text-ink">Type</th>
            <th className="py-2 pr-4 font-medium text-ink">Required</th>
            <th className="py-2 font-medium text-ink">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-ink">{p.name}</td>
              <td className="py-2 pr-4 text-xs text-stone">{p.type}</td>
              <td className="py-2 pr-4 text-xs">{p.required ? <span className="text-danger">Yes</span> : <span className="text-stone-light">No</span>}</td>
              <td className="py-2 text-xs text-stone">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage(): React.ReactElement {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  return (
    <div>
    <section className="bg-black pt-32 pb-12 px-6">
      <div className="max-w-content mx-auto">
        <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">Developer Reference</p>
        <h1 className="font-display text-3xl font-semibold text-white">API Documentation</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Reference for the HawkLeads REST API. API access requires a Pro or Agency plan.
        </p>
      </div>
    </section>
    <div className="bg-white max-w-content mx-auto px-6 py-10">

      {/* Mobile section select */}
      <div className="mt-6 md:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value as SectionId)}
          className="input-field w-full"
        >
          {SECTIONS.map((id) => (
            <option key={id} value={id}>{SECTION_LABELS[id]}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 flex gap-8">
        {/* Sidebar nav */}
        <nav className="hidden md:block w-48 flex-shrink-0 sticky top-24 self-start">
          <ul className="space-y-1">
            {SECTIONS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors duration-fast ${
                    activeSection === id
                      ? 'bg-signal-light text-signal font-medium'
                      : 'text-stone hover:text-ink hover:bg-surface-alt'
                  }`}
                >
                  {SECTION_LABELS[id]}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Overview */}
          {activeSection === 'overview' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Overview</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                The HawkLeads API is a REST API that returns JSON responses. All requests must be made over HTTPS.
                The base URL for all API endpoints is:
              </p>
              <CodeBlock>{'https://hawkleads.io/api/v1'}</CodeBlock>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Content Type</h3>
              <p className="text-sm text-stone">
                All POST, PUT, and PATCH requests must include a <code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono">Content-Type: application/json</code> header.
                Request bodies must be valid JSON.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Versioning</h3>
              <p className="text-sm text-stone">
                The API is versioned in the URL path (<code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono">/api/v1/</code>).
                Breaking changes will be introduced under a new version prefix. Non-breaking additions (new fields, new endpoints)
                may be added without a version bump.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Available Endpoints</h3>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET/POST</code> <code className="font-mono text-xs text-ink">/api/v1/leads</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET/PATCH</code> <code className="font-mono text-xs text-ink">/api/v1/leads/:id</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET/POST</code> <code className="font-mono text-xs text-ink">/api/v1/widgets</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET/PATCH/DELETE</code> <code className="font-mono text-xs text-ink">/api/v1/widgets/:id</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET/PUT</code> <code className="font-mono text-xs text-ink">/api/v1/widgets/:id/flow</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">GET</code> <code className="font-mono text-xs text-ink">/api/v1/analytics</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">POST</code> <code className="font-mono text-xs text-ink">/api/v1/submit</code></div>
                <div className="flex items-center gap-2"><code className="font-mono text-xs text-stone">POST/PATCH</code> <code className="font-mono text-xs text-ink">/api/v1/account</code></div>
              </div>
            </section>
          )}

          {/* Authentication */}
          {activeSection === 'authentication' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Authentication</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                API requests are authenticated using API keys. Include your API key in the
                <code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono ml-1">Authorization</code> header:
              </p>
              <CodeBlock>{'Authorization: Bearer sb_live_your_api_key_here'}</CodeBlock>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Getting an API Key</h3>
              <p className="text-sm text-stone">
                Generate API keys from your dashboard at{' '}
                <Link href="/dashboard/settings/api" className="text-signal hover:text-signal-hover transition-colors duration-fast">
                  Settings &gt; API
                </Link>.
                API keys are shown in full only once at creation time. Store them securely. Keys are prefixed with
                <code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono ml-1">sb_live_</code>.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Key Security</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-2 text-sm text-stone">
                <li>API keys are stored as SHA-256 hashes. We cannot recover a lost key.</li>
                <li>Keys should never be included in client-side code, committed to version control, or shared publicly.</li>
                <li>Revoke compromised keys immediately from the API settings page.</li>
                <li>Each key is scoped to a single account. Cross-account access is not supported.</li>
              </ul>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Example Request</h3>
              <CodeBlock>{`curl -X GET "https://hawkleads.io/api/v1/leads?limit=10" \\
  -H "Authorization: Bearer sb_live_abc123def456" \\
  -H "Content-Type: application/json"`}</CodeBlock>
            </section>
          )}

          {/* Rate Limits */}
          {activeSection === 'rate-limits' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Rate Limits</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                All API endpoints are rate-limited using a sliding window algorithm. Rate limit information is
                included in response headers:
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2 pr-4 font-medium text-ink">Header</th>
                      <th className="py-2 font-medium text-ink">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">X-RateLimit-Limit</td>
                      <td className="py-2 text-xs text-stone">Maximum requests per window</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">X-RateLimit-Remaining</td>
                      <td className="py-2 text-xs text-stone">Remaining requests in current window</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">X-RateLimit-Reset</td>
                      <td className="py-2 text-xs text-stone">Unix timestamp when the window resets</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">Retry-After</td>
                      <td className="py-2 text-xs text-stone">Seconds to wait (only on 429 responses)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Limits by Endpoint</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2 pr-4 font-medium text-ink">Endpoint</th>
                      <th className="py-2 pr-4 font-medium text-ink">Limit</th>
                      <th className="py-2 font-medium text-ink">Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">API endpoints (authenticated)</td>
                      <td className="py-2 pr-4 text-xs text-stone">120 requests</td>
                      <td className="py-2 text-xs text-stone">1 minute</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">/api/v1/submit (public)</td>
                      <td className="py-2 pr-4 text-xs text-stone">10 requests per IP</td>
                      <td className="py-2 text-xs text-stone">1 minute</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">/api/v1/widget/:key (public)</td>
                      <td className="py-2 pr-4 text-xs text-stone">100 requests per IP</td>
                      <td className="py-2 text-xs text-stone">1 minute</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">/api/auth/login</td>
                      <td className="py-2 pr-4 text-xs text-stone">5 requests per IP</td>
                      <td className="py-2 text-xs text-stone">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-stone">
                When rate limited, the API returns a <code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono">429 Too Many Requests</code> response.
                Implement exponential backoff in your integration.
              </p>
            </section>
          )}

          {/* Leads */}
          {activeSection === 'leads' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Leads</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Leads are created automatically when end users complete a widget submission. Each lead
                includes contact information, qualifying answers, and an automated lead score.
              </p>

              <Endpoint method="GET" path="/api/v1/leads" description="List all leads for your account with filtering, sorting, search, and pagination." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Query Parameters</h3>
              <ParamTable params={[
                { name: 'limit', type: 'number', description: 'Results per page (1-100, default 25)' },
                { name: 'offset', type: 'number', description: 'Number of results to skip (default 0)' },
                { name: 'sort', type: 'string', description: 'Sort field: created_at, lead_score, visitor_name' },
                { name: 'order', type: 'string', description: 'Sort direction: asc or desc (default desc)' },
                { name: 'status', type: 'string', description: 'Filter by status: new, viewed, contacted, qualified, disqualified, converted, archived' },
                { name: 'tier', type: 'string', description: 'Filter by lead tier: hot, warm, cold' },
                { name: 'widget_id', type: 'string', description: 'Filter by widget UUID' },
                { name: 'search', type: 'string', description: 'Search by name or email' },
              ]} />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Example Response</h3>
              <CodeBlock>{`{
  "data": [
    {
      "id": "uuid",
      "visitor_name": "Jane Smith",
      "visitor_email": "jane@example.com",
      "visitor_phone": "+1234567890",
      "lead_score": 85,
      "lead_tier": "hot",
      "status": "new",
      "widget_id": "uuid",
      "answers": [...],
      "created_at": "2026-03-15T14:30:00Z"
    }
  ],
  "total": 142,
  "limit": 25,
  "offset": 0
}`}</CodeBlock>

              <Endpoint method="GET" path="/api/v1/leads/:id" description="Retrieve a single lead by ID with full details." />

              <Endpoint method="PATCH" path="/api/v1/leads/:id" description="Update lead status or internal notes." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Request Body</h3>
              <ParamTable params={[
                { name: 'status', type: 'string', description: 'new, viewed, contacted, qualified, disqualified, converted, archived' },
                { name: 'internal_notes', type: 'string', description: 'Internal notes (max 2000 characters, not visible to lead)' },
              ]} />
            </section>
          )}

          {/* Widgets */}
          {activeSection === 'widgets' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Widgets</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Widgets are the embeddable contact forms you place on your website. Each widget has its own
                configuration, theme, qualifying flow, and submission limit.
              </p>

              <Endpoint method="GET" path="/api/v1/widgets" description="List all active widgets for your account." />

              <Endpoint method="POST" path="/api/v1/widgets" description="Create a new widget. Subject to plan limits." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Request Body</h3>
              <ParamTable params={[
                { name: 'name', type: 'string', required: true, description: 'Widget name (1-100 characters)' },
                { name: 'domain', type: 'string', description: 'Allowed domain for the widget (max 253 characters)' },
                { name: 'templateId', type: 'string', description: 'UUID of a flow template to use' },
              ]} />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Example Response (201)</h3>
              <CodeBlock>{`{
  "data": {
    "id": "uuid",
    "account_id": "uuid",
    "name": "Main Website",
    "widget_key": "abc123def456",
    "domain": "example.com",
    "is_active": true,
    "submission_count": 0,
    "submission_limit": 500,
    "theme": { ... },
    "confirmation": { ... },
    "created_at": "2026-03-15T14:30:00Z"
  }
}`}</CodeBlock>

              <Endpoint method="GET" path="/api/v1/widgets/:id" description="Retrieve a single widget with full configuration." />
              <Endpoint method="PATCH" path="/api/v1/widgets/:id" description="Update widget settings (name, domain, theme, confirmation message)." />
              <Endpoint method="DELETE" path="/api/v1/widgets/:id" description="Deactivate a widget. Does not delete submissions." />
            </section>
          )}

          {/* Flows */}
          {activeSection === 'flows' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Flows</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Flows define the qualifying questions shown in your widget. Each widget has one active flow
                consisting of 2-5 steps. Each step has a question and scored options.
              </p>

              <Endpoint method="GET" path="/api/v1/widgets/:id/flow" description="Get the active flow for a widget." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Example Response</h3>
              <CodeBlock>{`{
  "data": {
    "id": "uuid",
    "widget_id": "uuid",
    "version": 1,
    "is_active": true,
    "steps": [
      {
        "id": "step-1",
        "question": "What are you looking for?",
        "options": [
          { "id": "opt-1a", "label": "Product info", "scoreWeight": 5 },
          { "id": "opt-1b", "label": "Pricing", "scoreWeight": 10 },
          { "id": "opt-1c", "label": "Support", "scoreWeight": 3 }
        ]
      },
      {
        "id": "step-2",
        "question": "What is your timeline?",
        "options": [
          { "id": "opt-2a", "label": "Immediately", "scoreWeight": 15 },
          { "id": "opt-2b", "label": "Within a month", "scoreWeight": 10 },
          { "id": "opt-2c", "label": "Just exploring", "scoreWeight": 2 }
        ]
      }
    ]
  }
}`}</CodeBlock>

              <Endpoint method="PUT" path="/api/v1/widgets/:id/flow" description="Replace the flow steps for a widget. Creates a new version." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Request Body</h3>
              <ParamTable params={[
                { name: 'steps', type: 'array', required: true, description: 'Array of 2-5 step objects, each with id, question, and options' },
                { name: 'steps[].id', type: 'string', required: true, description: 'Unique step identifier (alphanumeric + underscore, max 20 chars)' },
                { name: 'steps[].question', type: 'string', required: true, description: 'The question text (max 200 characters)' },
                { name: 'steps[].options', type: 'array', required: true, description: 'Array of 2-6 option objects' },
                { name: 'steps[].options[].id', type: 'string', required: true, description: 'Unique option identifier' },
                { name: 'steps[].options[].label', type: 'string', required: true, description: 'Display label (max 100 characters)' },
                { name: 'steps[].options[].scoreWeight', type: 'number', required: true, description: 'Score weight (0-100)' },
              ]} />
            </section>
          )}

          {/* Analytics */}
          {activeSection === 'analytics' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Analytics</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Retrieve time-series analytics data for your widgets, including impressions, opens, completions,
                and lead tier breakdowns.
              </p>

              <Endpoint method="GET" path="/api/v1/analytics" description="Fetch analytics data with date range and granularity options." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Query Parameters</h3>
              <ParamTable params={[
                { name: 'widget_id', type: 'string', description: 'Filter by widget UUID (omit for account-wide data)' },
                { name: 'start_date', type: 'string', required: true, description: 'Start date in ISO 8601 format (e.g. 2026-03-01)' },
                { name: 'end_date', type: 'string', required: true, description: 'End date in ISO 8601 format' },
                { name: 'granularity', type: 'string', description: 'Data granularity: day, week, month (default day)' },
              ]} />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Example Response</h3>
              <CodeBlock>{`{
  "data": [
    {
      "date": "2026-03-15",
      "impressions": 1240,
      "opens": 380,
      "step_1_views": 350,
      "step_2_views": 280,
      "step_3_views": 210,
      "submissions": 142,
      "hot_leads": 28,
      "warm_leads": 65,
      "cold_leads": 49
    }
  ]
}`}</CodeBlock>
            </section>
          )}

          {/* Submissions */}
          {activeSection === 'submissions' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Widget Submissions</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                The submission endpoint is used by the embedded widget to send lead data. This is a public
                endpoint (no API key required) but is protected by rate limiting, bot detection, and CORS.
              </p>

              <Endpoint method="POST" path="/api/v1/submit" description="Submit a completed widget flow. Used by the embedded widget." auth={false} />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Request Body</h3>
              <ParamTable params={[
                { name: 'widgetKey', type: 'string', required: true, description: 'The widget public key (max 24 characters)' },
                { name: 'answers', type: 'array', required: true, description: 'Array of step/option selections (2-5 items)' },
                { name: 'name', type: 'string', required: true, description: 'Visitor name (1-200 characters, HTML stripped)' },
                { name: 'email', type: 'string', required: true, description: 'Visitor email (max 320 characters, normalized to lowercase)' },
                { name: 'phone', type: 'string', description: 'Visitor phone (max 30 characters)' },
                { name: 'message', type: 'string', description: 'Free-text message (max 2000 characters, HTML stripped)' },
                { name: 'token', type: 'string', required: true, description: 'JavaScript challenge token for bot protection' },
                { name: 'loadedAt', type: 'number', required: true, description: 'Timestamp when the widget loaded (used for timing check)' },
                { name: 'honeypot', type: 'string', description: 'Honeypot field (must be empty)' },
              ]} />

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Bot Protection</h3>
              <p className="text-sm text-stone">
                Submissions are validated with three layers of bot protection:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-2 text-sm text-stone">
                <li><span className="font-medium text-ink">Honeypot field:</span> a hidden field that must be empty. Bots that fill all fields will be rejected.</li>
                <li><span className="font-medium text-ink">Timing check:</span> submissions completed in under 2 seconds are rejected as likely automated.</li>
                <li><span className="font-medium text-ink">JS challenge token:</span> a token generated by client-side JavaScript that proves the submission came from a real browser.</li>
              </ul>

              <Endpoint method="OPTIONS" path="/api/v1/submit" description="CORS preflight response for the submission endpoint." auth={false} />
            </section>
          )}

          {/* Billing */}
          {activeSection === 'billing' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Billing</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Billing endpoints handle subscription management through Stripe. These are used by the
                dashboard UI and are authenticated via session cookies (not API keys).
              </p>

              <Endpoint method="POST" path="/api/v1/billing/checkout" description="Create a Stripe Checkout session for plan subscription or upgrade." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Request Body</h3>
              <ParamTable params={[
                { name: 'planId', type: 'string', required: true, description: 'Plan to subscribe to: starter, pro, or agency' },
                { name: 'interval', type: 'string', required: true, description: 'Billing interval: monthly or yearly' },
              ]} />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Response</h3>
              <CodeBlock>{`{
  "url": "https://checkout.stripe.com/c/pay/...",
  "type": "checkout",
  "plan": "Pro"
}`}</CodeBlock>

              <Endpoint method="POST" path="/api/v1/billing/portal" description="Create a Stripe Billing Portal session for managing payment methods, invoices, and cancellation." />
              <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">Response</h3>
              <CodeBlock>{`{
  "url": "https://billing.stripe.com/p/session/..."
}`}</CodeBlock>
            </section>
          )}

          {/* Webhooks */}
          {activeSection === 'webhooks' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Webhooks</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Webhooks allow you to receive real-time notifications when events occur in your account.
                Configure webhook endpoints from{' '}
                <Link href="/dashboard/settings/api" className="text-signal hover:text-signal-hover transition-colors duration-fast">
                  Settings &gt; API
                </Link>.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Supported Events</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2 pr-4 font-medium text-ink">Event</th>
                      <th className="py-2 font-medium text-ink">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">submission.created</td>
                      <td className="py-2 text-xs text-stone">A new widget submission was received</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">submission.updated</td>
                      <td className="py-2 text-xs text-stone">A submission status or notes were updated</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">lead.qualified</td>
                      <td className="py-2 text-xs text-stone">A lead was marked as qualified</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">lead.converted</td>
                      <td className="py-2 text-xs text-stone">A lead was marked as converted</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Webhook Payload</h3>
              <CodeBlock>{`{
  "event": "submission.created",
  "timestamp": "2026-03-15T14:30:00Z",
  "data": {
    "id": "uuid",
    "visitor_name": "Jane Smith",
    "visitor_email": "jane@example.com",
    "lead_score": 85,
    "lead_tier": "hot",
    "widget_id": "uuid",
    "answers": [...]
  }
}`}</CodeBlock>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Signature Verification</h3>
              <p className="text-sm text-stone">
                Each webhook request includes an <code className="text-xs bg-surface-alt px-1 py-0.5 rounded font-mono">X-HawkLeads-Signature</code> header
                containing an HMAC-SHA256 signature of the request body using your webhook secret. Always verify
                this signature before processing the payload.
              </p>
              <CodeBlock>{`const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</CodeBlock>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Retry Policy</h3>
              <p className="text-sm text-stone">
                Webhook deliveries that receive a non-2xx response or time out (10 seconds) are retried
                up to 3 times with exponential backoff (30s, 5min, 30min). After 3 consecutive failures,
                the endpoint is marked as failing and you will receive an email notification. Endpoints
                with 10 consecutive failures are automatically disabled.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Requirements</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-2 text-sm text-stone">
                <li>Webhook URLs must use HTTPS</li>
                <li>URLs must not point to localhost or private IP ranges</li>
                <li>Your endpoint must respond within 10 seconds</li>
                <li>Your endpoint must return a 2xx status code to acknowledge receipt</li>
              </ul>
            </section>
          )}

          {/* Errors */}
          {activeSection === 'errors' && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink">Errors</h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                The API uses standard HTTP status codes and returns consistent JSON error objects.
              </p>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Error Response Format</h3>
              <CodeBlock>{`{
  "error": "Human-readable error message",
  "details": { ... }  // Optional: field-level validation errors
}`}</CodeBlock>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Status Codes</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2 pr-4 font-medium text-ink">Code</th>
                      <th className="py-2 pr-4 font-medium text-ink">Meaning</th>
                      <th className="py-2 font-medium text-ink">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">200</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">OK</td>
                      <td className="py-2 text-xs text-stone">Request succeeded</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">201</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Created</td>
                      <td className="py-2 text-xs text-stone">Resource created successfully</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">400</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Bad Request</td>
                      <td className="py-2 text-xs text-stone">Invalid request body or parameters. Check the details field for specifics.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">401</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Unauthorized</td>
                      <td className="py-2 text-xs text-stone">Missing or invalid API key</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">403</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Forbidden</td>
                      <td className="py-2 text-xs text-stone">Insufficient permissions or plan limits exceeded</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">404</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Not Found</td>
                      <td className="py-2 text-xs text-stone">Resource does not exist or you do not have access</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">429</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Too Many Requests</td>
                      <td className="py-2 text-xs text-stone">Rate limit exceeded. Check Retry-After header.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">500</td>
                      <td className="py-2 pr-4 text-xs text-ink font-medium">Internal Server Error</td>
                      <td className="py-2 text-xs text-stone">An unexpected error occurred. Contact support if persistent.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-body text-sm font-semibold text-ink mt-6 mb-1">Validation Error Example</h3>
              <CodeBlock>{`// 400 Bad Request
{
  "error": "Validation failed",
  "details": {
    "name": ["String must contain at least 1 character(s)"],
    "domain": ["String must contain at most 253 character(s)"]
  }
}`}</CodeBlock>
            </section>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
