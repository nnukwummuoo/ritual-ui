"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { URL } from "../../../api/config";
import CountrySelect from "../../../components/CountrySelect/CountrySelect";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

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
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({});
  const [agree, setAgree] = useState<boolean>(false);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFetchingAccount, setIsFetchingAccount] = useState<boolean>(true);
  const [returnToWithdrawal, setReturnToWithdrawal] = useState<boolean>(false);
  
  // Get user data from Redux and session from useAuth (same as history page)
  const userData = useSelector((state: RootState) => state.profile);
  const { session } = useAuth();

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

  const renderSelect = (
    name: string,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-left text-sm text-gray-300">{label}</label>
      <select
        name={name}
        required
        className="border border-gray-600 text-white bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
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
            <div className="bg-gray-800 rounded-lg p-6">
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
                        {account.cryptoType} • {account.walletAddress.slice(0, 6)}...{account.walletAddress.slice(-4)}
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
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Cryptocurrency Account Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderInput("fullName", "Full Name")}
                {renderInput("email", "Email Address", "email")}
                {renderInput("phone", "Phone Number (optional)", "tel", false)}
                <div className="flex flex-col gap-1">
                  <label className="text-left text-sm text-gray-300">Country of Residence</label>
                  <CountrySelect onSelectCountry={(country) => setFormData({ ...formData, country })} />
                </div>
                {renderSelect("cryptoType", "Cryptocurrency Type", [
                  { value: "BTC", label: "Bitcoin (BTC)" },
                  { value: "USDT_TRC20", label: "USDT (Tether, TRC20)" },
                  { value: "USDT_ERC20", label: "USDT (Bep20, ERC20)" },
                ])}
                {renderInput("walletAddress", "Wallet Address")}

                <label className="flex items-start gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 accent-purple-500"
                  />
                  I confirm that the information above is correct and belongs to me. I understand that wrong or incomplete details may delay or block my payments.
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

          {/* Right Column - Withdrawal Guidelines */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🌍 Guidelines for Withdrawing Crypto to Fiat</h2>
              
              {/* Filipina Models Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-blue-400 mb-3">🇵🇭 For Filipina Models</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">1. Recommended Wallets:</h4>
                    <p className="text-gray-300">Binance, Coins.ph, Trust Wallet.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">2. Steps to Withdraw to Bank:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                      <li>Receive BTC/USDT into your Binance or Coins.ph wallet.</li>
                      <li>Convert BTC/USDT → PHP.</li>
                      <li>Select Cash Out / Withdraw.</li>
                      <li>Choose Bank Transfer / GCash.</li>
                      <li>Enter account details and confirm. Funds arrive usually within minutes to hours.</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">3. Notes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                      <li>Coins.ph is easiest for beginners.</li>
                      <li>Make sure your account is KYC verified.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Nigerian Models Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-green-400 mb-3">🇳🇬 For Nigerian Models</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">1. Recommended Wallets:</h4>
                    <p className="text-gray-300">Binance, Luno, Trust Wallet.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">2. Steps to Withdraw to Bank:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                      <li>Receive BTC/USDT into your Binance or Luno wallet.</li>
                      <li>Convert BTC/USDT → NGN.</li>
                      <li>On Binance P2P: sell your crypto to a verified buyer.</li>
                      <li>Select Bank Transfer as payment method.</li>
                      <li>Confirm receipt of money in your bank account, then release crypto.</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">3. Notes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                      <li>Always trade with verified buyers (check ratings).</li>
                      <li>Avoid sharing sensitive banking info outside platform.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-medium text-red-400 mb-2">⚠ Important:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Always double-check wallet addresses.</li>
                  <li>Use only trusted exchanges.</li>
                  <li>Crypto transactions are irreversible.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
