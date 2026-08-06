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
  // ...everything that was previously inside `export default function PaymentAccountPage()` goes here, unchanged

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
    
    // Check if it starts with 0x and has exactly 42 characters
    if (!address.startsWith('0x') || address.length !== 42) {
      setWalletError("Invalid wallet address. Please enter a valid  USDT (BEP20 - Binance Smart Chain) address.");
      return false;
    }
    
    // Check if it contains only valid hexadecimal characters after 0x
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
    // Try Redux first
    if (userData?.firstname && userData?.lastname) {
      return `${userData.firstname} ${userData.lastname}`;
    }
    if (userData?.firstname) {
      return userData.firstname;
    }
    
    // Fallback to localStorage
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

  // Auto-fill form when component mounts
  useEffect(() => {
    if (!formData.fullName) {
      const fullName = getUserFullName();
      if (fullName) {
        setFormData(prev => ({ ...prev, fullName }));
      }
    }
    
    // Check if user came from withdrawal flow
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('return') === 'withdrawal') {
      setReturnToWithdrawal(true);
    }
  }, [formData.fullName, getUserFullName]);

  const fetchAccount = useCallback(async () => {
    console.log("🔍 [PaymentAccount] Session:", session);
    console.log("🔍 [PaymentAccount] Session ID:", session?._id);
    console.log("🔍 [PaymentAccount] Session Token:", session?.token ? "Present" : "Missing");
    
    if (!session?._id || !session?.token) {
      console.log("❌ [PaymentAccount] Missing session data");
      setIsFetchingAccount(false);
      return;
    }
    setIsFetchingAccount(true);
    try {
      console.log("🔍 [PaymentAccount] Making request to:", `${URL}/addpayment/check-account/${session._id}`);
      const res = await fetch(`${URL}/addpayment/check-account/${session._id}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      console.log("🔍 [PaymentAccount] Response status:", res.status);
      const data: { exists: boolean; account?: PaymentAccount } = await res.json();
      console.log("🔍 [PaymentAccount] Response data:", data);
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

    console.log("🔍 [PaymentAccount] Delete - Session:", session);
    setLoading(true);
    try {
      const res = await fetch(`${URL}/addpayment/${session?._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });

      console.log("🔍 [PaymentAccount] Delete - Response status:", res.status);
      const data: { message: string } = await res.json();
      console.log("🔍 [PaymentAccount] Delete - Response data:", data);
      
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

    if (!formData.walletAddress || !walletVerified) {
      setWalletError("Please connect and verify your wallet before saving.");
      return;
    }

    const payload = {
      method: "crypto",
      ...formData,
    };

    console.log("🔍 [PaymentAccount] Submit - Session:", session);
    console.log("🔍 [PaymentAccount] Submit - Payload:", payload);

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

      console.log("🔍 [PaymentAccount] Submit - Response status:", res.status);
      const data: { message: string; data: PaymentAccount } = await res.json();
      console.log("🔍 [PaymentAccount] Submit - Response data:", data);

      if (!res.ok) {
        alert(data.message || "Submission failed");
        return;
      }

      alert("✅ Account saved successfully!");
      setFormData({});
      setAgree(false);
      await fetchAccount();
      
      // If user came from withdrawal flow, redirect back
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
    <div className="flex flex-col gap-1">
      <label className="text-left text-sm text-gray-300">{placeholder}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={formData[name as keyof FormData] || ''}
        className="border border-gray-600 rounded-md text-white bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      />
    </div>
  );

  // const renderSelect = (
  //   name: string,
  //   label: string,
  //   options: { value: string; label: string }[]
  // ) => (
  //   <div className="flex flex-col gap-1">
  //     <label className="text-left text-sm text-gray-300">{label}</label>
  //     <select
  //       name={name}
  //       required
  //       className="border border-gray-600 text-white bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
  //       onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
  //     >
  //       <option value="">Select {label}</option>
  //       {options.map((opt) => (
  //         <option key={opt.value} value={opt.value} className="text-black">
  //           {opt.label}
  //         </option>
  //       ))}
  //     </select>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-[#080b14] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold">Payment Account</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Account Form */}
          <div className="space-y-6">
            {/* Current Account Status */}
            <div className="bg-[#111624] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Current Account Status</h2>
              {isFetchingAccount ? (
                <p className="text-sm text-gray-400 animate-pulse">Checking for account...</p>
              ) : (
                <div className="space-y-4">
                  {account ? (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 font-medium">Account Connected</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {(() => {
                          const cryptoType = account.cryptoType;
                          if (!cryptoType) return 'Crypto';
                          
                          // Convert USDT_BEP20 to USDT (BEP20)
                          if (cryptoType.includes('_')) {
                            const [currency, network] = cryptoType.split('_');
                            return `${currency} (${network})`;
                          }
                          
                          return cryptoType;
                        })()} • {account.walletAddress.slice(0, 6)}...{account.walletAddress.slice(-4)}
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="mt-3 bg-red-500 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-red-600 disabled:bg-red-400"
                      >
                        {loading ? "Deleting..." : "Remove Account"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-400 font-medium">No Account Connected</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Add your cryptocurrency account details to enable withdrawals
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Form */}
            <div className="bg-[#111624] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Cryptocurrency Account Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderInput("fullName", "Full Name")}
                {renderInput("email", "Email Address", "email")}
                {renderInput("phone", "Phone Number (optional)", "tel", false)}
                <div className="flex flex-col gap-1">
                  <label className="text-left text-sm text-gray-300">Country of Residence</label>
                  <CountrySelect onSelectCountry={(country) => setFormData({ ...formData, country })} />
                </div>

                {/* Choose Stablecoin */}
<div className="flex flex-col gap-1">
  <label className="text-left text-sm text-gray-300">Choose Stablecoin</label>
  <div className="flex gap-3">
    {["USDT (BEP-20)", "USDC (BEP-20)"].map((coin) => (
      <div
        key={coin}
        onClick={() => setFormData({ ...formData, currency: coin })}
        className={`flex-1 border rounded-lg px-2 py-3 text-xs sm:text-sm sm:px-4 font-semibold cursor-pointer transition-all text-center ${
          formData.currency === coin
            ? "border-purple-500 bg-purple-500/10 text-purple-400"
            : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-400"
        }`}
      >
        {coin}
      </div>
    ))}
  </div>
</div>

{/* Choose Network */}
<div className="flex flex-col gap-1">
  <label className="text-left text-sm text-gray-300">Choose Network</label>
  <div
    className="border border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-sm font-semibold text-purple-400 cursor-default"
  >
    ✓ BNB Smart Chain
  </div>
  <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-3 py-2.5 mt-1">
    <span className="text-yellow-400 text-sm flex-shrink-0">⚠️</span>
    <p className="text-yellow-400 text-xs leading-relaxed">
      Withdrawals are only processed through <strong>BNB Smart Chain (BEP-20)</strong>. Sending to any other network will result in permanent loss of funds.
    </p>
  </div>
</div>

{/* Wallet Address — connected + signature-verified, not hand-typed */}
                <div className="flex flex-col gap-1">
                  <label className="text-left text-sm text-gray-300">Payout Wallet</label>

                  {walletVerified && formData.walletAddress ? (
                    <div className="border border-green-500/30 bg-green-900/20 rounded-lg px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-400 text-xs font-medium">Verified — you signed to confirm you control this wallet</span>
                        </div>
                        <p className="text-white text-sm font-mono">
                          {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        className="text-xs text-gray-400 hover:text-white underline shrink-0 ml-3"
                      >
                        Use different wallet
                      </button>
                    </div>
                  ) : isConnected && address ? (
                    <button
                      type="button"
                      onClick={verifyConnectedWallet}
                      disabled={walletVerifying}
                      className="border border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-purple-300 transition-colors disabled:opacity-60"
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
                        className="border border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-purple-300 transition-colors"
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

                  


                <label className="flex items-start gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 accent-purple-500"
                  />
                I confirm that the information above is correct and belongs to me. I understand that wrong or incomplete details may delay, block, or lead to loss of funds.
                </label>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-6 py-3 rounded-lg disabled:bg-gray-600"
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