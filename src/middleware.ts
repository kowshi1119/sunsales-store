import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = ['/account', '/checkout'];

// Routes that require admin role
const adminRoutes = ['/admin'];

// Routes only accessible when NOT authenticated
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN' || token?.role === 'STAFF';

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect customer routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes (except admin login)
  if (adminRoutes.some((route) => pathname.startsWith(route)) && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled separately)
     * - _next/static, _next/image (static files)
     * - favicon.ico, public folder assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|models|fonts).*)',
  ],
};
