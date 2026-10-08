import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import backend from "@/api/backendApi";

/**
 * True if this browser can do WebAuthn at all AND has a platform
 * authenticator available (Face ID / Touch ID / Windows Hello / Android
 * biometrics). Use this to decide whether to show any biometric UI.
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    if (typeof window === "undefined") return false;
    if (!browserSupportsWebAuthn()) return false;
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
};

/**
 * Registers a new passkey for the currently logged-in user.
 * Throws a human-readable Error on failure (including user cancellation).
 */
export const registerBiometric = async (token: string, deviceLabel?: string): Promise<void> => {
  const api = backend(token);

  const { data: optionsRes } = await api.post("/webauthn/register/options");
  if (!optionsRes?.ok) {
    throw new Error(optionsRes?.message || "Could not start passkey registration");
  }

let attestationResponse;
  try {
    attestationResponse = await startRegistration({ optionsJSON: optionsRes.options });
  } catch (err: any) {
    // Log the real DOMException so this is diagnosable from devtools instead
    // of only ever seeing a generic message.
    console.error("WebAuthn registration failed:", err?.name, err?.message, err);

    if (err?.name === "InvalidStateError") {
      throw new Error("This device already has a passkey registered for this account.");
    }
    if (err?.name === "NotAllowedError") {
      throw new Error("Passkey setup was cancelled.");
    }
    if (err?.name === "SecurityError") {
      throw new Error(
        "This site's domain doesn't match its passkey configuration (RP ID/origin mismatch). This is a setup issue, not a device issue."
      );
    }
    if (err?.name === "NotSupportedError") {
      throw new Error("No compatible biometric method was found on this device.");
    }
    throw new Error(`Your device couldn't complete biometric setup (${err?.name || "unknown error"}).`);
  }

  const { data: verifyRes } = await api.post("/webauthn/register/verify", {
    attestationResponse,
    deviceLabel: deviceLabel || guessDeviceLabel(),
  });

  if (!verifyRes?.ok) {
    throw new Error(verifyRes?.message || "Passkey registration failed");
  }
};

export interface BiometricLoginResult {
  ok: boolean;
  user?: any;
  error?: string;
}

/**
 * Full discoverable-credential login flow: fetches options from the backend
 * directly, prompts the OS biometric UI, then posts the assertion to the
 * Next.js proxy route (which forwards the auth cookies) — same flow
 * Loginview.tsx finishes off with after a password login.
 */
export const loginWithBiometric = async (): Promise<BiometricLoginResult> => {
  const api = backend(undefined);

  let optionsRes;
  try {
    const res = await api.post("/webauthn/login/options");
    optionsRes = res.data;
  } catch {
    return { ok: false, error: "Could not start biometric login" };
  }

  if (!optionsRes?.ok) {
    return { ok: false, error: optionsRes?.message || "Could not start biometric login" };
  }

  let assertionResponse;
  try {
    assertionResponse = await startAuthentication({ optionsJSON: optionsRes.options });
  } catch (err: any) {
    if (err?.name === "NotAllowedError") {
      return { ok: false, error: "Biometric login was cancelled." };
    }
    return { ok: false, error: "Your device couldn't complete biometric login." };
  }

  try {
    const verifyRes = await fetch("/api/webauthn/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assertionResponse,
        challengeToken: optionsRes.challengeToken,
      }),
      credentials: "include",
    });

    const data = await verifyRes.json();

    if (!verifyRes.ok || data.error) {
      return { ok: false, error: data.error || "Biometric login failed" };
    }

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, error: "Network error during biometric login" };
  }
};

export interface PasskeyInfo {
  credentialID: string;
  deviceLabel: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export const listPasskeys = async (token: string): Promise<PasskeyInfo[]> => {
  const api = backend(token);
  const { data } = await api.get("/webauthn/credentials");
  if (!data?.ok) throw new Error(data?.message || "Could not load passkeys");
  return data.credentials || [];
};

export const removePasskey = async (token: string, credentialID: string): Promise<void> => {
  const api = backend(token);
  const { data } = await api.delete(`/webauthn/credentials/${encodeURIComponent(credentialID)}`);
  if (!data?.ok) throw new Error(data?.message || "Could not remove passkey");
};

const guessDeviceLabel = (): string => {
  if (typeof navigator === "undefined") return "Passkey";
  const ua = navigator.userAgent;
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) return "Android device";
  if (/macintosh/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows device";
  return "This device";
};