'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface WebhookEndpoint {
  readonly id: string;
  readonly url: string;
  readonly events: string[];
  readonly is_active: boolean;
  readonly last_triggered_at: string | null;
  readonly last_status_code: number | null;
  readonly failure_count: number;
  readonly created_at: string;
}

interface LogEntry {
  readonly id: string;
  readonly event: string;
  readonly response_status: number | null;
  readonly duration_ms: number | null;
  readonly success: boolean;
  readonly error_message: string | null;
  readonly created_at: string;
}

const WEBHOOK_EVENTS = [
  { value: 'submission.created', label: 'New Submission' },
  { value: 'submission.updated', label: 'Submission Updated' },
  { value: 'lead.qualified', label: 'Lead Qualified' },
  { value: 'lead.converted', label: 'Lead Converted' },
] as const;

export default function IntegrationsPage(): React.ReactElement {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadEndpoints(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('members')
          .select('account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        const { data } = await supabase
          .from('webhook_endpoints')
          .select('id, url, events, is_active, last_triggered_at, last_status_code, failure_count, created_at')
          .eq('account_id', memberData.account_id)
          .order('created_at', { ascending: false });

        setEndpoints((data as WebhookEndpoint[]) ?? []);
      } catch {
        // Failed to load endpoints
      } finally {
        setLoading(false);
      }
    }
    void loadEndpoints();
  }, []);

  async function loadLogs(endpointId: string): Promise<void> {
    setSelectedEndpointId(endpointId);
    setLogsLoading(true);
    setLogs([]);
    try {
      const response = await fetch(`/api/v1/webhooks/${endpointId}/logs?limit=20`);
      if (response.ok) {
        const result = await response.json() as { data: LogEntry[] };
        setLogs(result.data);
      }
    } catch {
      // Failed to load logs
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleTest(endpointId: string): Promise<void> {
    setTestingId(endpointId);
    setTestResult(null);
    try {
      const response = await fetch(`/api/v1/webhooks/${endpointId}/test`, { method: 'POST' });
      const result = await response.json() as { success: boolean; responseStatus: number; errorMessage: string | null };
      if (result.success) {
        setTestResult({ success: true, message: `Delivered. Status: ${String(result.responseStatus)}` });
      } else {
        setTestResult({ success: false, message: result.errorMessage ?? `Failed with status ${String(result.responseStatus)}` });
      }
    } catch {
      setTestResult({ success: false, message: 'Network error sending test webhook' });
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div>
      <h1 className="page-heading">Integrations</h1>
      <p className="mt-1 text-sm text-stone font-body">
        Connect HawkLeads to your tools via webhooks. Works with Zapier, Make, and custom integrations.
      </p>

      {/* Webhook Documentation */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Webhook Events</h2>
        <p className="mt-1 text-sm text-stone font-body">
          HawkLeads sends POST requests to your configured URLs when events occur.
          Each request includes an HMAC-SHA256 signature in the X-HawkLeads-Signature header.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WEBHOOK_EVENTS.map((event) => (
            <div key={event.value} className="card p-4">
              <code className="text-xs font-mono text-signal">{event.value}</code>
              <p className="mt-1 text-sm text-ink font-body">{event.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 card p-4">
          <h3 className="font-display text-sm font-semibold text-ink">Payload Format</h3>
          <pre className="mt-2 text-xs font-mono text-stone bg-surface-alt p-3 rounded-sm overflow-x-auto">
{`{
  "event": "submission.created",
  "data": {
    "submissionId": "uuid",
    "widgetId": "uuid",
    "visitorName": "Jane Doe",
    "visitorEmail": "jane@example.com",
    "leadTier": "hot",
    "leadScore": 85,
    "answers": [...],
    "createdAt": "2026-03-18T..."
  },
  "timestamp": "2026-03-18T..."
}`}
          </pre>
        </div>
      </section>

      {/* Configured Endpoints */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Webhook Endpoints</h2>
          <Link href="/dashboard/settings" className="btn-secondary text-sm">
            Manage in Settings
          </Link>
        </div>

        {testResult !== null && (
          <div className={`mt-4 p-3 rounded-sm text-sm border ${
            testResult.success
              ? 'bg-success-light text-success border-success/20'
              : 'bg-danger-light text-danger border-danger/20'
          }`}>
            {testResult.message}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-64" />
                <div className="mt-2 skeleton h-3 w-40" />
              </div>
            ))
          ) : endpoints.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-sm text-stone">No webhook endpoints configured.</p>
              <Link href="/dashboard/settings" className="mt-2 inline-block text-sm text-signal hover:text-signal/80 transition-colors duration-fast">
                Add one in Settings
              </Link>
            </div>
          ) : (
            endpoints.map((ep) => (
              <div key={ep.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${ep.is_active ? 'bg-success' : 'bg-stone-light'}`} />
                      <code className="text-sm font-mono text-ink truncate">{ep.url}</code>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ep.events.map((evt) => (
                        <span key={evt} className="text-xs px-1.5 py-0.5 rounded-pill bg-surface-alt text-stone font-mono">
                          {evt}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-stone">
                      {ep.last_triggered_at !== null && (
                        <span>Last triggered: {new Date(ep.last_triggered_at).toLocaleString()}</span>
                      )}
                      {ep.last_status_code !== null && (
                        <span className={ep.last_status_code >= 200 && ep.last_status_code < 300 ? 'text-success' : 'text-danger'}>
                          Status: {ep.last_status_code}
                        </span>
                      )}
                      {ep.failure_count > 0 && (
                        <span className="text-danger">Failures: {ep.failure_count}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleTest(ep.id)}
                      disabled={testingId === ep.id}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {testingId === ep.id ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="spinner w-3 h-3" />
                          Testing...
                        </span>
                      ) : 'Send Test'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void loadLogs(ep.id)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Event Log */}
      {selectedEndpointId !== null && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Event Log</h2>
            <button
              type="button"
              onClick={() => { setSelectedEndpointId(null); setLogs([]); }}
              className="text-sm text-stone hover:text-ink transition-colors duration-fast"
            >
              Close
            </button>
          </div>
          <div className="mt-4">
            {logsLoading ? (
              <div className="card p-6 text-center">
                <span className="spinner w-5 h-5" />
              </div>
            ) : logs.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-stone">No delivery attempts recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left py-3 px-4 font-medium">Event</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Duration</th>
                      <th className="text-left py-3 px-4 font-medium">Result</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="table-row">
                        <td className="py-3 px-4">
                          <code className="text-xs font-mono">{log.event}</code>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium ${
                            log.response_status !== null && log.response_status >= 200 && log.response_status < 300
                              ? 'text-success'
                              : 'text-danger'
                          }`}>
                            {log.response_status ?? 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone">
                          {log.duration_ms !== null ? `${String(log.duration_ms)}ms` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {log.success ? (
                            <span className="text-xs text-success">Delivered</span>
                          ) : (
                            <span className="text-xs text-danger" title={log.error_message ?? 'Failed'}>
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Zapier / Make Instructions */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Connect with Zapier or Make</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Zapier</h3>
            <ol className="mt-3 space-y-2 text-sm text-stone font-body list-decimal list-inside">
              <li>Create a new Zap and choose "Webhooks by Zapier" as the trigger</li>
              <li>Select "Catch Hook" as the trigger event</li>
              <li>Copy the webhook URL provided by Zapier</li>
              <li>Add it as a webhook endpoint in your HawkLeads settings</li>
              <li>Use the "Send Test" button to verify the connection</li>
              <li>Configure your Zapier actions (CRM, email, Slack, etc.)</li>
            </ol>
          </div>
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Make (Integromat)</h3>
            <ol className="mt-3 space-y-2 text-sm text-stone font-body list-decimal list-inside">
              <li>Create a new scenario and add a "Custom webhook" module</li>
              <li>Copy the webhook URL provided by Make</li>
              <li>Add it as a webhook endpoint in your HawkLeads settings</li>
              <li>Use the "Send Test" button to send sample data</li>
              <li>Make will automatically detect the data structure</li>
              <li>Add your desired action modules to the scenario</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
