import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { safeRedirectUrl } from '@/lib/safe-redirect';
import type { Database } from '@/lib/supabase/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const next = safeRedirectUrl(searchParams.get('next') ?? '/dashboard', '/dashboard');
  const type = searchParams.get('type'); // email_confirmation, recovery, etc.

  if (!code) {
    const errorUrl = new URL('/error', origin);
    errorUrl.searchParams.set('error', 'missing_code');
    errorUrl.searchParams.set(
      'error_description',
      'No authorization code was provided',
    );
    return NextResponse.redirect(errorUrl);
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorUrl = new URL('/error', origin);
    errorUrl.searchParams.set('error', 'configuration_error');
    errorUrl.searchParams.set('error_description', 'Server configuration error');
    return NextResponse.redirect(errorUrl);
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL('/error', origin);
    errorUrl.searchParams.set('error', error.message);
    errorUrl.searchParams.set(
      'error_description',
      error.message,
    );
    return NextResponse.redirect(errorUrl);
  }

  // Determine redirect based on callback type
  let redirectPath: string;

  switch (type) {
    case 'recovery':
      redirectPath = '/reset-password';
      break;
    case 'email_change':
      redirectPath = '/settings?tab=profile&emailChanged=true';
      break;
    case 'signup':
    case 'email': {
      // Check if user already has an account
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        redirectPath = member ? '/dashboard' : '/onboarding';
      } else {
        redirectPath = next;
      }
      break;
    }
    default:
      redirectPath = next;
  }

  const redirectUrl = new URL(redirectPath, origin);
  return NextResponse.redirect(redirectUrl);
}
