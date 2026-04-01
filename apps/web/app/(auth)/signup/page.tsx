'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import type { FormEvent } from 'react';

export default function SignupPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><span className="spinner w-6 h-6" /></div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm(): React.ReactElement {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const plan = searchParams.get('plan') ?? '';

  // Store wix_instance and plan in cookies so the auth callback can read them
  useEffect(() => {
    const wixInstance = searchParams.get('wix_instance');
    if (wixInstance) {
      document.cookie = `hawkleads_wix_instance=${encodeURIComponent(wixInstance)};path=/;max-age=3600;SameSite=Lax`;
    }
    const planParam = searchParams.get('plan');
    if (planParam) {
      document.cookie = `hawkleads_plan=${encodeURIComponent(planParam)};path=/;max-age=3600;SameSite=Lax`;
    }
  }, [searchParams]);

  async function handleGoogleSignup(): Promise<void> {
    setError(null);
    setGoogleLoading(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const wixInstance = searchParams.get('wix_instance') ?? '';
      const callbackParams = [
        'type=signup',
        wixInstance ? `wix_instance=${encodeURIComponent(wixInstance)}` : '',
        plan ? `plan=${encodeURIComponent(plan)}` : '',
      ].filter(Boolean).join('&');

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?${callbackParams}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to start Google sign-up.');
      setGoogleLoading(false);
    }
  }

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

      const wixInst = searchParams.get('wix_instance') ?? '';
      const cbParams = [
        'type=signup',
        wixInst ? `wix_instance=${encodeURIComponent(wixInst)}` : '',
        plan ? `plan=${encodeURIComponent(plan)}` : '',
      ].filter(Boolean).join('&');

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?${cbParams}`,
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
        Create your HawkLeads account
      </h1>
      <p className="mt-2 text-sm text-stone">
        {plan === 'free'
          ? 'Free forever. 10 leads per month.'
          : '30-day free trial. No credit card required.'}
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleGoogleSignup()}
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
          <span className="bg-surface px-2 text-stone-light">or sign up with email</span>
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
