import { encryptData } from "@/lib/service/manageSession";
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
    });
  
    return res;
}
