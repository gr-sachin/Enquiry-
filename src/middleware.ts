import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define which routes are public and don't require authentication
const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Retrieve the session cookie
  const cookie = request.cookies.get('session')?.value;
  const sessionPayload = cookie ? await decrypt(cookie) : null;

  // 1. Redirect unauthenticated users trying to access protected routes
  if (!isPublicRoute && !sessionPayload) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 2. Redirect authenticated users away from login/signup pages back to dashboard
  if (isPublicRoute && sessionPayload && !path.startsWith('/api')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on all paths except static files/images/api non-auth routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
