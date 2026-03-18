import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/lib/supabase/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }

  return response;
}
