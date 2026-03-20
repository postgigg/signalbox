import Link from 'next/link';

import { Logo } from '@/components/shared/Logo';

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="h-16 flex items-center px-6">
        <Link href="/" className="no-underline">
          <Logo size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
