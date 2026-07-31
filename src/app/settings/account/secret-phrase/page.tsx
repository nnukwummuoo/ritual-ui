"use client";
import React, { useState } from "react";
import { FaAngleLeft, FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { regenerateSecretPhrase } from "@/lib/service/regenerateSecretPhrase";

type Stage = "confirm" | "reveal";

const SecretPhrasePage = () => {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("confirm");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPhrase, setNewPhrase] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleRegenerate = async () => {
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const response = await regenerateSecretPhrase(password, token);
      if (response.ok && response.secretPhrase) {
        setNewPhrase(response.secretPhrase);
        setStage("reveal");
        toast.success("New recovery phrase generated!");
      } else {
        toast.error(response.message || "Failed to regenerate phrase.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate phrase.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const copyToClipboard = () => {
    const numbered = newPhrase.map((word, index) => `${index + 1}. ${word.toLowerCase()}`).join("\n");
    navigator.clipboard.writeText(numbered);
    setCopied(true);
    toast.success("Phrase copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPhrase = () => {
    const htmlContent = `
    <html>
      <head>
        <title>Recovery Phrase</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #111; text-align: center; margin-top: 100px; }
          .word { display: inline-block; margin: 8px 12px; padding: 10px 15px; border: 2px solid #333; border-radius: 8px; }
        </style>
      </head>
      <body>
        ${newPhrase.map((word, index) => `<div class="word">${index + 1}. ${word.toLowerCase()}</div>`).join("")}
      </body>
    </html>`;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "recovery-phrase.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const finishAndReturn = () => {
    if (!saved) {
      toast.error("Please confirm you've saved your new recovery phrase.");
      return;
    }
    router.push("/settings/account");
  };

  return (
    <div className="px-3 mx-auto mt-16 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 md:px-0">
      <ToastContainer position="top-center" theme="dark" />
      <div className="flex flex-col w-full">
        <header className="flex items-center gap-4">
          <FaAngleLeft
            color="white"
            size={30}
            onClick={() => {
              if (stage === "reveal" && !saved) {
                toast.info("Please confirm you've saved your phrase before leaving.");
                return;
              }
              router.push("/settings/account");
            }}
          />
          <h4 className="text-lg font-bold text-white">RECOVERY PHRASE</h4>
        </header>

        {stage === "confirm" && (
          <div className="w-full max-w-md mt-8 space-y-6">
            <div className="bg-[#161b2e] border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                For your security, we can&apos;t show you your original recovery phrase —
                it was never stored. Instead, you can generate a{" "}
                <span className="text-white font-semibold">brand-new</span> 12-word phrase.
                Your old one will stop working immediately once you confirm.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Confirm your password to continue
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  className="w-full px-4 py-4 text-white bg-inherit border border-gray-600 rounded-md"
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  placeholder="Your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 flex items-center text-gray-400 right-4 hover:text-white"
                >
                  {showPassword ? <FaRegEyeSlash size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>
            </div>

            <button
              className="w-full max-w-md px-4 py-3 mt-2 font-medium text-black bg-white rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={handleRegenerate}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Generate New Recovery Phrase"}
            </button>
          </div>
        )}

        {stage === "reveal" && (
          <div className="w-full max-w-md mt-8 space-y-5">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent">
                Save Your New Recovery Phrase
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                This is the only time you'll see it. Your old phrase no longer works.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-4">
              {newPhrase.map((word, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-2">
                  <span className="text-[#9b59f5] text-xs font-bold">{index + 1}.</span>
                  <span className="text-white text-sm font-medium">{word}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 font-semibold text-sm mb-1">⚠️ Important</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                This phrase is the only way to recover your account. If you lose it, we cannot help you.
                Keep it safe. Never share it with anyone.
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="flex-1 py-2 rounded-lg border border-white/15 text-sm text-white hover:bg-white/5">
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
              <button onClick={downloadPhrase} className="flex-1 py-2 rounded-lg border border-white/15 text-sm text-white hover:bg-white/5">
                📥 Download
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={saved} onChange={() => setSaved((s) => !s)} className="w-4 h-4" />
              <span className="text-sm text-gray-300">I have saved my new recovery phrase securely</span>
            </label>

            <button
              className="w-full px-4 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] disabled:opacity-50"
              onClick={finishAndReturn}
              disabled={!saved}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretPhrasePage;