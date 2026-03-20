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
  const [googleLoading, setGoogleLoading] = useState(false);

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
      const result = await serverLogin('demo@hawkleads.io', 'demodemo123');

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

  async function handleGoogleLogin(): Promise<void> {
    setError(null);
    setGoogleLoading(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?type=signup`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to start Google sign-in.');
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Log in to HawkLeads</h1>
      <p className="mt-2 text-sm text-stone">
        Welcome back. Enter your credentials to continue.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleGoogleLogin()}
        disabled={googleLoading}
        className="mt-6 w-full h-12 flex items-center justify-center gap-3 rounded-md border border-border bg-white text-sm font-medium text-ink transition-colors duration-fast hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
      >
        {googleLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="spinner w-4 h-4" />
            Connecting...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface px-2 text-stone-light">or sign in with email</span>
        </div>
      </div>

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

      <button
        type="button"
        onClick={() => void handleDemoLogin()}
        disabled={demoLoading}
        className="mt-4 btn-secondary w-full h-12"
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
