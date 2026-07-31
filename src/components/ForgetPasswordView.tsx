"use client";
import Link from "next/link";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Input from "./Input";
import { forgetpass } from "@/lib/service/forgetpassword";
import toastError from "./ToastError";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

type ForgetPasswordResponse = {
  ok: boolean;
  message: string;
};

export const ForgetPasswordView = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phraseWords, setPhraseWords] = useState<string[]>(Array(12).fill(""));

  const handlePhraseWordChange = (index: number, value: string) => {
    setPhraseWords((prev) => {
      const next = [...prev];
      next[index] = value.toLowerCase().trim();
      return next;
    });
  };

  const handlePhrasePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").toLowerCase().trim().split(/\s+/);
    if (pasted.length > 1) {
      e.preventDefault();
      setPhraseWords((prev) => {
        const next = [...prev];
        for (let i = 0; i < pasted.length && index + i < 12; i++) {
          next[index + i] = pasted[i];
        }
        return next;
      });
    }
  };

  async function handleForgetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
   const usernameInput = username.trim();
const normalizedUsername = usernameInput.startsWith("@") ? usernameInput : (usernameInput ? `@${usernameInput}` : "");
    const newPassword = formData.get("newPassword")?.toString() || "";

    if (!normalizedUsername || !newPassword) {
      setFormError("Please fill in all fields.");
      toastError({ message: "Please fill in all fields." });
      setLoading(false);
      return;
    }

    const secretPhraseArray = phraseWords.map((w) => w.trim());
    if (secretPhraseArray.some((w) => !w) || secretPhraseArray.length !== 12) {
      setFormError("Please fill in all 12 words of your recovery phrase.");
      toastError({ message: "Please fill in all 12 words of your recovery phrase." });
      setLoading(false);
      return;
    }

    try {
      const response: ForgetPasswordResponse = await forgetpass({
        username: normalizedUsername,
        secretPhrase: secretPhraseArray,
        newPassword,
      });

      if (response.ok) {
        toast.success("Password updated successfully!", { style: { backgroundColor: "#111" } });
        // optionally redirect user back to login page
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error("[ForgetPassword] Error:", error);
      setFormError(error.message || "Password reset failed!");
      toastError({ message: error.message || "Password reset failed!" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#080b14] text-white px-4 overflow-y-auto py-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-[#6c63ff]/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#9b59f5]/15 blur-3xl" />

      <ToastContainer position="top-center" theme="dark" />

      {/* Brand mark */}
      <div className="mb-5 flex flex-col items-center relative">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] flex items-center justify-center font-extrabold text-white text-lg shadow-[0_12px_30px_-10px_rgba(108,99,255,0.6)] mb-3">
          <FaKey className="text-sm" />
        </div>
      </div>

      <div
        className="rounded-2xl p-6 w-full max-w-md my-auto border relative"
        style={{
          backgroundColor: '#111624',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 30px 70px -25px rgba(0,0,0,0.65)',
        }}
      >
        <h1 className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent text-2xl font-extrabold text-center">
          Reset Your Password
        </h1>
        <p className="text-[#94a3b8] text-sm text-center mt-1.5">
          Enter your details to reset your password
        </p>
        <form onSubmit={handleForgetPassword} className="mt-6 space-y-5">
          <div className="flex flex-col">
            <label className="text-[#94a3b8] text-xs font-medium mb-1.5 ml-0.5">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm pointer-events-none" />
              <Input
                type="text"
                name="username"
                placeholder="@username"
                pattern="^@?[a-z0-9_]{3,15}$"
                title="Username: optional @ followed by 3-15 lowercase letters, numbers, or _"
                required={true}
                overide={true}
                classNames="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[#94a3b8] text-xs font-medium mb-2 ml-0.5">Recovery Phrase</label>
            <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/10 rounded-xl p-3">
              {phraseWords.map((word, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5">
                  <span className="text-[#9b59f5] text-xs font-semibold w-4 shrink-0 text-right">{index + 1}.</span>
                  <input
                    type="text"
                    value={word}
                    autoComplete="off"
                    onChange={(e) => handlePhraseWordChange(index, e.target.value)}
                    onPaste={(e) => handlePhrasePaste(index, e)}
                    className="w-full min-w-0 bg-transparent text-xs text-white placeholder:text-gray-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[#94a3b8] text-xs font-medium mb-1.5 ml-0.5">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                required={true}
                overide={true}
                classNames="w-full pl-10 pr-10 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-red-400 text-sm text-center">{formError}</p>
          )}

          <button
            className="w-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white py-3.5 rounded-xl font-semibold text-sm shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)]"
            disabled={loading}
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>

          <p className="text-sm text-center mt-4 text-[#94a3b8]">
            Back to{" "}
            <Link
              className="text-[#9b59f5] font-semibold hover:text-[#b48cf7] hover:underline underline-offset-2"
              href="/"
            >
              Login
            </Link>
          </p>
          <p className="text-sm text-center text-[#94a3b8]">
            Don&apos;t have an account?{" "}
            <Link
              className="text-[#9b59f5] font-semibold hover:text-[#b48cf7] hover:underline underline-offset-2"
              href="/auth/register"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};