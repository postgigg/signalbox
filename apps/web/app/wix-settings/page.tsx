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
    <div className="max-w-[520px] mx-auto px-6 py-8 font-body">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
            <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
            <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-ink">HawkLeads</h1>
          <p className="text-xs text-stone">Score every lead on your Wix site</p>
        </div>
      </div>

      {/* Loading */}
      {state.status === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="spinner w-5 h-5" />
          <p className="text-sm text-stone">Loading...</p>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div className="p-4 rounded-md bg-danger-light border border-danger/20">
          <p className="text-sm text-danger">{state.message}</p>
        </div>
      )}

      {/* No Account — send them to signup */}
      {state.status === 'no-account' && (
        <div>
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold text-ink">Get started with HawkLeads</h2>
            <p className="mt-2 text-sm text-stone leading-relaxed">
              Create your free HawkLeads account to start scoring leads on your Wix site.
              Set up takes two minutes. No credit card required.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/signup"
                target="_blank"
                className="btn-primary text-center"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                target="_blank"
                className="btn-secondary text-center"
              >
                I Already Have an Account
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone text-center">
            After signing up, create a widget and come back here to connect it.
          </p>
        </div>
      )}

      {/* Has Account, No Widgets — send them to create one */}
      {state.status === 'no-widgets' && (
        <div>
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold text-ink">Create your first widget</h2>
            <p className="mt-2 text-sm text-stone leading-relaxed">
              Your HawkLeads account is connected. Now create a widget with qualifying
              questions. Pick a template or start from scratch.
            </p>
            <div className="mt-5">
              <Link
                href="/dashboard/widgets/new"
                target="_blank"
                className="btn-primary text-center w-full block"
              >
                Create Widget
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone text-center">
            After creating a widget, refresh this page to connect it to your Wix site.
          </p>
        </div>
      )}

      {/* Has Widgets — pick one */}
      {state.status === 'loaded' && (
        <div>
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold text-ink">Connect a widget</h2>
            <p className="mt-2 text-sm text-stone">
              Choose which qualifying flow to show on this Wix site.
            </p>

            <label htmlFor="widget-select" className="block text-sm font-medium text-ink mt-4 mb-1.5">
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
                className="btn-primary"
                disabled={!selectedWidgetId}
                onClick={() => void handleSave()}
              >
                Save
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
        </div>
      )}

      {/* Saving */}
      {state.status === 'saving' && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="spinner w-5 h-5" />
          <p className="text-sm text-stone">Saving...</p>
        </div>
      )}

      {/* Saved */}
      {state.status === 'saved' && (
        <div>
          <div className="p-4 rounded-md bg-success-light border border-success/20">
            <p className="text-sm font-medium text-success">Widget connected to your Wix site.</p>
            <p className="text-xs text-stone mt-1">
              The qualifying flow will appear on your site within 60 seconds.
            </p>
          </div>
          <div className="mt-4 flex gap-3">
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
      )}
    </div>
  );
}
