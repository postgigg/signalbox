'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShopifyWidget {
  readonly id: string;
  readonly name: string;
  readonly steps_count: number;
}

type SettingsState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'no-widgets' }
  | { readonly status: 'loaded'; readonly widgets: readonly ShopifyWidget[] }
  | { readonly status: 'saving' }
  | { readonly status: 'saved' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShopifySettingsPage(): React.ReactElement {
  const [state, setState] = useState<SettingsState>({ status: 'loading' });
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');
  const [shop, setShop] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop');

    if (!shopParam) {
      setState({ status: 'error', message: 'Missing shop parameter. Open this page from your Shopify admin.' });
      return;
    }

    setShop(shopParam);

    fetch(`/api/v1/integrations/shopify/settings?shop=${encodeURIComponent(shopParam)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            typeof body === 'object' && body !== null && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
              ? String((body as Record<string, unknown>).error)
              : 'Failed to load settings.';
          setState({ status: 'error', message });
          return;
        }
        const data: unknown = await res.json();
        if (
          typeof data === 'object' &&
          data !== null &&
          'widgets' in data &&
          Array.isArray((data as Record<string, unknown>).widgets)
        ) {
          const widgets = (data as { widgets: ShopifyWidget[] }).widgets;
          if (widgets.length === 0) {
            setState({ status: 'no-widgets' });
          } else {
            setState({ status: 'loaded', widgets });
            if (
              'selectedWidgetId' in data &&
              typeof (data as Record<string, unknown>).selectedWidgetId === 'string'
            ) {
              setSelectedWidgetId((data as { selectedWidgetId: string }).selectedWidgetId);
            } else if (widgets[0]) {
              setSelectedWidgetId(widgets[0].id);
            }
          }
        } else {
          setState({ status: 'error', message: 'Unexpected response format.' });
        }
      })
      .catch(() => {
        setState({ status: 'error', message: 'Network error. Check your connection and try again.' });
      });
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!selectedWidgetId || !shop) return;

    setState({ status: 'saving' });

    try {
      const res = await fetch('/api/v1/integrations/shopify/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, widgetId: selectedWidgetId }),
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
  }, [selectedWidgetId, shop]);

  return (
    <div className="max-w-[480px] mx-auto px-6 py-6 font-body">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
            <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
            <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
          </svg>
        </div>
        <h1 className="font-display text-xl font-semibold text-ink">HawkLeads Settings</h1>
      </div>

      {/* Loading */}
      {state.status === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="spinner w-5 h-5" />
          <p className="text-sm text-stone">Loading your widgets...</p>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div className="p-4 rounded-md bg-danger-light border border-danger/20">
          <p className="text-sm text-danger">{state.message}</p>
        </div>
      )}

      {/* No Widgets */}
      {state.status === 'no-widgets' && (
        <div className="card text-center py-8">
          <p className="text-sm text-stone">You need to create a widget first.</p>
          <p className="mt-3">
            <a
              href="https://hawkleads.io/dashboard/widgets/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast"
            >
              Open HawkLeads Dashboard
            </a>
          </p>
        </div>
      )}

      {/* Loaded */}
      {state.status === 'loaded' && (
        <div>
          <label htmlFor="widget-select" className="block text-sm font-medium text-ink mb-1.5">
            Select which widget to embed on this store
          </label>
          <select
            id="widget-select"
            className="input-field w-full h-11"
            value={selectedWidgetId}
            onChange={(e) => setSelectedWidgetId(e.target.value)}
          >
            {state.widgets.map((widget) => (
              <option key={widget.id} value={widget.id}>
                {widget.name}
              </option>
            ))}
          </select>

          {selectedWidgetId && (
            <div className="card mt-4">
              <p className="text-xs text-stone-light uppercase tracking-wide">Selected widget</p>
              <p className="text-sm font-medium text-ink mt-1">
                {state.widgets.find((w) => w.id === selectedWidgetId)?.name ?? 'Unknown'}
              </p>
              <p className="text-xs text-stone mt-0.5">
                {state.widgets.find((w) => w.id === selectedWidgetId)?.steps_count ?? 0} steps
              </p>
            </div>
          )}

          <div className="border-t border-border my-5" />

          <button
            type="button"
            className="btn-primary"
            disabled={!selectedWidgetId}
            onClick={() => void handleSave()}
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Saving */}
      {state.status === 'saving' && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="spinner w-5 h-5" />
          <p className="text-sm text-stone">Saving your settings...</p>
        </div>
      )}

      {/* Saved */}
      {state.status === 'saved' && (
        <div className="p-4 rounded-md bg-success-light border border-success/20">
          <p className="text-sm font-medium text-success">Widget connected.</p>
          <p className="text-xs text-stone mt-1">
            The qualifying flow will appear on your storefront within 60 seconds.
          </p>
        </div>
      )}
    </div>
  );
}
