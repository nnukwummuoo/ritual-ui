"use client";

let isHandling = false;

export async function handleInvalidToken() {
  if (typeof window === "undefined") return;
  if (isHandling) return;
  if (window.location.pathname.startsWith("/auth/")) return;

  isHandling = true;

  try {
    localStorage.removeItem("login");
  } catch {}

  const { store } = await import("@/store/store");
  const { logout } = await import("@/store/registerSlice");
  store.dispatch(logout());

  window.location.href = "/auth/login";
}