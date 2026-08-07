/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { golds } from "@/data/intresttypes";
import { createWeb3Payment, checkWeb3PaymentStatus, cancelWeb3Payment, verifyTransactionHash } from "@/api/web3payment";
import { RootState } from "@/store/store"
import { Copy, Check, ShieldCheck, Lock, RefreshCw, Trash2 } from "lucide-react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Web3Providers from "@/components/Web3Providers";
import { URL as API_URL } from "@/api/config";

// Icons for tags
const tagIcons: Record<string, React.ReactNode> = {
  "Casual Fan": <span role="img" aria-label="smile">🙂</span>,
  "Supporter": <span role="img" aria-label="hot">🔥</span>,
  "Member": <span role="img" aria-label="star">⭐</span>,
  "Fan Favorite": <span role="img" aria-label="heart">💖</span>,
  "Access": <span role="img" aria-label="key">🔑</span>,
  "VIP": <span role="img" aria-label="diamond">💎</span>,
  "Elite": <span role="img" aria-label="crown">👑</span>,
  "Black Card": <span role="img" aria-label="heart">🖤</span>,
  "Sovereign": <span role="img" aria-label="Diamond">💠</span>,
};

const Topup: React.FC = () => {
  return (
    <Web3Providers>
      <TopupInner />
    </Web3Providers>
  );
};

const TopupInner: React.FC = () => {
  const [selectedPackId, setSelectedPackId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentMethod] = useState<'web3'>('web3');
  const [web3Payment, setWeb3Payment] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [verifyingTx, setVerifyingTx] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [fromAddress, setFromAddress] = useState<string>("");
  const [buyerWalletVerifying, setBuyerWalletVerifying] = useState<boolean>(false);
  const [buyerWalletLoaded, setBuyerWalletLoaded] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

   const userId = useSelector((state: RootState) => state.profile.userId);
  const login = useSelector((state: RootState) => state.register.logedin);

  // Load any previously verified sender wallet on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const stored = localStorage.getItem("login");
        const token = stored ? JSON.parse(stored)?.accesstoken : null;
        if (!token) return;

        const res = await fetch(`${API_URL}/addpayment/buyer-wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.ok && data.walletAddress) {
          setFromAddress(data.walletAddress);
        }
      } catch (err) {
        console.error("Failed to load verified buyer wallet:", err);
      } finally {
        setBuyerWalletLoaded(true);
      }
    })();
  }, [userId]);

  const verifyAndSaveBuyerWallet = async () => {
    if (!address) return;
    setBuyerWalletVerifying(true);
    try {
      const message = `Confirm this wallet as your mmeko Gold purchase sender address.\n\nUser: ${userId}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const stored = localStorage.getItem("login");
      const token = stored ? JSON.parse(stored)?.accesstoken : null;

      const res = await fetch(`${API_URL}/addpayment/verify-buyer-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address, message, signature }),
      });
      const data = await res.json();

      if (data.ok) {
        setFromAddress(data.walletAddress);
        toast.success("Wallet verified and saved!", { autoClose: 2500 });
        disconnect(); // We only needed the signature — no reason to stay connected
      } else {
        toast.error(data.message || "Could not verify this wallet.", { autoClose: 3000 });
      }
    } catch (err: any) {
      if (err?.name === "UserRejectedRequestError" || err?.code === 4001) {
        toast.error("Signature request was rejected.", { autoClose: 2500 });
      } else {
        toast.error(err?.message || "Something went wrong verifying your wallet.", { autoClose: 3000 });
      }
    } finally {
      setBuyerWalletVerifying(false);
    }
  };

  const deleteBuyerWallet = async () => {
    try {
      const stored = localStorage.getItem("login");
      const token = stored ? JSON.parse(stored)?.accesstoken : null;
      await fetch(`${API_URL}/addpayment/buyer-wallet`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFromAddress("");
      toast.info("Wallet removed. Connect a new one whenever you're ready.", { autoClose: 2500 });
    } catch {
      toast.error("Failed to remove wallet.", { autoClose: 2500 });
    }
  };

 

  // Load existing payment from localStorage on page load
  useEffect(() => {
    const loadExistingPayment = () => {
      try {
        const savedPayment = localStorage.getItem('web3_payment');
        if (savedPayment) {
          const payment = JSON.parse(savedPayment);
          const now = new Date().getTime();
          const expiryTime = new Date(payment.expiresAt).getTime();

          if (now < expiryTime) {
            // Payment is still valid
            setWeb3Payment(payment);
            const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(remaining);
            console.log(`🔄 [FRONTEND] Restored existing payment: ${payment.orderId}, time left: ${remaining}s`);
            toast.info(`Restored your active payment. Time remaining: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`, { autoClose: 4000 });
          } else {
            // Payment has expired, remove it
            localStorage.removeItem('web3_payment');
            console.log(`⏰ [FRONTEND] Existing payment expired, removed from localStorage`);
          }
        }
      } catch (error) {
        console.error('Error loading existing payment:', error);
        localStorage.removeItem('web3_payment');
      }
    };

    loadExistingPayment();
  }, []);

  // Save payment to localStorage whenever it changes
  useEffect(() => {
    if (web3Payment) {
      localStorage.setItem('web3_payment', JSON.stringify(web3Payment));
    } else {
      localStorage.removeItem('web3_payment');
    }
  }, [web3Payment]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (web3Payment?.expiresAt && timeLeft > 0) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiryTime = new Date(web3Payment.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

        setTimeLeft(remaining);

        if (remaining === 0) {
          // Payment expired
          setWeb3Payment(null);
          setTxHash("");
          localStorage.removeItem('web3_payment');
          toast.error("Payment expired. Please create a new payment.", { autoClose: 5000 });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [web3Payment?.expiresAt, timeLeft]);

  const pay = async () => {
    if (!userId) {
      toast.error("Please log in to purchase gold", { autoClose: 2000 });
      return;
    }
    if (!selectedPackId) {
      toast.error("Please select a gold pack", { autoClose: 2000 });
      return;
    }
    if (!fromAddress.trim() || !/^0x[a-fA-F0-9]{40}$/.test(fromAddress.trim())) {
      toast.error("Enter the wallet address you'll be sending from (starts with 0x).", { autoClose: 3000 });
      return;
    }
    if (web3Payment) {
      toast.error("You already have an active payment. Please complete or cancel it first.", { autoClose: 3000 });
      return;
    }
    try {
      setLoading(true);
      const selectedGold = golds.find((gold) => gold.id === selectedPackId);
      const amount = Number((selectedGold?.amount || "0").replace(/[^0-9.]/g, ""));

      console.log("Selected gold pack:", selectedGold);
      console.log("Amount to pay:", amount);

      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid gold pack amount", { autoClose: 2000 });
        return;
      }

      // Web3 Payment (only option)
      const res = await createWeb3Payment({
        amount,
        userId,
        order_description: `Gold Pack Purchase: ${selectedGold?.value} Gold`,
        fromAddress: fromAddress.trim()
      });

      setWeb3Payment(res);

      // Initialize countdown timer
      const now = new Date().getTime();
      const expiryTime = new Date(res.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);

      toast.success("Payment created! Send USDT or USDC and paste your transaction hash.", { autoClose: 5000 });
    } catch (error) {
      console.error("Payment error details:", error);
      toast.error("An error occurred during payment", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!web3Payment?.orderId) {
      return;
    }

    console.log(`🔍 [FRONTEND] Starting status check for order ID: ${web3Payment.orderId}`);
    console.log(`🔍 [FRONTEND] Current payment data:`, web3Payment);

    try {
      setCheckingStatus(true);
      console.log(`📡 [FRONTEND] Calling API: checkWeb3PaymentStatus(${web3Payment.orderId})`);

      const status = await checkWeb3PaymentStatus(web3Payment.orderId);


      if (status.status === 'confirmed') {
        toast.success("Payment confirmed! Your gold has been added to your account.", { autoClose: 5000 });
        setWeb3Payment(null);
        setSelectedPackId("");
        setTxHash("");
        setTimeLeft(0);
        localStorage.removeItem('web3_payment');
      } else {
        console.log(`ℹ️ [FRONTEND] Payment status: ${status.status} - showing info to user`);
        toast.info(`Payment status: ${status.status}`, { autoClose: 3000 });
      }
    } catch (error) {
      toast.error("Failed to check payment status", { autoClose: 2000 });
    } finally {
      setCheckingStatus(false);
      console.log(`🏁 [FRONTEND] Status check completed`);
    }
  };

  const cancelTransaction = async () => {
    if (!web3Payment?.orderId) return;

    try {
      setLoading(true);
      await cancelWeb3Payment(web3Payment.orderId);
      toast.success("Transaction cancelled successfully", { autoClose: 3000 });
      setWeb3Payment(null);
      setSelectedPackId("");
      setTxHash("");
      setTimeLeft(0);
      localStorage.removeItem('web3_payment');
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel transaction", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const copyWalletAddress = async () => {
    if (web3Payment?.walletAddress) {
      try {
        await navigator.clipboard.writeText(web3Payment.walletAddress);
        setCopiedWallet(true);
        toast.success("Wallet address copied!", { autoClose: 2000 });
        setTimeout(() => setCopiedWallet(false), 2000);
      } catch (error) {
        toast.error("Failed to copy wallet address", { autoClose: 2000 });
      }
    }
  };

  const copyOrderId = async () => {
    if (web3Payment?.orderId) {
      try {
        await navigator.clipboard.writeText(web3Payment.orderId);
        setCopiedOrderId(true);
        toast.success("Order ID copied!", { autoClose: 2000 });
        setTimeout(() => setCopiedOrderId(false), 2000);
      } catch (error) {
        toast.error("Failed to copy Order ID", { autoClose: 2000 });
      }
    }
  };

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const verifyTransaction = async () => {
    if (!web3Payment?.orderId || !txHash.trim()) {
      toast.error("Please enter your transaction hash", { autoClose: 2000 });
      return;
    }

    try {
      setVerifyingTx(true);
      console.log(`🔍 [FRONTEND] Verifying transaction hash: ${txHash}`);

      const result = await verifyTransactionHash(web3Payment.orderId, txHash.trim());

      console.log(`✅ [FRONTEND] Transaction verified:`, result);

      if (result.status === 'confirmed') {
        toast.success("Payment confirmed! Your gold has been added to your account.", { autoClose: 5000 });
        setWeb3Payment(null);
        setTxHash("");
        setSelectedPackId("");
        setTimeLeft(0);
        localStorage.removeItem('web3_payment');
      } else {
        toast.info(`Payment status: ${result.status}`, { autoClose: 3000 });
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Transaction verification error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Transaction verification failed: ${errorMessage}`, { autoClose: 5000 });
    } finally {
      setVerifyingTx(false);
    }
  };

  // Table data from golds array
  const tableRows = golds.map((gold) => (
    <tr
      key={gold.value}
      className={`border-b border-white/[0.05] last:border-b-0 transition-colors ${
        selectedPackId === gold.id ? "bg-[#6c63ff]/[0.08]" : ""
      }`}
    >
      <td className="py-2.5 px-2 text-center text-sm sm:text-base border-r border-white/[0.05] whitespace-nowrap text-white font-medium">
        {gold.value}
      </td>
      <td className="py-2.5 px-2 text-center text-sm sm:text-base border-r border-white/[0.05] whitespace-nowrap text-gray-300">
        {gold.amount}
      </td>
      <td className="py-2.5 px-2 text-center text-sm sm:text-base whitespace-nowrap">
        {gold.tag ? (
          <span className="flex items-center gap-1 justify-center whitespace-nowrap text-[#c9c4ff]">
            {tagIcons[gold.tag] || null}
            {gold.tag}
          </span>
        ) : <span className="text-gray-600">-</span>}
      </td>
    </tr>
  ));

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-4 sm:px-6 pt-4 sm:pt-6 pb-16">
      <div className="flex flex-col items-center w-full max-w-md mx-auto">

        {/* Brand mark */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f5c451] to-[#e8a93a] flex items-center justify-center text-xl font-extrabold text-[#1A1C2C] shadow-[0_12px_28px_-10px_rgba(245,196,81,0.6)]">
          ✦
        </div>

        {/* Title */}
        <h1 className="mt-3 text-white text-2xl sm:text-3xl font-bold text-center">Gold Shop</h1>

        {/* Subtitle */}
        <p className="text-[#8b8fa3] text-sm text-center mt-1.5 max-w-xs">
          Fuel real connections. Buy Gold securely and book creators with confidence.
        </p>

        {/* Trust badges row */}
        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#a7e3c4] bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3 h-3" /> Payment protected
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#c9c4ff] bg-[#6c63ff]/10 border border-[#6c63ff]/25 rounded-full px-3 py-1.5">
            <Lock className="w-3 h-3" /> Verified on-chain
          </span>
        </div>

        {/* Accepted tokens line */}
        <div className="flex items-center mt-5 gap-2">
          <span
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #f5c451, #e8a93a)",
              width: 24,
              height: 24,
            }}
          >
            <span className="text-[#1A1C2C] text-base font-bold">$</span>
          </span>
          <span className="text-[#b6b7c7] text-sm sm:text-base font-medium">
            Buy Gold with USDT or USDC <span className="text-[#636583] font-normal">(BEP20)</span>
          </span>
        </div>

        {/* Table Card */}
        <div className="w-full bg-[#111624] rounded-2xl shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] p-0 mb-6 mt-4 sm:mt-6 overflow-x-auto border border-white/[0.06]">
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3 px-2 font-semibold text-sm sm:text-base text-center border-r border-white/[0.06] whitespace-nowrap text-gray-400">Pack</th>
                <th className="py-3 px-2 font-semibold text-sm sm:text-base text-center border-r border-white/[0.06] whitespace-nowrap text-gray-400">Price</th>
                <th className="py-3 px-2 font-semibold text-sm sm:text-base text-center whitespace-nowrap text-gray-400">Tag</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {/* Payment Form */}
        <div className="flex flex-col items-center gap-4 w-full">

          <select
            required
            className="block bg-[#111624] text-white rounded-xl px-3 py-3 sm:px-4 w-full appearance-none border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] font-medium text-sm sm:text-base transition-colors"
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
          >
            <option value="" disabled>
              Choose Gold Pack
            </option>
            {golds.map((value) => (
              <option key={value.id} value={value.id}>
                {value.value} Gold / ${value.amount.replace(/[^0-9.]/g, "")}
              </option>
            ))}
          </select>

          {!web3Payment && (
            <div className="w-full">
              {fromAddress ? (
                <div className="border border-green-500/30 bg-gradient-to-br from-green-500/[0.08] to-green-500/[0.02] rounded-xl px-3.5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-green-400 text-[11px] font-semibold">Verified sender wallet</span>
                    </div>
                    <p className="text-white text-sm font-mono truncate">
                      {fromAddress.slice(0, 6)}...{fromAddress.slice(-4)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={deleteBuyerWallet}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0 ml-2"
                    title="Remove wallet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : isConnected && address ? (
                <button
                  type="button"
                  onClick={verifyAndSaveBuyerWallet}
                  disabled={buyerWalletVerifying}
                  className="w-full border border-[#6c63ff] bg-[#6c63ff]/10 hover:bg-[#6c63ff]/15 rounded-xl px-4 py-3 text-sm font-semibold text-[#c9c4ff] transition-colors disabled:opacity-60"
                >
                  {buyerWalletVerifying
                    ? "Waiting for signature..."
                    : `Sign to verify ${address.slice(0, 6)}...${address.slice(-4)}`}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="w-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(108,99,255,0.5)] hover:-translate-y-0.5 transition-all"
                  >
                    Connect Wallet
                  </button>
                  <p className="text-xs text-gray-500 mt-2 px-1 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                    We verify this once with a signature, then remember it — no more retyping it on every purchase.
                  </p>
                </>
              )}
            </div>
          )}

          {!web3Payment ? (
            <button
              className={`w-full h-12 rounded-xl font-bold text-base sm:text-lg transition-all ${
                loading
                  ? "bg-gradient-to-r from-[#6c63ff]/50 to-[#9b59f5]/50 text-white/60 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 active:translate-y-0"
              }`}
              onClick={pay}
              disabled={loading}
            >
              {loading ? "Processing..." : "Create Payment"}
            </button>
          ) : (
            <div className="w-full bg-[#111624] rounded-2xl p-6 border border-white/[0.06] shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]">
              {/* 30-Minute Payment Window Notice */}
              <div className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/25 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#1A1C2C] text-lg font-bold">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-amber-300 font-bold text-base">30-Minute Payment Window</h3>
                    <p className="text-amber-200/70 text-xs mt-0.5">Once it closes, it&apos;s gone for good.</p>
                    <p className="text-amber-100/90 text-xs font-medium">Complete your payment before time runs out.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"></div>
                  <h3 className="text-white font-bold text-lg">Web3 Payment</h3>
                </div>
                {timeLeft > 0 && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-red-300 font-mono text-sm">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
              </div>

              {/* Reassurance banner */}
              <div className="flex items-start gap-2.5 bg-[#6c63ff]/[0.08] border border-[#6c63ff]/20 rounded-xl px-3.5 py-3 mb-4">
                <ShieldCheck className="w-4 h-4 text-[#9b59f5] shrink-0 mt-0.5" />
                <p className="text-xs text-[#c9c4ff] leading-relaxed">
                  Your payment is protected — we verify every transaction directly on-chain before Gold is credited to your account.
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#0d1120] rounded-xl p-4 mb-4 border border-white/[0.05]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Amount</span>
                    <div className="text-white font-semibold text-lg">{web3Payment.amount}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Network</span>
                    <div className="text-white font-semibold">{web3Payment.network}</div>
                  </div>
                </div>
              </div>

              {/* Order ID Section */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">
                  Order ID
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-[#0d1120] rounded-xl border border-white/[0.05]">
                  <div className="flex-1 font-mono text-xs text-white break-all">
                    {web3Payment.orderId}
                  </div>
                  <button
                    onClick={copyOrderId}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all shrink-0"
                  >
                    {copiedOrderId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedOrderId ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-0.5">
                  Send USDT or USDC to this address
                </label>
                <div className="flex items-center gap-2 p-3 bg-[#0d1120] rounded-xl border border-white/[0.05]">
                  <div className="flex-1 font-mono text-xs text-white break-all">
                    {web3Payment.walletAddress}
                  </div>
                  <button
                    onClick={copyWalletAddress}
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all shrink-0"
                  >
                    {copiedWallet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedWallet ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1.5 ml-0.5">
                  ⚠ BEP20 network only — sending on another network may result in permanent loss of funds.
                </p>
              </div>

              {/* Transaction Hash Input Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-0.5">
                  Paste your transaction hash
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 p-3 bg-[#0d1120] text-white rounded-xl border border-white/[0.05] focus:outline-none focus:ring-1 focus:ring-[#6c63ff] focus:border-[#6c63ff] font-mono text-xs transition-colors"
                  />
                  <button
                    onClick={verifyTransaction}
                    disabled={verifyingTx || !txHash.trim() || timeLeft === 0}
                    className="px-4 py-3 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {verifyingTx ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Verify
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-5">
                <div className="text-xs text-gray-500 leading-relaxed">
                  {web3Payment.instructions}
                </div>
                <div className="text-xs text-amber-200/90 mt-3 p-3 bg-amber-500/[0.07] rounded-xl border border-amber-500/20">
                  💡 <strong className="text-amber-300">How to get your transaction hash:</strong> After sending, copy the transaction hash from your wallet or blockchain explorer and paste it above.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 px-4 bg-white/[0.04] border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={checkPaymentStatus}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {checkingStatus ? "Checking..." : "Refresh Status"}
                </button>
                <button
                  className="flex-1 py-3 px-4 bg-red-500/10 border border-red-500/25 text-red-300 rounded-xl font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={cancelTransaction}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel"
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-600 mt-4">
                🔒 Your funds are never at risk of double-charging — each transaction can only be used once.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topup;