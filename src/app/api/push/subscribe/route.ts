import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userid, subscription } = body;

    if (!userid || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Missing userid or subscription data' },
        { status: 400 }
      );
    }

    // Forward the subscription to your backend API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API || ""}/subpushid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization') || ''}`
      },
      body: JSON.stringify({
        userid,
        subinfo: subscription
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Backend API error:', errorText);
      throw new Error(`Backend API responded with status: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription saved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userid } = body;

    if (!userid) {
      return NextResponse.json(
        { success: false, error: 'Missing userid' },
        { status: 400 }
      );
    }

    // Forward the unsubscribe request to your backend API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API || ""}/subpushid`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization') || ''}`
      },
      body: JSON.stringify({
        userid
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Backend API error:', errorText);
      throw new Error(`Backend API responded with status: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription removed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove push subscription' },
      { status: 500 }
    );
  }
}
