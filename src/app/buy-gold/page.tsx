/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { toast } from "material-react-toastify";
import { golds } from "@/data/intresttypes";
import { createWeb3Payment, checkWeb3PaymentStatus, cancelWeb3Payment, verifyTransactionHash } from "@/api/web3payment";
import {RootState} from "@/store/store"
import { Copy, Check } from "lucide-react";

// Icons for tags
const tagIcons: Record<string, React.ReactNode> = {
  "Test Pack": <span role="img" aria-label="test">🧪</span>,
  "Casual Fan": null,
  "Hot Choice": <span role="img" aria-label="hot">🔥</span>,
  "Most Popular": <span role="img" aria-label="star">⭐</span>,
  "Fan Favorite": <span role="img" aria-label="heart">💖</span>,
  "Best Value": <span role="img" aria-label="key">🔑</span>,
};

const Topup: React.FC = () => {
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentMethod] = useState<'web3'>('web3');
  const [web3Payment, setWeb3Payment] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [verifyingTx, setVerifyingTx] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const userId = useSelector((state: RootState) => state.profile.userId);
  const login = useSelector((state: RootState) => state.register.logedin);

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
    if (!currencyValue) {
      toast.error("Please select a gold pack", { autoClose: 2000 });
      return;
    }
    if (web3Payment) {
      toast.error("You already have an active payment. Please complete or cancel it first.", { autoClose: 3000 });
      return;
    }
    try {
      setLoading(true);
      const selectedGold = golds.find((gold) => Number(gold.value) === currencyValue);
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
        order_description: `Gold Pack Purchase: ${currencyValue} Gold`
      });
      
      setWeb3Payment(res);
      
      // Initialize countdown timer
      const now = new Date().getTime();
      const expiryTime = new Date(res.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);
      
      toast.success("Web3 payment created! Send USDT and paste your transaction hash.", { autoClose: 5000 });
    } catch (error) {
      console.error("Payment error details:", error);
      toast.error("An error occurred during payment", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!web3Payment?.orderId) {
      console.log("❌ [FRONTEND] No order ID available for status check");
      return;
    }
    
    console.log(`🔍 [FRONTEND] Starting status check for order ID: ${web3Payment.orderId}`);
    console.log(`🔍 [FRONTEND] Current payment data:`, web3Payment);
    
    try {
      setCheckingStatus(true);
      console.log(`📡 [FRONTEND] Calling API: checkWeb3PaymentStatus(${web3Payment.orderId})`);
      
      const status = await checkWeb3PaymentStatus(web3Payment.orderId);
      
      console.log(`📥 [FRONTEND] API Response received:`, status);
      console.log(`📊 [FRONTEND] Response details:`);
      console.log(`📊 [FRONTEND] - Order ID: ${status.orderId}`);
      console.log(`📊 [FRONTEND] - Status: ${status.status}`);
      console.log(`📊 [FRONTEND] - Amount: ${status.amount}`);
      console.log(`📊 [FRONTEND] - Created: ${status.createdAt}`);
      console.log(`📊 [FRONTEND] - Updated: ${status.updatedAt}`);
      console.log(`📊 [FRONTEND] - Has TX Data: ${status.txData ? 'Yes' : 'No'}`);
      
      if (status.txData) {
        console.log(`📊 [FRONTEND] - TX Data Details:`);
        console.log(`📊 [FRONTEND]   - From Address: ${status.txData.fromAddress || 'N/A'}`);
        console.log(`📊 [FRONTEND]   - To Address: ${status.txData.toAddress || 'N/A'}`);
        console.log(`📊 [FRONTEND]   - Confirmed At: ${status.txData.confirmedAt || 'N/A'}`);
        console.log(`📊 [FRONTEND]   - TX Hash: ${status.txData.txHash || 'N/A'}`);
        console.log(`📊 [FRONTEND]   - Network: ${status.txData.network || 'N/A'}`);
      }
      
      if (status.status === 'confirmed') {
        console.log(`✅ [FRONTEND] Payment confirmed! Processing success...`);
        toast.success("Payment confirmed! Your gold has been added to your account.", { autoClose: 5000 });
        setWeb3Payment(null);
        setCurrencyValue(0);
        setTxHash("");
        setTimeLeft(0);
        localStorage.removeItem('web3_payment');
      } else {
        console.log(`ℹ️ [FRONTEND] Payment status: ${status.status} - showing info to user`);
        toast.info(`Payment status: ${status.status}`, { autoClose: 3000 });
      }
    } catch (error) {
      console.error("❌ [FRONTEND] Status check error:", error);
      console.error("❌ [FRONTEND] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      });
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
      setCurrencyValue(0);
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
        setCurrencyValue(0);
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
    <tr key={gold.value} className={`border-b border-[#323544] last:border-b-0 ${gold.tag === 'Test Pack' ? 'bg-yellow-900/20' : ''}`}>
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
        {gold.tag === 'Test Pack' ? (
          <span className="text-yellow-400 font-bold">{gold.value}</span>
        ) : (
          gold.value
        )}
      </td>
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
        {gold.tag === 'Test Pack' ? (
          <span className="text-yellow-400 font-bold">{gold.amount}</span>
        ) : (
          gold.amount
        )}
      </td>
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
        {gold.tag === 'Test Pack' ? (
          <span className="text-yellow-400 font-bold">{gold.bonus}</span>
        ) : (
          gold.bonus || "-"
        )}
      </td>
      <td className="py-2 px-2 text-center text-sm sm:text-base whitespace-nowrap">
        {gold.tag ? (
          <span className={`flex items-center gap-1 justify-center whitespace-nowrap ${
            gold.tag === 'Test Pack' ? 'text-yellow-400 font-bold' : ''
          }`}>
            {tagIcons[gold.tag] || null}
            {gold.tag}
          </span>
        ) : "-"}
      </td>
    </tr>
  ));

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        {/* Gold Shop Avatar */}
        {/* <div>
           <Image
            src="icons/m-logo.png"
            alt="Gold Shop Logo"
            width={60}
            height={60}
            className="object-contain sm:w-[77px] sm:h-[77px]"
          /> 
        </div> */}
        {/* Title */}
        <h1 className="mt-2 sm:mt-4 text-white text-2xl sm:text-3xl font-bold text-center">Gold Shop</h1>
        {/* Subtitle */}
        <div className="flex items-center mt-2 gap-2">
          <span
            className="rounded-full flex items-center justify-center"
            style={{
              background: "#FFD682",
              width: 24,
              height: 24,
            }}
          >
            <span className="text-[#1A1C2C] text-base sm:text-lg font-bold">$</span>
          </span>
          <span className="text-[#b6b7c7] text-sm sm:text-base font-medium whitespace-nowrap">
            Buy Gold with USDT <span className="text-[#636583] font-normal">(BEP20)</span>
          </span>
        </div>

        {/* Table Card */}
        <div
          className="w-full bg-[#191c2f] rounded-2xl shadow-md p-0 mb-6 mt-4 sm:mt-6 overflow-x-auto"
          style={{ border: "1px solid #23243c" }}
        >
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-[#323544]">
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Pack</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Price</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Bonus</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center whitespace-nowrap">Tag</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {/* Payment Form */}
        <div className="flex flex-col items-center gap-4 w-full">

          <select
            required
            className="block bg-[#23243c] text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full appearance-none border border-[#23243c] focus:outline-none focus:ring-2 focus:ring-[#FFD682] font-medium text-sm sm:text-base"
            value={currencyValue || ""}
            onChange={(e) => setCurrencyValue(Number(e.target.value))}
          >
            <option value="" disabled>
              Choose Gold Pack
            </option>
            {golds.map((value) => (
              <option key={value.value} value={value.value}>
                {value.tag === 'Test Pack' ? '🧪 ' : ''}{value.value} Gold / ${value.amount.replace(/[^0-9.]/g, "")} {value.bonus ? `/ +${value.bonus} Bonus` : ""}
              </option>
            ))}
          </select>

          {!web3Payment ? (
            <button
              className={`w-full h-10 sm:h-12 rounded-lg font-bold text-base sm:text-lg ${
                loading
                  ? "bg-[#FFD682]/60 text-[#b6b7c7] cursor-not-allowed"
                  : "bg-[#FFD682] text-[#15182a] hover:bg-[#ffe7ac] active:bg-[#ffd682]"
              } shadow transition-all`}
              onClick={pay}
              disabled={loading}
            >
              {loading ? "Processing..." : "Create Payment"}
            </button>
          ) : (
            <div className="w-full bg-[#23243c] rounded-lg p-6 border border-[#323544]">
              {/* 30-Minute Payment Window Notice */}
              <div className="w-full bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-800/50 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-yellow-900 text-lg font-bold">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-yellow-400 font-bold text-lg">30-Minute Payment Window</h3>
                    <p className="text-yellow-200 text-sm">Once it closes, it&apos;s gone for good.</p>
                    <p className="text-yellow-100 text-sm font-medium">Complete your payment before time runs out.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h3 className="text-white font-bold text-lg">Web3 Payment</h3>
                </div>
                {timeLeft > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-mono text-sm">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Payment Summary */}
              <div className="bg-[#1a1c2f] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <div className="text-white font-semibold text-lg">{web3Payment.amount} USDT</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <div className="text-white font-semibold">{web3Payment.network}</div>
                  </div>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Send USDT to this address:
                </label>
                <div className="flex items-center gap-2 p-3 bg-[#1a1c2f] rounded-lg border border-[#323544]">
                  <div className="flex-1 font-mono text-xs text-white break-all">
                    {web3Payment.walletAddress}
                  </div>
                  <button
                    onClick={copyWalletAddress}
                    className="flex items-center gap-1 px-3 py-2 bg-[#FFD682] text-[#15182a] rounded-md text-xs font-medium hover:bg-[#ffe7ac] transition-all"
                  >
                    {copiedWallet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedWallet ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Transaction Hash Input Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paste your transaction hash here:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 p-3 bg-[#1a1c2f] text-white rounded-lg border border-[#323544] focus:outline-none focus:ring-2 focus:ring-[#FFD682] font-mono text-xs"
                  />
                  <button
                    onClick={verifyTransaction}
                    disabled={verifyingTx || !txHash.trim() || timeLeft === 0}
                    className="px-4 py-3 bg-[#FFD682] text-[#15182a] rounded-lg font-medium hover:bg-[#ffe7ac] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {verifyingTx ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#15182a] border-t-transparent rounded-full animate-spin"></div>
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
              <div className="mb-4">
                <div className="text-xs text-gray-400 leading-relaxed">
                  {web3Payment.instructions}
                </div>
                <div className="text-xs text-yellow-400 mt-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                  💡 <strong>How to get your transaction hash:</strong> After sending USDT, copy the transaction hash from your wallet or blockchain explorer and paste it above.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={cancelTransaction}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topup;
