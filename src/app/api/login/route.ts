import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// let token: string;
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  try {
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API}/login`, {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const res = new NextResponse(await response.text(), {
      status: response.status,
      headers: response.headers,
    });
    return res;
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}
