"use server";

import { cookies } from "next/headers";

export default async function handleLogout() {
  const cookieStore = await cookies();

  const expired = { path: "/", expires: new Date(0) };
  cookieStore.set("session", "", expired);
  cookieStore.set("auth_token", "", expired);
  cookieStore.set("refresh_token", "", expired);
}
