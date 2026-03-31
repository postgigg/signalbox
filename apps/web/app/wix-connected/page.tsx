'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type ConnectState = 'linking' | 'success' | 'error';

export default function WixConnectedPage(): React.ReactElement {
  const [state, setState] = useState<ConnectState>('linking');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const instanceId = params.get('wix_instance');

    if (!instanceId) {
      setState('error');
      setErrorMsg('Missing Wix instance. Go back to your Wix dashboard and try again.');
      return;
    }

    fetch('/api/v1/integrations/wix/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const msg = typeof body === 'object' && body !== null && 'error' in body
            ? String((body as Record<string, unknown>).error)
            : 'Failed to connect.';
          setState('error');
          setErrorMsg(msg);
          return;
        }
        setState('success');
      })
      .catch(() => {
        setState('error');
        setErrorMsg('Network error. Try again.');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M6 24 L16 6 L16 42 Z" fill="#FFFFFF" opacity="0.3" />
              <path d="M12 24 L20 10 L20 38 Z" fill="#FFFFFF" opacity="0.5" />
              <path d="M18 24 L26 12 L26 36 Z" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold text-ink">HawkLeads</span>
        </div>

        {state === 'linking' && (
          <div>
            <div className="spinner w-6 h-6 mx-auto" />
            <p className="mt-4 text-sm text-stone">Connecting your Wix site...</p>
          </div>
        )}

        {state === 'success' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-success-light border border-success/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">Connected to Wix.</h1>
            <p className="mt-3 text-sm text-stone leading-relaxed">
              Your HawkLeads account is now linked to your Wix site. Go back to your Wix dashboard, open the HawkLeads app, and select a widget to start scoring leads.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="btn-primary text-center h-11 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
              <p className="text-xs text-stone">
                Or close this tab and go back to Wix.
              </p>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div>
            <div className="p-5 rounded-md bg-danger-light border border-danger/20 mb-4">
              <p className="text-sm text-danger">{errorMsg}</p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
