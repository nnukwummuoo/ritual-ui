import { encryptData, decryptData } from "@/lib/service/manageSession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // debugger
    const data = await request.json();
    // handleLogout()
    const sessionId = await encryptData({ user: data });
  
    // Create response
    const res = new NextResponse(JSON.stringify({ sessionId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    // Set cookie in response
    res.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });
  
    return res;
}

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get("session")?.value;
    const authTokenCookie = request.cookies.get("auth_token")?.value;
    
    if (!sessionCookie && !authTokenCookie) {
      return NextResponse.json({ valid: false, message: "No session found" }, { status: 401 });
    }
    
    // Try to decrypt the session
    const cookieToCheck = sessionCookie || authTokenCookie;
    const decryptedSession = await decryptData(cookieToCheck!);
    
    if (decryptedSession.status === "valid") {
      return NextResponse.json({ 
        valid: true, 
        user: decryptedSession.body,
        message: "Session is valid" 
      });
    } else {
      return NextResponse.json({ 
        valid: false, 
        message: "Session expired" 
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ 
      valid: false, 
      message: "Session validation failed" 
    }, { status: 500 });
  }
}
