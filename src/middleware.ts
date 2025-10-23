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
];

// Routes that should redirect authenticated users away
const prohibitedRoutes = [
  '/auth/register',
  '/auth/verify-email',
  '/api/session'
];

// Public route prefixes (routes that start with these are public)
const publicRoutePrefixes = [
  '/creators',
];

// Admin routes that require admin privileges
const adminRoutes = [
  '/mmeko/admin',
  '/mmeko/admin/',
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

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname) || 
    publicRoutePrefixes.some(prefix => pathname.startsWith(prefix));
  
  // Check if route is prohibited for authenticated users
  const isProhibitedRoute = prohibitedRoutes.some(route => pathname === route);
  
  // Check if route is admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Get authentication token
  const authToken = request.cookies.get("session")?.value || request.cookies.get("auth_token")?.value;
  
  
  // Handle session refresh
  const refreshed = await sessionMng(request);
  
  // If no auth token and not a public route, redirect to login
  if (!authToken && !isPublicRoute) {
    const res = NextResponse.redirect(new URL('/auth/login', request.url));
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
  
  // If user has auth token and trying to access prohibited routes, redirect to home
  if (authToken && isProhibitedRoute) {
    const res = NextResponse.redirect(new URL('/', request.url));
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
  
  // If accessing admin routes, check if user is admin
  if (isAdminRoute && authToken) {
    const isAdmin = await checkUserAdmin(request);
    
    if (!isAdmin) {
      // User is authenticated but not admin, redirect to home
      const res = NextResponse.redirect(new URL('/', request.url));
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
  }
  
  // If accessing admin routes without auth token, redirect to login
  if (isAdminRoute && !authToken) {
    const res = NextResponse.redirect(new URL('/auth/login', request.url));
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

  // Allow request to proceed
  const response = NextResponse.next();
  if (refreshed) {
    response.cookies.set('session', refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
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
