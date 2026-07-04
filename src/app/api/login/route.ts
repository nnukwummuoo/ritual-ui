import { NextRequest, NextResponse } from "next/server";
import { URL } from "@/api/config";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log("[api/login] received:", { username, password, usernameType: typeof username, passwordType: typeof password });


    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.toLowerCase().trim(),
        password,
      }),
    });

    const data = await backendRes.json();

    if (!data.ok) {
      const status = data.banned || backendRes.status === 403 ? 403 : 400;
      return NextResponse.json(
        { error: data.message || "Login failed", banned: !!data.banned },
        { status }
      );
    }

    const user = {
      ...data.user,
      _id: data.userId,
      username: username.toLowerCase().trim(),
      accessToken: data.accessToken,
      refreshtoken: data.token,
      admin: data.isAdmin || data.user?.admin || false,
      sessionEpoch: data.sessionEpoch || 0,
    };

    const res = NextResponse.json({ user });

    // Correctly forward multiple Set-Cookie headers from the backend.
    // response.headers.get('set-cookie') would incorrectly join multiple
    // cookies with commas, which breaks parsing (especially with Expires
    // dates, which themselves contain commas). getSetCookie() returns
    // each cookie separately so they can be appended individually.
    const setCookies = backendRes.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      res.headers.append("Set-Cookie", cookie);
    }

    return res;
  } catch (error: any) {
    console.error("Login API error:", error.message);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}