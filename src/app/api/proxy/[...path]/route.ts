// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path.join('/'));
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path.join('/'));
}

// Add PUT, DELETE, etc., if needed
export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path.join('/'));
}

async function handleRequest(request: NextRequest, path: string) {
  // Check if request is coming from network IP
  const hostname = request.headers.get('host') || '';
  let targetUrl: string;
  
  if (hostname.includes('10.245.95.157')) {
    // Network access - route to localhost backend
    targetUrl = `http://localhost:3100/${path}`;
  } else if (process.env.NODE_ENV === 'development') {
    targetUrl = `http://localhost:3100/${path}`;
  } else {
    targetUrl = `${process.env.NEXT_PUBLIC_BACKEND || ""}/${path}`;
  }

  try {
    const body = request.method !== 'GET' ? await request.json() : undefined;

    // ✅ Fix: Use Headers instance to avoid type issues with undefined values
    const headers = new Headers();
    
    // Forward all non-empty headers (filters out undefined like 'host')
    request.headers.forEach((value, key) => {
      if (value !== undefined) {  // Skip undefined values
        headers.set(key, value);
      }
    });

    // ✅ Explicitly remove 'host' to avoid proxy loops/conflicts
    headers.delete('host');

    // ✅ Conditionally set Content-Type only for methods with body
    if (body && request.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,  // Now a clean Headers object – TypeScript happy!
      body: body ? JSON.stringify(body) : undefined,
    });

    // ✅ Only parse JSON if response is OK and content-type indicates JSON
    let data;
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      data = await response.json();
    } else {
      // Fallback: Read as text for non-JSON (e.g., errors)
      data = await response.text();
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}