"use client";

import { store } from "@/store/store";
import { logout } from "@/store/registerSlice";

let isHandling = false;

export function handleInvalidToken() {
  if (typeof window === "undefined") return;
  if (isHandling) return;
  if (window.location.pathname.startsWith("/auth/")) return; // already on login/register, avoid a redirect loop

  isHandling = true;

  try {
    localStorage.removeItem("login");
  } catch {}

  store.dispatch(logout());

  window.location.href = "/auth/login";
}