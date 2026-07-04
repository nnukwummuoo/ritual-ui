import { NextRequest, NextResponse } from "next/server";
import { URL } from "@/api/config";

function parseSetCookie(raw: string) {
  const parts = raw.split(';').map((p) => p.trim());
  const [nameValue, ...attrParts] = parts;
  const eqIdx = nameValue.indexOf('=');
  const name = nameValue.slice(0, eqIdx);
  const value = nameValue.slice(eqIdx + 1);

  const options: any = {};
  for (const attr of attrParts) {
    const [key, val] = attr.split('=');
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'max-age') options.maxAge = parseInt(val, 10);
    else if (lowerKey === 'path') options.path = val;
    else if (lowerKey === 'expires') options.expires = new Date(val);
    else if (lowerKey === 'domain') options.domain = val;
    else if (lowerKey === 'httponly') options.httpOnly = true;
    else if (lowerKey === 'secure') options.secure = true;
    else if (lowerKey === 'samesite') options.sameSite = val.toLowerCase();
  }

  return { name, value, options };
}

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
    for (const rawCookie of setCookies) {
      const { name, value, options } = parseSetCookie(rawCookie);
      res.cookies.set(name, value, options);
    }
    
    return res;
  } catch (error: any) {
    console.error("Login API error:", error.message);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}