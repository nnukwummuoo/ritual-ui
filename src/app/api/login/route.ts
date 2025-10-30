import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// let token: string;
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  try{
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : 'https://backendritual.work'}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    
    const data = await response.json();
    const res = new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
    });
    
    // Forward cookies from backend response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }
    
    return res;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse(JSON.stringify({ ok: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}