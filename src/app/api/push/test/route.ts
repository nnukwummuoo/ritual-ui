import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, title, type } = body;

    // Get user ID from headers or session
    const userid = request.headers.get('x-user-id') || 'test-user';

    // Send push notification via your API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API || 'https://mmekoapi.onrender.com'}/api/push/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization') || ''}`
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
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    return NextResponse.json({ success: true, message: 'Test push notification sent' });
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test push notification' },
      { status: 500 }
    );
  }
}
