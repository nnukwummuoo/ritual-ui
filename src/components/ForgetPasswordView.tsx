"use client";
import Link from "next/link";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Input from "./Input";
import { forgetpass } from "@/lib/service/forgetpassword";
import toastError from "./ToastError";

type ForgetPasswordResponse = {
  ok: boolean;
  message: string;
};

export const ForgetPasswordView = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const [phraseWords, setPhraseWords] = useState<string[]>(Array(12).fill(""));

  const handlePhraseWordChange = (index: number, value: string) => {
    setPhraseWords((prev) => {
      const next = [...prev];
      next[index] = value.trim();
      return next;
    });
  };

  const handlePhrasePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim().split(/\s+/);
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
    <div
      className="flex flex-col items-center justify-center h-screen bg-[#080b14] text-white px-4 overflow-y-auto py-8"
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        margin: "0 10px",
        width: "90%",
        maxWidth: "450px",
      }}
    >
      <ToastContainer position="top-center" theme="dark" />
      <div className="bg-[#111624] rounded-lg shadow-lg p-6 w-full max-w-md my-auto">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-3xl font-bold text-center">
          Reset Your Password
        </h1>
        <p className="text-gray-400 text-center mt-2">
          Enter your details to reset your password
        </p>
        <form onSubmit={handleForgetPassword} className="mt-6 space-y-4">
          <div className="flex flex-col">
           <Input
  type="text"
  name="username"
  placeholder="@username"
  pattern="^@?[a-z0-9_]{3,15}$"
  title="Username: optional @ followed by 3-15 lowercase letters, numbers, or _"
  required={true}
  value={username}
  onChange={(e) => setUsername(e.target.value.toLowerCase())}
/>
            <label htmlFor="username" className="text-gray-400 text-sm mt-1">
              Username
            </label>
          </div>
         <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-2">Recovery Phrase</label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {phraseWords.map((word, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs w-4 shrink-0 text-right">{index + 1}.</span>
                  <input
                    type="text"
                    value={word}
                    autoComplete="off"
                    onChange={(e) => handlePhraseWordChange(index, e.target.value)}
                    onPaste={(e) => handlePhrasePaste(index, e)}
                    className="w-full min-w-0 bg-[#0a0d18] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <Input
              type="password"
              name="newPassword"
              placeholder="New Password"
              required={true}
            />
            <label htmlFor="newPassword" className="text-gray-400 text-sm mt-1">
              New Password
            </label>
          </div>
          {formError && (
            <p className="text-red-500 text-sm text-center">{formError}</p>
          )}
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded shadow transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
          <p className="text-gray-400 text-sm text-center mt-4">
            Back to{" "}
            <Link
              className="text-blue-500 font-bold hover:underline cursor-pointer"
              href="/"
            >
              Login
            </Link>
          </p>
          <p className="text-gray-400 text-sm text-center">
            Don't have an account?{" "}
            <Link
              className="text-blue-500 font-bold hover:underline cursor-pointer"
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
