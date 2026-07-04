
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionMng, checkUserAdmin, decryptData, isSessionRevoked } from './lib/service/manageSession';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/api/session',
  '/api/login', 
  '/post-image',
  '/privacy-policy',
  '/T_&_C',
  '/guidelines',
  '/whats-new',
  '/change-log',
  '/feedback',
  '/support',
  '/about',
  '/blog',
  '/creators',
  '/offline',
  '/banned',
];

const prohibitedRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
];

const publicRoutePrefixes = [
  '/auth',
  '/api/proxy',
  '/api/image-proxy',
  '/api/simple-image-proxy',
];

const adminRoutes = [
  '/mmeko',
];

const PUBLIC_PROFILE_ROUTE = /^\/@[^/]+$/;

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname)) {
    const res = NextResponse.next();
    const refreshed = await sessionMng(request);
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  }

  // const isPublicProfileRoute = PUBLIC_PROFILE_ROUTE.test(pathname); 
  // const isPublicRoute =
  //   publicRoutes.includes(pathname) ||
  //   publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix)) ||
  //   isPublicProfileRoute; 

  const isPublicRoute =
  publicRoutes.includes(pathname) ||
  publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix)) ||
  PUBLIC_PROFILE_ROUTE.test(pathname) ||
  pathname.startsWith('/portfolio/') ; 
  
  const isProhibitedRoute = prohibitedRoutes.some((route) => pathname === route);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  const authToken =
    request.cookies.get('session')?.value ||
    request.cookies.get('auth_token')?.value;

  const refreshed = await sessionMng(request);

  const createResponse = (url: string, redirect = true) => {
    const res = redirect
      ? NextResponse.redirect(new URL(url, request.url))
      : NextResponse.next();
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  };

  if (!authToken) {
    if (isPublicRoute) {
      return createResponse('', false);
    }
    return createResponse('/auth/login');
  }

   // NEW: check if this session was globally revoked by an admin
  const decrypted = await decryptData(authToken);
  if (decrypted.status === "valid") {
    const revoked = await isSessionRevoked(decrypted.body);
    if (revoked) {
      return createResponse('/auth/login');
    }
  }

  if (isProhibitedRoute) {
    return createResponse('/');
  }

  if (isAdminRoute) {
    const isAdmin = await checkUserAdmin(request);
    if (!isAdmin) {
      return createResponse('/');
    }
    return createResponse('', false);
  }

  return createResponse('', false);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.css$|.*\\.js$).*)',
    '/',
  ],
};