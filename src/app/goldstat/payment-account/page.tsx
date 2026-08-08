"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { URL } from "../../../api/config";
import CountrySelect from "../../../components/CountrySelect/CountrySelect";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Web3Providers from "@/components/Web3Providers";

interface PaymentAccount {
  _id: string;
  method: "crypto";
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  currency: string;
  cryptoType: "BTC" | "USDT_TRC20" | "USDT_ERC20";
  walletAddress: string;
}

interface FormData {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  cryptoType?: "BTC" | "USDT_TRC20" | "USDT_ERC20";
  walletAddress?: string;
}

export default function PaymentAccountPage() {
  return (
    <Web3Providers>
      <PaymentAccountPageInner />
    </Web3Providers>
  );
}

function PaymentAccountPageInner() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({});
  const [agree, setAgree] = useState<boolean>(false);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFetchingAccount, setIsFetchingAccount] = useState<boolean>(true);
  const [returnToWithdrawal, setReturnToWithdrawal] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");

  const [walletVerifying, setWalletVerifying] = useState<boolean>(false);
  const [walletVerified, setWalletVerified] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Get user data from Redux and session from useAuth (same as history page)
  const userData = useSelector((state: RootState) => state.profile);
  const { session } = useAuth();

  const verifyConnectedWallet = useCallback(async () => {
    if (!address) return;
    setWalletError("");
    setWalletVerifying(true);
    try {
      const message = `Confirm this wallet as your mmeko payout address.\n\nUser: ${session?._id || ""}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const res = await fetch(`${URL}/addpayment/verify-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ address, message, signature }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setFormData((prev) => ({ ...prev, walletAddress: address }));
        setWalletVerified(true);
      } else {
        setWalletError(data.message || "Could not verify this wallet. Please try again.");
      }
    } catch (err: any) {
      if (err?.name === "UserRejectedRequestError" || err?.code === 4001) {
        setWalletError("Signature request was rejected.");
      } else {
        setWalletError(err?.message || "Something went wrong verifying your wallet.");
      }
    } finally {
      setWalletVerifying(false);
    }
  }, [address, session, URL]);

  const disconnectWallet = () => {
    disconnect();
    setFormData((prev) => ({ ...prev, walletAddress: "" }));
    setWalletVerified(false);
  };

  // Wallet address validation function
  const validateWalletAddress = (address: string): boolean => {
    if (!address) return false;

    if (!address.startsWith('0x') || address.length !== 42) {
      setWalletError("Invalid wallet address. Please enter a valid  USDT (BEP20 - Binance Smart Chain) address.");
      return false;
    }

    const hexPattern = /^0x[0-9a-fA-F]{40}$/;
    if (!hexPattern.test(address)) {
      setWalletError("Invalid wallet address. Please enter a valid  USDT (BEP20 - Binance Smart Chain) address.");
      return false;
    }

    setWalletError("");
    return true;
  };

  // Function to get user's full name from Redux or localStorage
  const getUserFullName = useCallback(() => {
    if (userData?.firstname && userData?.lastname) {
      return `${userData.firstname} ${userData.lastname}`;
    }
    if (userData?.firstname) {
      return userData.firstname;
    }

    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.fullName || parsed.name || parsed.nickname || '';
      }
    } catch (error) {
      console.error('Error parsing localStorage userData:', error);
    }

    return '';
  }, [userData?.firstname, userData?.lastname]);

  useEffect(() => {
    if (!formData.fullName) {
      const fullName = getUserFullName();
      if (fullName) {
        setFormData(prev => ({ ...prev, fullName }));
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('return') === 'withdrawal') {
      setReturnToWithdrawal(true);
    }
  }, [formData.fullName, getUserFullName]);

  const fetchAccount = useCallback(async () => {
    if (!session?._id || !session?.token) {
      setIsFetchingAccount(false);
      return;
    }
    setIsFetchingAccount(true);
    try {
      const res = await fetch(`${URL}/addpayment/check-account/${session._id}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data: { exists: boolean; account?: PaymentAccount } = await res.json();
      if (res.ok && data.exists) {
        setAccount(data.account ?? null);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error("❌ [PaymentAccount] Error fetching account:", err);
      setAccount(null);
    } finally {
      setIsFetchingAccount(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleDeleteAccount = async () => {
    if (!account || !window.confirm("Are you sure you want to delete this account?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${URL}/addpayment/${session?._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });

      const data: { message: string } = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete account.");
        return;
      }

      alert("Account deleted successfully.");
      setAccount(null);
    } catch (err) {
      console.error("❌ [PaymentAccount] Delete error:", err);
      alert("Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert("Please confirm the acknowledgment checkbox.");
      return;
    }

    if (!formData.currency) {
      alert("Please select a stable coin (USDT or USDC).");
      return;
    }

    if (!formData.walletAddress || !walletVerified) {
      setWalletError("Please connect and verify your wallet before saving.");
      return;
    }

    const payload = {
      method: "crypto",
      ...formData,
    };

    setLoading(true);
    try {
      const res = await fetch(`${URL}/addpayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data: { message: string; data: PaymentAccount } = await res.json();

      if (!res.ok) {
        alert(data.message || "Submission failed");
        return;
      }

      alert("✅ Account saved successfully!");
      setFormData({});
      setAgree(false);
      setWalletVerified(false);
      disconnect();
      await fetchAccount();

      if (returnToWithdrawal) {
        router.push('/goldstat/history');
      }
    } catch (err) {
      console.error("❌ [PaymentAccount] Submit error:", err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: string,
    placeholder: string,
    type: string = "text",
    required: boolean = true
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-left text-sm font-medium text-gray-300">{placeholder}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={formData[name as keyof FormData] || ''}
        className="border border-white/10 rounded-xl text-white bg-white/[0.02] px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b14] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Payment Account
          </h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Current Account Status */}
            <div className="bg-[#111624] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Current Account Status</h2>
              {isFetchingAccount ? (
                <p className="text-sm text-gray-500 animate-pulse">Checking for account...</p>
              ) : (
                <div className="space-y-4">
                  {account ? (
                    <div className="bg-green-500/[0.06] border border-green-500/25 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_6px_#4ade80]"></span>
                        <span className="text-green-400 font-medium text-sm">Account Connected</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {(() => {
                          const cryptoType = account.cryptoType;
                          if (!cryptoType) return 'Crypto';
                          if (cryptoType.includes('_')) {
                            const [currency, network] = cryptoType.split('_');
                            return `${currency} (${network})`;
                          }
                          return cryptoType;
                        })()} • <span className="font-mono">{account.walletAddress.slice(0, 6)}...{account.walletAddress.slice(-4)}</span>
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="mt-3 bg-red-500/10 border border-red-500/25 px-4 py-2 rounded-lg text-red-300 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {loading ? "Deleting..." : "Remove Account"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-500/[0.06] border border-amber-500/25 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <span className="text-amber-400 font-medium text-sm">No Account Connected</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Add your cryptocurrency account details to enable withdrawals
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Form */}
            <div className="bg-[#111624] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-1">Cryptocurrency Account Information</h2>
              <p className="text-xs text-gray-500 mb-5">This is where your earnings will be sent when you withdraw.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {renderInput("fullName", "Full Name")}
                {renderInput("email", "Email Address", "email")}
                {renderInput("phone", "Phone Number (optional)", "tel", false)}
                <div className="flex flex-col gap-1.5">
                  <label className="text-left text-sm font-medium text-gray-300">Country of Residence</label>
                  <CountrySelect onSelectCountry={(country) => setFormData({ ...formData, country })} />
                </div>

                {/* Choose Stablecoin */}
                <div className="flex flex-col gap-1.5">
                <label className="text-left text-sm font-medium text-gray-300">Choose Stablecoin <span className="text-red-400">*</span></label>
                  <div className="flex gap-3">
                    {["USDT (BEP-20)", "USDC (BEP-20)"].map((coin) => (
                      <div
                        key={coin}
                        onClick={() => setFormData({ ...formData, currency: coin })}
                        className={`flex-1 border rounded-xl px-2 py-3 text-xs sm:text-sm sm:px-4 font-semibold cursor-pointer transition-all text-center ${
                          formData.currency === coin
                            ? "border-[#6c63ff] bg-[#6c63ff]/10 text-[#c9c4ff]"
                            : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {coin}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choose Network */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-left text-sm font-medium text-gray-300">Choose Network</label>
                  <div className="border border-[#6c63ff] bg-[#6c63ff]/10 rounded-xl px-4 py-3 text-sm font-semibold text-[#c9c4ff] cursor-default flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#9b59f5]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    BNB Smart Chain
                  </div>
                  <div className="flex items-start gap-2 bg-amber-500/[0.06] border border-amber-500/25 rounded-xl px-3.5 py-2.5 mt-1">
                    <span className="text-amber-400 text-sm flex-shrink-0">⚠️</span>
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                      Withdrawals are only processed through <strong className="text-amber-300">BNB Smart Chain (BEP-20)</strong>. Sending to any other network will result in permanent loss of funds.
                    </p>
                  </div>
                </div>

                {/* Wallet Address — connected + signature-verified, not hand-typed */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-left text-sm font-medium text-gray-300">Payout Wallet</label>

                  {walletVerified && formData.walletAddress ? (
                    <div className="border border-green-500/30 bg-gradient-to-br from-green-500/[0.08] to-green-500/[0.02] rounded-xl px-4 py-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-400 text-xs font-semibold">Verified — you signed to confirm you control this wallet</span>
                        </div>
                        <p className="text-white text-sm font-mono">
                          {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        className="text-xs text-gray-400 hover:text-white underline underline-offset-2 shrink-0 ml-3"
                      >
                        Use different wallet
                      </button>
                    </div>
                  ) : isConnected && address ? (
                    <button
                      type="button"
                      onClick={verifyConnectedWallet}
                      disabled={walletVerifying}
                      className="border border-[#6c63ff] bg-[#6c63ff]/10 hover:bg-[#6c63ff]/15 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#c9c4ff] transition-colors disabled:opacity-60"
                    >
                      {walletVerifying
                        ? "Waiting for signature..."
                        : `Sign to verify ${address.slice(0, 6)}...${address.slice(-4)}`}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(108,99,255,0.5)] hover:shadow-[0_12px_28px_-6px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      >
                        Connect Wallet
                      </button>
                      <p className="text-gray-500 text-xs mt-1.5">
                        We don't accept typed-in addresses anymore — connect your wallet and sign a message to prove it's really yours. Works with MetaMask, Trust Wallet, and dozens of others via QR code, on desktop or mobile.
                      </p>
                    </>
                  )}

                  {walletError && (
                    <p className="text-red-400 text-xs mt-1">{walletError}</p>
                  )}
                </div>

                <label className="flex items-start gap-2.5 text-sm text-gray-400 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#6c63ff] shrink-0"
                  />
                  <span className="leading-relaxed">
                    I confirm that the information above is correct and belongs to me. I understand that wrong or incomplete details may delay, block, or lead to loss of funds.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] hover:opacity-90 transition-all text-white font-bold px-6 py-3.5 rounded-xl shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}