'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { FormEvent } from 'react';

export default function ResetPasswordPage(): React.ReactElement {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-stone">
          Your password has been reset. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-stone">
        Enter a new password for your account.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="input-label">
            New password
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
            Confirm new password
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
              Updating...
            </span>
          ) : 'Update Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone">
        <Link
          href="/login"
          className="text-signal hover:text-signal-hover font-medium transition-colors duration-fast"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
