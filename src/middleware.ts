import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionMng } from './lib/service/manageSession';

const publicRoutes = [
  '/',
  '/auth/register',
  '/auth/verify-email',
  '/models',
  '/models/create-model',
  '/models/edit-model',
  '/guidelines',
  '/support',
  '/privacy-policy',
  '/T_&_C',
  '/login',
  '/api/session',

  // change later for admin 
  "/mmeko/admin",
  "/mmeko/admin/reports",
  "/mmeko/admin/model-verification",
  "/mmeko/admin/withdrawal",
  "/mmeko/admin/users",
];

const prohibitedRoute = [
  '/auth/register',
  '/auth/verify-email',
  '/api/session'
];

const publicRoutePrefixes = [
  '/models',
];

const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("session")
  const isPublic =   publicRoutes.includes(pathname) ||
  publicRoutePrefixes.some(prefix => pathname.startsWith(prefix));
  const isProhibited = prohibitedRoute.some((route)=> route === pathname);

  sessionMng(request)
  // Skip middleware for static files
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (!authToken && !isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (authToken && isProhibited) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-powered-by', 'MintMiddleware');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.css$|.*\\.js$).*)',
    "/"
  ],
};
