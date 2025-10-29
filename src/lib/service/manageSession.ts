/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import axios from "axios";
import { URL } from "../../api/config";

export type user = { 
  nickname: string; 
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
// Removed unused variables

export async function encryptData(payload: payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decryptData(input: string): Promise<{ status: string; body: user }> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    const typedPayload = payload as payload;
    
    return { status: "valid", body: typedPayload.user };
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return { status: "expired", body: error?.payload?.user ?? { nickname: "", password: "" } };
  }
}

export async function isRegistered(payload: { nickname: string; password: string }): Promise<{ user?: any; error?: string; banned?: boolean }> {
  try {
    const res = await axios.post(
      `${URL}/login`,
      { nickname: payload.nickname.toLowerCase().trim(), password: payload.password },
      { withCredentials: true }
    );
    console.log("Backend response:", res.data);
    const data = res.data;
    if (!data.ok) {
      // Check if user is banned
      if (data.banned || res.status === 403) {
        return { error: data.message || "Login failed", banned: true };
      }
      return { error: data.message || "Login failed" };
    }
    // Use the complete user object from backend response
    const user = {
      ...data.user, // Include all user data from backend
      _id: data.userId,
      nickname: payload.nickname.toLowerCase().trim(),
      accessToken: data.accessToken,
      refreshtoken: data.token,
      admin: data.isAdmin || data.user?.admin || false,
    };
    return { user };
  } catch (error: any) {
    console.error("Login API error:", error.message);
    
    // Check if user is banned (403 status)
    if (error?.response?.status === 403 || error?.response?.data?.banned) {
      return { error: error?.response?.data?.message || "This account has been banned for violating our rules", banned: true };
    }
    
    return { error: error?.response?.data?.message || "Login failed" };
  }
}

export async function sessionMng(request: NextRequest): Promise<string | undefined> {
  // Check for session cookie first (preferred)
  let cookie = request.cookies.get("session")?.value;
  
  // If no session cookie, check for auth_token cookie
  if (!cookie) {
    cookie = request.cookies.get("auth_token")?.value;
  }
  
  if (!cookie?.length) return undefined;
  const decryptCookie = await decryptData(cookie);
  if (decryptCookie.status === "valid") return undefined;
  // Expired -> refresh directly and return new token
  const refreshed = await encryptData({ user: decryptCookie.body });
  return refreshed;
}

export async function checkUserAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Check for session cookie first (preferred)
    let cookie = request.cookies.get("session")?.value;
    
    // If no session cookie, check for auth_token cookie
    if (!cookie) {
      cookie = request.cookies.get("auth_token")?.value;
    }
    
    if (!cookie?.length) {
      return false;
    }
    
    const decryptCookie = await decryptData(cookie);
    if (decryptCookie.status === "valid") {
      const userData = decryptCookie.body;
      
      // First check if admin status is already in JWT
      if (userData?.admin !== undefined) {
        return userData.admin === true;
      }
      
      // If not in JWT, try to get user ID and make API call
      const userId = userData?.userId || userData?._id;
      
      if (!userId) {
        return false;
      }
      
      try {
        // Make API call to check current admin status from database
        const response = await axios.get(`${URL}/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${userData?.accessToken || cookie}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.ok) {
          const user = response.data.user || response.data;
          const isAdmin = user?.admin === true || 
                 user?.isAdmin === true || 
                 user?.is_admin === true ||
                 user?.role === 'admin' ||
                 user?.userRole === 'admin';
          
          return isAdmin;
        }
        
        return false;
      } catch (apiError) {
        console.error("API error checking admin status:", apiError);
        // Fallback to JWT data if API fails
        return userData?.admin === true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}