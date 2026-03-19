import { NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

import type { NextRequest } from 'next/server';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = await updateSession(request);

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { createServerClient } = await import('@supabase/ssr');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op for read-only check
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const isAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/v1/widget|api/v1/submit|api/v1/public|api/webhooks|analytics/).*)',
  ],
};
