'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { FormEvent } from 'react';

export default function SignupPage(): React.ReactElement {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setEmailSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-stone">
          We sent a verification link to <span className="font-medium text-ink">{email}</span>.
          Click the link in the email to verify your account and get started.
        </p>
        <p className="mt-6 text-center text-sm text-stone">
          Already verified?{' '}
          <Link
            href="/login"
            className="text-signal hover:text-signal-hover font-medium transition-colors duration-fast"
          >
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Create your SignalBox account
      </h1>
      <p className="mt-2 text-sm text-stone">
        14-day free trial. No credit card required.
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
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-stone-light text-center">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="text-signal hover:text-signal-hover">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-signal hover:text-signal-hover">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-sm text-stone">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-signal hover:text-signal-hover font-medium transition-colors duration-fast"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
