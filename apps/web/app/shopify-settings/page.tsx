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
// Inline styles for iframe context (no marketing header/footer)
// ---------------------------------------------------------------------------

const STYLES = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'var(--font-body)',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
  } as const,
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.15,
    color: 'var(--sb-ink)',
    margin: 0,
  } as const,
  subtext: {
    fontSize: '14px',
    color: 'var(--sb-stone)',
    marginTop: '8px',
  } as const,
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
    color: 'var(--sb-ink)',
  } as const,
  select: {
    width: '100%',
    height: '44px',
    padding: '0 12px',
    border: '1px solid var(--sb-border)',
    borderRadius: '6px',
    background: 'var(--sb-surface)',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: 'var(--sb-ink)',
    cursor: 'pointer',
  } as const,
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    padding: '0 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'var(--sb-ink)',
    color: '#FFFFFF',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  card: {
    border: '1px solid var(--sb-border)',
    borderRadius: '8px',
    padding: '16px',
    background: 'var(--sb-surface)',
    marginTop: '16px',
  } as const,
  previewLabel: {
    fontSize: '12px',
    color: 'var(--sb-stone-light)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as const,
  previewName: {
    fontSize: '14px',
    fontWeight: 500,
    marginTop: '4px',
    color: 'var(--sb-ink)',
  } as const,
  previewMeta: {
    fontSize: '12px',
    color: 'var(--sb-stone)',
    marginTop: '2px',
  } as const,
  successCard: {
    border: '1px solid var(--sb-success)',
    borderRadius: '8px',
    padding: '16px',
    background: 'var(--sb-success-light)',
  } as const,
  successText: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--sb-success)',
    margin: 0,
  } as const,
  successDetail: {
    fontSize: '13px',
    color: 'var(--sb-stone)',
    marginTop: '4px',
  } as const,
  errorCard: {
    border: '1px solid var(--sb-danger)',
    borderRadius: '8px',
    padding: '16px',
    background: 'var(--sb-danger-light)',
  } as const,
  errorText: {
    fontSize: '14px',
    color: 'var(--sb-danger)',
    margin: 0,
  } as const,
  emptyCard: {
    border: '1px solid var(--sb-border)',
    borderRadius: '8px',
    padding: '24px',
    background: 'var(--sb-surface)',
    textAlign: 'center' as const,
  } as const,
  emptyText: {
    fontSize: '14px',
    color: 'var(--sb-stone)',
    margin: 0,
  } as const,
  link: {
    color: 'var(--sb-signal)',
    textDecoration: 'none',
    fontWeight: 500,
  } as const,
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    padding: '40px 0',
  } as const,
  divider: {
    height: '1px',
    background: 'var(--sb-border)',
    margin: '20px 0',
  } as const,
} as const;

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
            // Pre-select the currently-connected widget or the first one
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
    <div style={STYLES.container}>
      {/* Header */}
      <div style={STYLES.header}>
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#0F172A" />
          <path d="M8 12L16 8L24 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16L16 12L24 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 20L16 16L24 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 style={STYLES.heading}>HawkLeads Settings</h1>
      </div>

      {/* Loading State */}
      {state.status === 'loading' && (
        <div style={STYLES.loadingWrap}>
          <div className="spinner" style={{ width: '20px', height: '20px' }} />
          <p style={STYLES.subtext}>Loading your widgets...</p>
        </div>
      )}

      {/* Error State */}
      {state.status === 'error' && (
        <div style={STYLES.errorCard}>
          <p style={STYLES.errorText}>{state.message}</p>
        </div>
      )}

      {/* No Widgets State */}
      {state.status === 'no-widgets' && (
        <div style={STYLES.emptyCard}>
          <p style={STYLES.emptyText}>
            You need to create a widget first.
          </p>
          <p style={{ marginTop: '12px' }}>
            <a
              href="https://hawkleads.io/dashboard/widgets/new"
              target="_blank"
              rel="noopener noreferrer"
              style={STYLES.link}
            >
              Open HawkLeads Dashboard
            </a>
          </p>
        </div>
      )}

      {/* Loaded State */}
      {state.status === 'loaded' && (
        <div>
          <label htmlFor="widget-select" style={STYLES.label}>
            Select which widget to embed on this store
          </label>
          <select
            id="widget-select"
            style={STYLES.select}
            value={selectedWidgetId}
            onChange={(e) => setSelectedWidgetId(e.target.value)}
          >
            {state.widgets.map((widget) => (
              <option key={widget.id} value={widget.id}>
                {widget.name}
              </option>
            ))}
          </select>

          {/* Widget Preview */}
          {selectedWidgetId && (
            <div style={STYLES.card}>
              <p style={STYLES.previewLabel}>Selected widget</p>
              <p style={STYLES.previewName}>
                {state.widgets.find((w) => w.id === selectedWidgetId)?.name ?? 'Unknown'}
              </p>
              <p style={STYLES.previewMeta}>
                {state.widgets.find((w) => w.id === selectedWidgetId)?.steps_count ?? 0} steps
              </p>
            </div>
          )}

          <div style={STYLES.divider} />

          <button
            type="button"
            style={{
              ...STYLES.btnPrimary,
              opacity: selectedWidgetId ? 1 : 0.5,
              cursor: selectedWidgetId ? 'pointer' : 'not-allowed',
            }}
            disabled={!selectedWidgetId}
            onClick={() => void handleSave()}
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Saving State */}
      {state.status === 'saving' && (
        <div style={STYLES.loadingWrap}>
          <div className="spinner" style={{ width: '20px', height: '20px' }} />
          <p style={STYLES.subtext}>Saving your settings...</p>
        </div>
      )}

      {/* Saved State */}
      {state.status === 'saved' && (
        <div style={STYLES.successCard}>
          <p style={STYLES.successText}>Widget connected.</p>
          <p style={STYLES.successDetail}>
            The qualifying flow will appear on your storefront within 60 seconds.
          </p>
        </div>
      )}
    </div>
  );
}
