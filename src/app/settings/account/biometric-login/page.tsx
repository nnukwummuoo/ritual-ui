"use client";
import React, { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { Fingerprint, Trash2, ShieldCheck, Laptop, Smartphone } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  isBiometricAvailable,
  registerBiometric,
  listPasskeys,
  removePasskey,
  type PasskeyInfo,
} from "@/lib/service/webauthn";

const BiometricLoginPage = () => {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.register.accesstoken);

  const getToken = () => {
    if (accessToken) return accessToken;
    try {
      const stored = localStorage.getItem("login");
      if (stored) {
        const data = JSON.parse(stored);
        return data?.accesstoken || "";
      }
    } catch {
      // ignore
    }
    return "";
  };

  const refreshList = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      router.push("/auth/login");
      return;
    }
    setLoadingList(true);
    try {
      const list = await listPasskeys(token);
      setPasskeys(list);
    } catch (error: any) {
      toast.error(error.message || "Could not load your passkeys.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    isBiometricAvailable().then(setSupported);
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPasskey = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      router.push("/auth/login");
      return;
    }

    setRegistering(true);
    try {
      await registerBiometric(token);
      toast.success("Passkey added!");
      await refreshList();
    } catch (error: any) {
      toast.error(error.message || "Could not set up biometric login.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRemove = async (credentialID: string) => {
    const token = getToken();
    if (!token) return;

    setRemovingId(credentialID);
    try {
      await removePasskey(token, credentialID);
      setPasskeys((prev) => prev.filter((p) => p.credentialID !== credentialID));
      toast.success("Passkey removed.");
    } catch (error: any) {
      toast.error(error.message || "Could not remove passkey.");
    } finally {
      setRemovingId(null);
    }
  };

  const deviceIcon = (label: string) => {
    if (/iphone|android|mobile/i.test(label)) return <Smartphone className="w-4 h-4" />;
    return <Laptop className="w-4 h-4" />;
  };

  return (
    <div className="px-3 mx-auto mt-16 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 md:px-0">
      <ToastContainer position="top-center" theme="dark" />
      <div className="flex flex-col w-full">
        <header className="flex items-center gap-4">
          <FaAngleLeft
            color="white"
            size={30}
            onClick={() => router.push("/settings/account")}
          />
          <h4 className="text-lg font-bold text-white">BIOMETRIC LOGIN</h4>
        </header>

        <div className="w-full max-w-md mt-8 space-y-6">
          <div className="bg-[#161b2e] border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#9b59f5]/10 border border-[#9b59f5]/20 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5 text-[#b48cf7]" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Use Face ID, Touch ID, or your device&apos;s biometrics to log in
                instantly — no password needed. You can register more than one device.
              </p>
            </div>
          </div>

          {supported === false && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-300 text-sm">
                This device or browser doesn&apos;t support biometric login. Try this page
                on a phone or laptop with Face ID, Touch ID, or Windows Hello set up.
              </p>
            </div>
          )}

          {supported && (
            <button
              onClick={handleAddPasskey}
              disabled={registering}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              {registering ? "Waiting for device…" : "Add This Device"}
            </button>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Your passkeys
            </h3>

            {loadingList ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : passkeys.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400">No passkeys set up yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {passkeys.map((pk) => (
                  <div
                    key={pk.credentialID}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-300">
                        {deviceIcon(pk.deviceLabel)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{pk.deviceLabel}</p>
                        <p className="text-xs text-gray-500">
                          Added {new Date(pk.createdAt).toLocaleDateString()}
                          {pk.lastUsedAt &&
                            ` • Last used ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(pk.credentialID)}
                      disabled={removingId === pk.credentialID}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      aria-label="Remove passkey"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Your biometric data never leaves your device — we only store a security key
              that proves it&apos;s you, the same technology used by banking and passkey apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricLoginPage;