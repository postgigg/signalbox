'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import type { FormEvent } from 'react';

export default function ResetPasswordPage(): React.ReactElement {
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Check for valid session on mount
  useEffect(() => {
    async function checkSession(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setHasSession(false);
        } else {
          setHasSession(true);
        }
      } catch {
        setHasSession(false);
      }
      setSessionChecked(true);
    }
    void checkSession();
  }, []);

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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

      // Verify session is still valid before updating
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Your reset session has expired. Please request a new password reset link.');
        setHasSession(false);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      redirectTimerRef.current = setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-stone">
          Verifying your reset link...
        </p>
      </div>
    );
  }

  // No valid session
  if (!hasSession) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Reset link expired
        </h1>
        <p className="mt-2 text-sm text-stone">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="btn-primary mt-6 w-full text-center inline-block"
        >
          Request New Reset Link
        </Link>
        <p className="mt-4 text-center text-sm text-stone">
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
