'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { safeRedirectUrl } from '@/lib/safe-redirect';

import type { FormEvent } from 'react';

interface LoginResponse {
  readonly success?: boolean;
  readonly error?: string;
}

async function serverLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<LoginResponse>;
}

export default function LoginPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-stone">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm(): React.ReactElement {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectUrl(searchParams.get('redirect') ?? '/', '/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await serverLogin(email, password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.href = redirectTo === '/' ? '/dashboard' : redirectTo;
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleDemoLogin(): Promise<void> {
    setError(null);
    setDemoLoading(true);

    try {
      const result = await serverLogin('demo@signalbox.io', 'demodemo123');

      if (result.error) {
        setError(result.error);
        setDemoLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
      setDemoLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Log in to SignalBox</h1>
      <p className="mt-2 text-sm text-stone">
        Welcome back. Enter your credentials to continue.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="input-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-signal hover:text-signal-hover transition-colors duration-fast"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-12"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="spinner w-4 h-4" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface px-2 text-stone-light">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading}
        className="mt-6 btn-secondary w-full h-12"
      >
        {demoLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="spinner w-4 h-4" />
            Loading demo...
          </span>
        ) : (
          'Try Demo Account'
        )}
      </button>
      <p className="mt-2 text-center text-xs text-stone-light">
        Pre-loaded with sample leads and a scored widget.
      </p>

      <p className="mt-6 text-center text-sm text-stone">
        No account yet?{' '}
        <Link
          href="/signup"
          className="text-signal hover:text-signal-hover font-medium transition-colors duration-fast"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
