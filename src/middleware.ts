import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionMng } from './lib/service/manageSession';

const publicRoutes = [
  '/',
  '/auth/register',
  '/auth/verify-email',
  '/creators',
  '/creators/create-creator',
  '/creators/editcreatorportfolio',
  '/guidelines',
  '/support',
  '/privacy-policy',
  '/T_&_C',
  '/login',
  '/api/session',
  '/post-image',
  "/comment",
  "/buy-gold",
  "/buy-gold/success",
  "/buy-gold/cancel",
  "/forget-password",
  "/verify-creators",
  "/message",
  // change later for admin 
  "/mmeko/admin",
  "/mmeko/admin/reports",
  "/mmeko/admin/creator-verification",
  "/mmeko/admin/withdrawal",
  "/mmeko/admin/users",
];

const prohibitedRoute = [
  '/auth/register',
  '/auth/verify-email',
  '/api/session'
];

const publicRoutePrefixes = [
  '/creators',
];

const PUBLIC_FILE = /\.(.*)$/

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("session") || request.cookies.get("auth_token")
  const isPublic =   publicRoutes.includes(pathname) ||
  publicRoutePrefixes.some(prefix => pathname.startsWith(prefix));
  const isProhibited = prohibitedRoute.some((route)=> route === pathname);
  const refreshed = await sessionMng(request)
  // Skip middleware for static files
  if (PUBLIC_FILE.test(pathname)) {
    const res = NextResponse.next();
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
      });
    }
    return res;
  }

  if (!authToken && !isPublic) {
    const res = NextResponse.redirect(new URL('/', request.url));
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
      });
    }
    return res;
  }
  if (authToken && isProhibited) {
    const res = NextResponse.redirect(new URL('/', request.url));
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
      });
    }
    return res;
  }

  const response = NextResponse.next();
  if (refreshed) {
    response.cookies.set('session', refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });
  }
  response.headers.set('x-powered-by', 'MintMiddleware');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.css$|.*\\.js$).*)',
    "/"
  ],
};
