import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, title, type } = body;

    // Get user session from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user ID from headers or use default for testing
    const userid = request.headers.get('x-user-id') || '68d4e80038daebb570e30f6a';

    // Send push notification via your Express API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND || ""}/api/push/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        userid,
        message: message || 'Test notification',
        title: title || 'Test Title',
        type: type || 'test',
        icon: '/icons/m-logo.png',
        url: '/'
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Express API error:', errorText);
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    return NextResponse.json({ success: true, message: 'Test push notification sent', data: result });
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test push notification' },
      { status: 500 }
    );
  }
}
