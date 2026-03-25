import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Public page routes that don't require a session cookie
const publicPageRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Always allow all API routes to pass through — they handle their own auth
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static assets
  const isPublicPage = publicPageRoutes.includes(path);

  // Retrieve the session cookie
  const cookie = request.cookies.get('session')?.value;
  const sessionPayload = cookie ? await decrypt(cookie) : null;

  // 1. Redirect unauthenticated users trying to access protected pages
  if (!isPublicPage && !sessionPayload) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 2. Redirect authenticated users away from login/signup back to dashboard
  if (isPublicPage && sessionPayload) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on all paths except static files/images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};

