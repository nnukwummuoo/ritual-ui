import { NextRequest, NextResponse } from "next/server";
import { decryptData } from "@/lib/service/manageSession";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("session")?.value;
    if (!cookie) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }
    const result = await decryptData(String(cookie));
    const loggedIn = result?.status === "valid";
    return NextResponse.json({ loggedIn }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
}
