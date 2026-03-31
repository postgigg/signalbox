'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WixWidget {
  readonly id: string;
  readonly name: string;
  readonly steps_count: number;
}

interface SettingsData {
  readonly widgets: readonly WixWidget[];
  readonly selectedWidgetId: string | null;
  readonly hasAccount: boolean;
}

type SettingsState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'no-account' }
  | { readonly status: 'no-widgets' }
  | { readonly status: 'loaded'; readonly widgets: readonly WixWidget[] }
  | { readonly status: 'saving' }
  | { readonly status: 'saved' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeWixInstance(instanceParam: string): string | null {
  try {
    const parts = instanceParam.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    if (!payload) return null;
    const decoded = atob(payload);
    const parsed: unknown = JSON.parse(decoded);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'instanceId' in parsed &&
      typeof (parsed as Record<string, unknown>).instanceId === 'string'
    ) {
      return String((parsed as Record<string, unknown>).instanceId);
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WixSettingsPage(): React.ReactElement {
  const [state, setState] = useState<SettingsState>({ status: 'loading' });
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');
  const [instanceId, setInstanceId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const instanceParam = params.get('instance');

    if (!instanceParam) {
      setState({ status: 'error', message: 'Missing Wix instance parameter. Open this page from the Wix dashboard.' });
      return;
    }

    const decoded = decodeWixInstance(instanceParam);
    if (!decoded) {
      setState({ status: 'error', message: 'Could not decode Wix instance. Try reinstalling the app.' });
      return;
    }

    setInstanceId(decoded);

    fetch(`/api/v1/integrations/wix/settings?instanceId=${encodeURIComponent(decoded)}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState({ status: 'no-account' });
          return;
        }
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            typeof body === 'object' && body !== null && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
              ? String((body as Record<string, unknown>).error)
              : 'Failed to load settings.';
          setState({ status: 'error', message });
          return;
        }
        const data = (await res.json()) as SettingsData;
        if (!data.hasAccount) {
          setState({ status: 'no-account' });
        } else if (data.widgets.length === 0) {
          setState({ status: 'no-widgets' });
        } else {
          setState({ status: 'loaded', widgets: data.widgets });
          setSelectedWidgetId(data.selectedWidgetId ?? data.widgets[0]?.id ?? '');
        }
      })
      .catch(() => {
        setState({ status: 'error', message: 'Network error. Check your connection and try again.' });
      });
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!selectedWidgetId || !instanceId) return;
    setState({ status: 'saving' });
    try {
      const res = await fetch('/api/v1/integrations/wix/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId, widgetId: selectedWidgetId }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          typeof body === 'object' && body !== null && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
            ? String((body as Record<string, unknown>).error)
            : 'Failed to save settings.';
        setState({ status: 'error', message });
        return;
      }
      setState({ status: 'saved' });
    } catch {
      setState({ status: 'error', message: 'Network error. Check your connection and try again.' });
    }
  }, [selectedWidgetId, instanceId]);

  return (
    <div className="min-h-screen bg-paper font-body">
      {/* Loading */}
      {state.status === 'loading' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="spinner w-6 h-6" />
            <p className="text-sm text-stone">Loading...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div className="p-8">
          <div className="max-w-lg mx-auto p-5 rounded-md bg-danger-light border border-danger/20">
            <p className="text-sm text-danger font-medium">{state.message}</p>
          </div>
        </div>
      )}

      {/* No Account */}
      {state.status === 'no-account' && (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: CTA */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
                    <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
                    <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
                  </svg>
                </div>
                <span className="font-display text-lg font-semibold text-ink">HawkLeads</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-ink leading-tight">
                Score every lead on your Wix site.
              </h1>
              <p className="mt-3 text-sm text-stone leading-relaxed">
                Replace your contact form with a qualifying flow. Visitors answer budget, timeline, and service questions. Every lead gets a 0 to 100 score. You know who to call first.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/signup?wix_instance=${encodeURIComponent(instanceId)}&plan=free`}
                  target="_blank"
                  className="btn-primary text-center h-11 flex items-center justify-center"
                >
                  Create Free Account
                </Link>
                <Link
                  href={`/login?wix_instance=${encodeURIComponent(instanceId)}`}
                  target="_blank"
                  className="btn-secondary text-center h-11 flex items-center justify-center"
                >
                  I Already Have an Account
                </Link>
              </div>
              <p className="mt-4 text-xs text-stone">
                Free plan: 10 leads/month. No credit card. After signing up, refresh this page to connect your widget.
              </p>
            </div>

            {/* Right: Illustration */}
            <div className="hidden lg:block">
              <div className="border border-border rounded-md overflow-hidden bg-surface">
                <div className="bg-surface-alt px-5 py-3 border-b border-border">
                  <p className="text-xs text-stone font-medium">Your leads, sorted by score</p>
                </div>
                <div className="px-5 py-3 border-b border-border bg-red-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Sarah Mitchell</p>
                    <p className="text-xs text-stone mt-0.5">$10k+ / This week / Plumbing</p>
                  </div>
                  <span className="bg-red-500 text-white font-mono text-xs font-bold px-3 py-1 rounded-md">84</span>
                </div>
                <div className="px-5 py-3 border-b border-border bg-amber-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">James Rivera</p>
                    <p className="text-xs text-stone mt-0.5">$3-5k / Next month / HVAC</p>
                  </div>
                  <span className="bg-amber-500 text-white font-mono text-xs font-bold px-3 py-1 rounded-md">61</span>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Alex Thompson</p>
                    <p className="text-xs text-stone mt-0.5">Under $1k / Just browsing</p>
                  </div>
                  <span className="bg-gray-400 text-white font-mono text-xs font-bold px-3 py-1 rounded-md">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Has Account, No Widgets */}
      {state.status === 'no-widgets' && (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
                    <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
                    <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
                  </svg>
                </div>
                <span className="font-display text-lg font-semibold text-ink">HawkLeads</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-ink leading-tight">
                Create your first widget.
              </h1>
              <p className="mt-3 text-sm text-stone leading-relaxed">
                Your account is connected. Now create a widget with qualifying questions. Pick a template or start from scratch. Two minutes.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/widgets/new"
                  target="_blank"
                  className="btn-primary text-center h-11 flex items-center justify-center w-full"
                >
                  Create Widget
                </Link>
              </div>
              <p className="mt-4 text-xs text-stone">
                After creating a widget, refresh this page to connect it to your Wix site.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="border border-border rounded-md overflow-hidden bg-surface">
                <div className="bg-ink px-5 py-4">
                  <p className="text-sm font-medium text-white">What service do you need?</p>
                  <p className="text-xs text-white/50 mt-1">Step 1 of 3</p>
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="border-2 border-blue-500 bg-blue-50 rounded-md px-4 py-3 text-sm text-ink font-medium">Plumbing</div>
                  <div className="border border-border rounded-md px-4 py-3 text-sm text-stone">HVAC</div>
                  <div className="border border-border rounded-md px-4 py-3 text-sm text-stone">Electrical</div>
                  <div className="border border-border rounded-md px-4 py-3 text-sm text-stone">Roofing</div>
                </div>
                <div className="px-5 pb-4 flex gap-1.5">
                  <div className="flex-1 h-1 rounded-sm bg-blue-500"></div>
                  <div className="flex-1 h-1 rounded-sm bg-gray-200"></div>
                  <div className="flex-1 h-1 rounded-sm bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Has Widgets */}
      {state.status === 'loaded' && (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
                    <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
                    <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
                  </svg>
                </div>
                <span className="font-display text-lg font-semibold text-ink">HawkLeads</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-ink leading-tight">
                Connect a widget to this site.
              </h1>
              <p className="mt-3 text-sm text-stone leading-relaxed">
                Choose which qualifying flow to show on your Wix site. Visitors will see the widget as a floating button.
              </p>

              <label htmlFor="widget-select" className="block text-sm font-medium text-ink mt-6 mb-1.5">
                Widget
              </label>
              <select
                id="widget-select"
                className="input-field w-full h-11"
                value={selectedWidgetId}
                onChange={(e) => setSelectedWidgetId(e.target.value)}
              >
                {state.widgets.map((widget) => (
                  <option key={widget.id} value={widget.id}>
                    {widget.name} ({widget.steps_count} steps)
                  </option>
                ))}
              </select>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  className="btn-primary h-11 px-8"
                  disabled={!selectedWidgetId}
                  onClick={() => void handleSave()}
                >
                  Connect Widget
                </button>
                <Link
                  href="/dashboard/widgets"
                  target="_blank"
                  className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast"
                >
                  Manage Widgets
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="border border-border rounded-md overflow-hidden bg-surface">
                <div className="bg-surface-alt px-5 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs text-stone font-medium">Widget Preview</p>
                  <span className="text-xs text-success font-medium">Connected</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                        <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
                        <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
                        <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {state.widgets.find((w) => w.id === selectedWidgetId)?.name ?? 'Select a widget'}
                      </p>
                      <p className="text-xs text-stone">
                        {state.widgets.find((w) => w.id === selectedWidgetId)?.steps_count ?? 0} qualifying steps
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                      <span className="text-xs text-stone">Status</span>
                      <span className="text-xs font-medium text-success">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                      <span className="text-xs text-stone">Position</span>
                      <span className="text-xs font-medium text-ink">Bottom right</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                      <span className="text-xs text-stone">Scoring</span>
                      <span className="text-xs font-medium text-ink">0 to 100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saving */}
      {state.status === 'saving' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="spinner w-6 h-6" />
            <p className="text-sm text-stone">Connecting widget...</p>
          </div>
        </div>
      )}

      {/* Saved */}
      {state.status === 'saved' && (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-lg text-center">
            <div className="w-14 h-14 rounded-full bg-success-light border border-success/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink">Widget connected.</h2>
            <p className="mt-2 text-sm text-stone">
              The qualifying flow will appear on your Wix site within 60 seconds. Every submission will be scored and delivered to your dashboard.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/dashboard"
                target="_blank"
                className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast"
              >
                Open Dashboard
              </Link>
              <Link
                href="/dashboard/leads"
                target="_blank"
                className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast"
              >
                View Leads
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
