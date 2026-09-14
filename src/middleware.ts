import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

// Protected routes requiring authentication
const PROTECTED_ROUTES = ['/dashboard', '/study-guide', '/student', '/teacher', '/upload', '/overview', '/student-study-guide'];

// Auth routes accessible only when unauthenticated
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('learngraph_session')?.value;
  const payload = sessionToken ? await verifyJWT(sessionToken) : null;
  const isAuthenticated = !!payload;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. If unauthenticated user attempts to access protected routes, redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated user attempts to access login or register, redirect to appropriate workspace
  if (isAuthRoute && isAuthenticated) {
    const target = payload.role === 'teacher' ? '/teacher' : '/student';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Convenience alias: /study-guide & /student-guide -> /student
  if (pathname === '/study-guide' || pathname === '/student-guide') {
    return NextResponse.redirect(new URL('/student', request.url));
  }

  // 4. Convenience alias: /dashboard & /overview -> role-specific view
  if ((pathname === '/dashboard' || pathname === '/overview') && isAuthenticated) {
    const target = payload.role === 'teacher' ? '/teacher' : '/student';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 5. Enforce role-based route boundaries: Prevent students entering teacher routes and vice-versa
  if (pathname.startsWith('/teacher') && payload?.role === 'student') {
    return NextResponse.redirect(new URL('/student', request.url));
  }
  if (pathname.startsWith('/student') && payload?.role === 'teacher') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/.*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, and static file extensions (.svg, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
