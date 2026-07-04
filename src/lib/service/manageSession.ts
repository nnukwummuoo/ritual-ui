/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import axios from "axios";
import { URL } from "../../api/config";

export type user = {
  username: string;
  password: string;
  userId?: string;
  _id?: string;
  admin?: boolean;
  accessToken?: string;
  refreshtoken?: string;
};
export type payload = { user: user };

const secret = process.env.ACCESS_TOKEN_SECRET || "NEXT_PUBLIC_SECERET";
const key = new TextEncoder().encode(secret);

const SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60; // 30 days
const REFRESH_THRESHOLD_SECONDS = SESSION_LIFETIME_SECONDS / 2; // reissue once under 15 days remain

export async function encryptData(payload: payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decryptData(
  input: string
): Promise<{ status: "valid" | "expired" | "invalid"; body: user; exp?: number }> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    const typedPayload = payload as any;

    // Two possible shapes can land here:
    // 1) Our own "session" cookie (jose):        { user: { admin, username, ... } }
    // 2) The backend's raw auth_token JWT:        { UserInfo: { username, userId, isAdmin } }
    let userBody: user;
    if (typedPayload.user) {
      userBody = typedPayload.user;
    } else if (typedPayload.UserInfo) {
      userBody = {
        username: typedPayload.UserInfo.username,
        password: "",
        userId: typedPayload.UserInfo.userId,
        _id: typedPayload.UserInfo.userId,
        admin: typedPayload.UserInfo.isAdmin,
      };
    } else {
      userBody = { username: "", password: "" };
    }

    return { status: "valid", body: userBody, exp: payload.exp };
  } catch (error: any) {
    const isExpired = error?.code === "ERR_JWT_EXPIRED";
    console.error("JWT verification error:", error.message);
    return {
      status: isExpired ? "expired" : "invalid",
      body: error?.payload?.user ?? { username: "", password: "" },
    };
  }
}

export async function isRegistered(payload: { username: string; password: string }): Promise<{ user?: any; error?: string; banned?: boolean }> {
  try {
    const res = await axios.post(
      `${URL}/login`,
      { username: payload.username.toLowerCase().trim(), password: payload.password },
      { withCredentials: true }
    );
    const data = res.data;
    if (!data.ok) {
      if (data.banned || res.status === 403) {
        return { error: data.message || "Login failed", banned: true };
      }
      return { error: data.message || "Login failed" };
    }
    const user = {
      ...data.user,
      _id: data.userId,
      username: payload.username.toLowerCase().trim(),
      accessToken: data.accessToken,
      refreshtoken: data.token,
      admin: data.isAdmin || data.user?.admin || false,
    };
    return { user };
  } catch (error: any) {
    console.error("Login API error:", error.message);
    if (error?.response?.status === 403 || error?.response?.data?.banned) {
      return { error: error?.response?.data?.message || "This account has been banned for violating our rules", banned: true };
    }
    return { error: error?.response?.data?.message || "Login failed" };
  }
}

export async function sessionMng(request: NextRequest): Promise<string | undefined> {
  let cookie = request.cookies.get("session")?.value;
  if (!cookie) {
    cookie = request.cookies.get("auth_token")?.value;
  }
  if (!cookie?.length) return undefined;

  const decryptCookie = await decryptData(cookie);

  // Corrupted/garbage token — don't trust it, don't refresh it
  if (decryptCookie.status === "invalid") return undefined;

  // Fully expired — recover the payload and issue a brand new session
  if (decryptCookie.status === "expired") {
    return await encryptData({ user: decryptCookie.body });
  }

  // Still valid — sliding refresh: proactively renew once past the halfway point,
  // so an active user's session window keeps sliding forward rather than hard-expiring.
  if (decryptCookie.exp) {
    const remaining = decryptCookie.exp - Math.floor(Date.now() / 1000);
    if (remaining < REFRESH_THRESHOLD_SECONDS) {
      return await encryptData({ user: decryptCookie.body });
    }
  }

  return undefined; // still fresh, nothing to do
}

export async function checkUserAdmin(request: NextRequest): Promise<boolean> {
  try {
    let cookie = request.cookies.get("session")?.value;
    if (!cookie) {
      cookie = request.cookies.get("auth_token")?.value;
    }
    if (!cookie?.length) {
      return false;
    }

    const decryptCookie = await decryptData(cookie);
    if (decryptCookie.status === "valid") {
      const userData = decryptCookie.body;

      if (userData?.admin !== undefined) {
        return userData.admin === true;
      }

      const userId = userData?.userId || userData?._id;
      if (!userId) {
        return false;
      }

      try {
        const response = await axios.get(`${URL}/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${userData?.accessToken || cookie}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.ok) {
          const user = response.data.user || response.data;
          return user?.admin === true ||
                 user?.isAdmin === true ||
                 user?.is_admin === true ||
                 user?.role === 'admin' ||
                 user?.userRole === 'admin';
        }
        return false;
      } catch (apiError) {
        console.error("API error checking admin status:", apiError);
        return userData?.admin === true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}