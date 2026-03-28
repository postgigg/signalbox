import Link from 'next/link';

import { Logo } from '@/components/shared/Logo';
import { AuthBrandPanel } from './_components/AuthBrandPanel';

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex">
      {/* Left column: brand visual — hidden on mobile, 50% desktop */}
      <AuthBrandPanel />

      {/* Right column: form — full width mobile, 50% desktop */}
      <div className="flex-1 flex flex-col bg-paper min-h-screen lg:w-1/2">
        <header className="h-16 flex items-center justify-center px-6 lg:hidden">
          <Link href="/" className="no-underline">
            <Logo size="md" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
