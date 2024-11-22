import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && req.nextUrl.pathname !== '/auth') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session, verify organization and role
  if (session && req.nextUrl.pathname !== '/auth') {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations!inner(type)
        `)
        .eq('user_id', session.user.id)
        .eq('role', 'owner')
        .single() as unknown as {
          data: {
            role: string;
            organization: {
              type: string;
            };
          } | null;
          error: any;
        };

      if (error || !data || data.organization?.type !== 'matrix') {
        // If verification fails, redirect to auth page
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // If there's an error checking authorization, redirect to auth page
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's a session and the user is on the auth page
  if (session && req.nextUrl.pathname === '/auth') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};