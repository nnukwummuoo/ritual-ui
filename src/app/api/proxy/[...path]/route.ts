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
  const targetUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:3100/${path}`  // Your backend
    : `https://mmekoapi.onrender.com/${path}`;

  try {
    const body = request.method !== 'GET' ? await request.json() : undefined;
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),  // Forward headers (add auth if needed)
        'host': undefined,  // Avoid proxy issues
        'Content-Type': 'application/json',  // Ensure JSON
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}