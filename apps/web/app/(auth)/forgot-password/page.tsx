'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { FormEvent } from 'react';

interface ForgotPasswordResponse {
  readonly success?: boolean;
  readonly error?: string;
}

export default function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        setError('Too many requests. Please try again later.');
        setLoading(false);
        return;
      }

      const data = (await response.json()) as ForgotPasswordResponse;

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-3 text-sm text-stone leading-relaxed">
          If an account exists for <span className="font-medium text-ink">{email}</span>,
          you will receive a password reset link shortly. Check your spam folder if you do
          not see it within a few minutes.
        </p>
        <Link
          href="/login"
          className="btn-secondary mt-6 w-full text-center"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-2 text-sm text-stone">
        Enter the email address associated with your account and we will send a reset link.
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-12"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone">
        Remember your password?{' '}
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
