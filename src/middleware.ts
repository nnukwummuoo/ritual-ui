import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionMng, checkUserAdmin } from './lib/service/manageSession';

const publicRoutes = [
  '/', '/auth/login', '/auth/register', '/auth/verify-email',
  '/api/session', '/post-image', '/privacy-policy', '/T_&_C',
  '/guidelines', '/whats-new', '/change-log', '/feedback',
  '/support', '/about', '/blog', '/creators', '/offline', '/banned',
];

const prohibitedRoutes = ['/auth/login', '/auth/register', '/auth/verify-email'];

const publicRoutePrefixes = [
  '/api/proxy', '/api/image-proxy', '/api/simple-image-proxy',
];

const adminRoutes = ['/mmeko'];
const PUBLIC_PROFILE_ROUTE = /^\/@[^/]+$/;
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // ✅ ONLY use raw cookie for auth check — never sessionMng return value
  const authToken =
    request.cookies.get('session')?.value ||
    request.cookies.get('auth_token')?.value;

  const isPublicProfileRoute = PUBLIC_PROFILE_ROUTE.test(pathname);
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    isPublicProfileRoute;

  const isProhibitedRoute = prohibitedRoutes.some((route) => pathname === route);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // ✅ Refresh session in background but NEVER use it to determine auth
  const refreshed = await sessionMng(request);

  const attachCookie = (res: NextResponse) => {
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  };

  const redirect = (url: string) =>
    attachCookie(NextResponse.redirect(new URL(url, request.url)));

  const next = () => attachCookie(NextResponse.next());

  // No auth cookie → only allow public routes
  if (!authToken) {
    return isPublicRoute ? next() : redirect('/auth/login');
  }

  // Authenticated users can't visit login/register/verify
  if (isProhibitedRoute) {
    return redirect('/');
  }

  // Admin guard
  if (isAdminRoute) {
    const isAdmin = await checkUserAdmin(request);
    return isAdmin ? next() : redirect('/');
  }

  return next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.css$|.*\\.js$).*)',
    '/',
  ],
};