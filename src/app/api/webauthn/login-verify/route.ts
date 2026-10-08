import { NextRequest, NextResponse } from "next/server";
import { URL } from "@/api/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${URL}/webauthn/login/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!data.ok) {
      const status = data.banned || backendRes.status === 403 ? 403 : 400;
      return NextResponse.json(
        { error: data.message || "Biometric login failed", banned: !!data.banned },
        { status }
      );
    }

    const user = {
      ...data.user,
      _id: data.userId,
      accessToken: data.accessToken,
      refreshtoken: data.token,
      admin: data.isAdmin || data.user?.admin || false,
    };

    const res = NextResponse.json({ user });

    // Forward each Set-Cookie header individually — same reasoning as
    // /api/login: joining them with response.headers.get() would corrupt
    // the Expires date's embedded comma.
    const setCookies = backendRes.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      res.headers.append("Set-Cookie", cookie);
    }

    return res;
  } catch (error: any) {
    console.error("webauthn login-verify error:", error.message);
    return NextResponse.json({ error: "Biometric login failed" }, { status: 500 });
  }
}