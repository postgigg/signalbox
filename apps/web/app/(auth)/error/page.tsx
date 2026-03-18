'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error_description')
    ?? searchParams.get('error')
    ?? 'An unexpected error occurred during authentication.';

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Authentication error
      </h1>
      <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
        {errorMessage}
      </div>
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

export default function AuthErrorPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Authentication error
          </h1>
          <p className="mt-2 text-sm text-stone">Loading error details...</p>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
