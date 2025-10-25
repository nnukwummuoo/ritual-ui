import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionMng, checkUserAdmin } from './lib/service/manageSession';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/api/session',
  '/post-image',
  '/privacy-policy',
  '/T_&_C',
  '/guidelines',
  '/whats-new',
  '/change-log',
  '/feedback',
  '/support',
  "/creators",
  '/offline',
];

// Routes that should redirect authenticated users away
const prohibitedRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/api/session'
];

// Public route prefixes (routes that start with these are public)
const publicRoutePrefixes = [
  '/auth',      // All auth routes
];

// Admin routes that require admin privileges
const adminRoutes = [
  '/mmeko',  // All admin routes under /mmeko
];

// Static files pattern
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files
  if (PUBLIC_FILE.test(pathname)) {
    const res = NextResponse.next();
    const refreshed = await sessionMng(request);
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      });
    }
    return res;
  }

  // Check route types
  const isPublicRoute = publicRoutes.includes(pathname) || 
    publicRoutePrefixes.some(prefix => pathname.startsWith(prefix));
  const isProhibitedRoute = prohibitedRoutes.some(route => pathname === route);
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Get authentication token
  const authToken = request.cookies.get("session")?.value || request.cookies.get("auth_token")?.value;
  
  // Handle session refresh
  const refreshed = await sessionMng(request);
  
  // Helper function to create response with session cookie
  const createResponse = (url: string, redirect = true) => {
    const res = redirect ? NextResponse.redirect(new URL(url, request.url)) : NextResponse.next();
    if (refreshed) {
      res.cookies.set('session', refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      });
    }
    return res;
  };

  // Case 1: No authentication token
  if (!authToken) {
    // Allow public routes
    if (isPublicRoute) {
      return createResponse('', false);
    }
    // Redirect to login for all other routes
    return createResponse('/auth/login');
  }

  // Case 2: User is authenticated
  // Redirect authenticated users away from prohibited routes (login, register, etc.)
  if (isProhibitedRoute) {
    return createResponse('/');
  }

  // Case 3: Admin route access
  if (isAdminRoute) {
    const isAdmin = await checkUserAdmin(request);
    if (!isAdmin) {
      // User is authenticated but not admin, redirect to home
      return createResponse('/');
    }
    // Admin user accessing admin route - allow
    return createResponse('', false);
  }

  // Case 4: Authenticated user accessing regular routes - allow
  return createResponse('', false);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.css$|.*\\.js$).*)',
    "/"
  ],
};
