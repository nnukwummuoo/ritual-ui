"use client";
import Link from "next/link";
import React, { useState } from "react";
import { toast, ToastContainer } from "material-react-toastify";
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

  async function handleForgetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString() || "";
    const secretPhrase = formData.get("secretPhrase")?.toString() || "";
    const newPassword = formData.get("newPassword")?.toString() || "";

    if (!username || !secretPhrase || !newPassword) {
      setFormError("Please fill in all fields.");
      toastError({ message: "Please fill in all fields." });
      setLoading(false);
      return;
    }

    const secretPhraseArray = secretPhrase.trim().split(/\s+/);
    if (secretPhraseArray.length !== 12) {
      setFormError("Secret phrase must be exactly 12 words.");
      toastError({ message: "Secret phrase must be exactly 12 words." });
      setLoading(false);
      return;
    }

    try {
      const response: ForgetPasswordResponse = await forgetpass({
        username,
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
      className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4"
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
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
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
              pattern="@[a-z0-9_]{3,15}"
              title="Username: @ followed by 3-15 lowercase letters, numbers, or _"
              required={true}
            />
            <label htmlFor="username" className="text-gray-400 text-sm mt-1">
              Username
            </label>
          </div>
          <div className="flex flex-col">
            <Input
              type="text"
              name="secretPhrase"
              placeholder="Enter your 12-word recovery phrase"
              required={true}
            />
            <label htmlFor="secretPhrase" className="text-gray-400 text-sm mt-1">
              Recovery Phrase
            </label>
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
