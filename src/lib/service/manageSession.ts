"use server";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import axios from "axios";

export type user = { nickname: string; password: string };
export type payload = { user: user };

const secret = process.env.ACCESS_TOKEN_SECRET || "NEXT_PUBLIC_SECERET";
const key = new TextEncoder().encode(secret);
let credentials: user | false;
let timeout_id: ReturnType<typeof setTimeout>;

export async function encryptData(payload: payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

export async function decryptData(
  input: string
): Promise<{ status: string; body: user }> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    const typedPayload = payload as payload;
    console.log({
      decryptData: {
        nickname: typedPayload.user.nickname,
        password: "[REDACTED]",
      },
      input,
    });
    return { status: "valid", body: typedPayload.user };
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return {
      status: "expired",
      body: error?.payload?.user ?? { nickname: "", password: "" },
    };
  }
}

export async function isRegistered(payload: {
  nickname: string;
  password: string;
}): Promise<{ user?: any; error?: string }> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/login`,
      {
        nickname: payload.nickname.toLowerCase().trim(),
        password: payload.password,
      },
      { withCredentials: true }
    );
    // console.log("Backend response:", res.data);
    const data = res.data;
    if (!data.ok) {
      return { error: data.message || "Login failed" };
    }
    // Construct user object from backend response
    const user = {
      _id: data.userId,
      nickname: payload.nickname.toLowerCase().trim(),
      accessToken: data.accessToken,
      refreshtoken: data.token,
      isAdmin: data.isAdmin,
    };
    return { user };
  } catch (error: any) {
    console.error("Login API error:", error.message);
    credentials = false;
    return { error: error?.response?.data?.message || "Login failed" };
  }
}

export async function sessionMng(
  request: NextRequest
): Promise<string | undefined> {
  const cookie = request.cookies.get("auth_token")?.value;
  if (!cookie?.length) return undefined;
  const decryptCookie = await decryptData(cookie);
  if (decryptCookie.status === "valid") return undefined;
  // Expired -> refresh directly and return new token
  const refreshed = await encryptData({ user: decryptCookie.body });
  return refreshed;
}
