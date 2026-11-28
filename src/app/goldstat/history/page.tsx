/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { get_my_history, get_transaction_history, get_monthly_history } from "@/store/goldstatSlice";
import { getprofile } from "@/store/profile";
import { getViews } from "@/store/creatorSlice";
import { RootState } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/PacmanLoader";
import Image from "next/image";
import { HelpCircle, Inbox, Wallet, Eye, Users } from "lucide-react";
import { URL } from "@/api/config";

interface Transaction {
  id: string;
  created_at: string;
  amount: string;
  description?: string;
  status?: "completed" | "pending" | "failed";
}

interface Analytics {
  coin: number;
  usd: number;
  request: number;
  earning: number;
  gift: number;
  like: number;
  followers: number;
}

const WithdrawRequestCard = ({ usd, onWithdrawClick }: { usd: number; onWithdrawClick: () => void }) => {
  const canWithdraw = usd >= 5;
  const progress = Math.max(0, Math.min(100, (usd / 5) * 100));
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0d1220] p-5 mb-4 w-full text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Withdrawable money</p>
          {canWithdraw ? (
            <p className="mt-1 text-3xl font-extrabold text-white">${usd.toFixed(2)}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">Available once balance ≥ $5</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${
            canWithdraw
              ? "border-[#22c55e]/25 bg-[#0f2a22] text-[#a7e3c4]"
              : "border-white/10 bg-[#161b2e] text-slate-400"
          }`}
        >
          {canWithdraw ? "Ready" : "Locked"}
        </span>
      </div>

      {!canWithdraw && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#161b2e]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">${usd.toFixed(2)} of $5.00 minimum</p>
        </div>
      )}

      <button
        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all ${
          canWithdraw
            ? "bg-gradient-to-r from-purple-600 to-pink-500 [@media(hover:hover)]:hover:from-purple-500 [@media(hover:hover)]:hover:to-pink-400 cursor-pointer"
            : "bg-[#161b2e] text-slate-500 cursor-not-allowed"
        }`}
        disabled={!canWithdraw}
        onClick={canWithdraw ? onWithdrawClick : undefined}
      >
        {canWithdraw ? "Withdraw" : "$5 required for available balance"}
      </button>
    </div>
  );
};

const HistoryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { session } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaymentAccount, setHasPaymentAccount] = useState(false);
  const [checkingPaymentAccount, setCheckingPaymentAccount] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentAccountDetails, setPaymentAccountDetails] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Initialize with current month/year
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString(); // 1-12
  const currentYear = now.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);

  // Toast notification function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Check if user has payment account
  const checkPaymentAccount = async () => {
    if (!session?._id || !session?.token) return false;

    setCheckingPaymentAccount(true);
    try {
      const response = await fetch(`${URL}/addpayment/check-account/${session?._id}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      const data = await response.json();
      const hasAccount = response.ok && data.exists;
      setHasPaymentAccount(hasAccount);
      return hasAccount;
    } catch (error) {
      console.error('Error checking payment account:', error);
      setHasPaymentAccount(false);
      return false;
    } finally {
      setCheckingPaymentAccount(false);
    }
  };

  // Withdrawal validation and handlers
  const handleWithdrawClick = async () => {
    setWithdrawAmount('');
    setWithdrawError('');

    // Check if user has payment account first
    const hasAccount = await checkPaymentAccount();

    if (hasAccount) {
      // Get payment account details for confirmation
      try {
        const response = await fetch(`${URL}/addpayment/check-account/${session?._id}`, {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        });
        const accountData = await response.json();

        if (accountData.exists) {
          setPaymentAccountDetails(accountData.account);
          setShowConfirmModal(true);
        } else {
          setShowPaymentModal(true);
        }
      } catch (error) {
        console.error('Error fetching payment account:', error);
        setShowPaymentModal(true);
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setWithdrawError('');
  };

  const validateWithdrawAmount = (amount: string, maxAmount: number) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }

    if (numAmount < 5) {
      return 'Minimum withdrawal amount is $5';
    }

    if (numAmount > maxAmount) {
      return `Insufficient funds`;
    }

    return '';
  };

  const handleConfirmWithdraw = async () => {
    const maxAmount = totalCurrentBalanceUSD;
    const error = validateWithdrawAmount(withdrawAmount, maxAmount);

    if (error) {
      setWithdrawError(error);
      return;
    }

    if (!paymentAccountDetails) {
      alert('Payment account details not found. Please try again.');
      return;
    }

    try {
      // Submit withdrawal request
      const withdrawResponse = await fetch(`${URL}/withdraw-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          credentials: {
            method: paymentAccountDetails.method,
            fullName: paymentAccountDetails.fullName,
            email: paymentAccountDetails.email,
            country: paymentAccountDetails.country,
            cryptoType: paymentAccountDetails.cryptoType,
            walletAddress: paymentAccountDetails.walletAddress,
            currency: paymentAccountDetails.currency || null,
          },
        })
      });

      const result = await withdrawResponse.json();

      if (withdrawResponse.ok) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        setWithdrawAmount('');
        setWithdrawError('');
        // Refresh pending withdrawals by reloading the page data
        window.location.reload();
      } else {
        showToastNotification(result.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      showToastNotification('Error submitting withdrawal request');
    }
  };

  // Delete payment account
  const handleDeleteAccount = async () => {
    if (!session?._id || !session?.token) return;

    try {
      const response = await fetch(`${URL}/addpayment/${session._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.ok) {
        alert('Payment account deleted successfully!');
        setShowDeleteConfirm(false);
        setHasPaymentAccount(false);
        setPaymentAccountDetails(null);
      } else {
        const result = await response.json();
        alert(result.message || 'Failed to delete payment account');
      }
    } catch (error) {
      console.error('Error deleting payment account:', error);
      alert('Error deleting payment account');
    }
  };

  const { history, transactions, loading, earnings: monthlyEarnings } = useSelector(
    (state: RootState) => state.goldstat
  ) as { history: any; transactions: Transaction[]; loading: boolean; error: string | null; earnings: any[] };

  const { earnings, creator_portfolio_id, creator_verified } = useSelector(
    (state: RootState) => state.profile
  );

  // Check if user is a creator - only creators have earnings
  const isCreator = creator_verified || !!creator_portfolio_id;

  // Calculate total current balance (not month-specific) - only for creators
  // Calculate total current balance (not month-specific) - available for all users
  const totalCurrentBalance = typeof earnings === 'number' ? earnings : parseFloat(earnings || '0') || 0;
  const totalCurrentBalanceUSD = totalCurrentBalance * 0.04;

  const [views, setViews] = useState(0);
   const [nonUserViews, setNonUserViews] = useState(0);
   const [monthlyViews, setMonthlyViews] = useState<Record<string, { users: number; nonUsers: number }>>({});
  const [showViewsModal, setShowViewsModal] = useState(false);

  // Get analytics from transactions based on selected month
  const analytics: Analytics = useMemo(() => {


    const targetMonth = parseInt(selectedMonth) - 1; // Convert to 0-11
    const targetYear = parseInt(selectedYear);
    const now = new Date();
    const isCurrentMonth = parseInt(selectedMonth) === (now.getMonth() + 1) && parseInt(selectedYear) === now.getFullYear();

    console.log('=== ANALYTICS DEBUG ===');
    console.log('Selected Month:', selectedMonth, 'Year:', selectedYear);
    console.log('Target Month (0-indexed):', targetMonth, 'Year:', targetYear);
    console.log('Is Current Month:', isCurrentMonth);
    console.log('Total Transactions:', transactions?.length || 0);

    // Helper function to check if transaction is an earnings transaction
    const isEarningsTransaction = (description: string) => {
      if (!description) return false;
      const descLower = description.toLowerCase();

      // Include earnings-related transactions
      const isEarnings =
        description.includes("payment received") ||
        description.includes("Referral reward transfer to earnings") ||
        description.includes("Fan call - payment received") ||
        description.includes("Fan meet completed - payment received") ||
        description.includes("exclusive post sale") ||
        description.includes("exclusive content sale") ||
        description.includes("Earning from PPV message sale") ||
        (descLower.includes("received") && (descLower.includes("coins") || descLower.includes("golds")));

      // Exclude spending/payment transactions
      const isSpending =
        description.includes("payment for") ||
        description.includes("payment transferred") ||
        description.includes("Purchased") ||
        descLower.includes("withdrawal") ||
        descLower.includes("withdraw");

      return isEarnings && !isSpending;
    };

    // Filter transactions for the selected month/year
    const monthTransactions = (transactions || []).filter((t: any) => {
      try {
        const transDate = new Date(t.created_at);
        const transMonth = transDate.getMonth();
        const transYear = transDate.getFullYear();
        const matches = transMonth === targetMonth && transYear === targetYear;

        if (matches) {
          console.log('Matched Transaction:', {
            date: t.created_at,
            amount: t.amount,
            description: t.description
          });
        }

        return matches;
      } catch (error) {
        console.error('Error parsing date:', t.created_at, error);
        return false;
      }
    });

    console.log('Filtered Month Transactions:', monthTransactions.length);

    // Calculate analytics from filtered transactions
    let requestCount = 0;
    let giftCount = 0;
    let likeCount = 0;
    let referralearn = 0;
    let totalEarning = 0;

    monthTransactions.forEach((t: any) => {
      const description = t.description || '';
      const amount = parseFloat(t.amount || '0');

      console.log('Processing:', {
        description,
        amount,
        isEarning: isEarningsTransaction(description)
      });

      // Only count positive amounts (earnings) from earning transactions
      if (amount > 0 && isEarningsTransaction(description)) {
        totalEarning += amount;
        console.log('Added to earnings:', amount, 'New Total:', totalEarning);

        const descLower = description.toLowerCase();
        if (descLower.includes('fan meet') || descLower.includes('fan call - payment received')) {
          requestCount++;
        }
        if (descLower.includes('gift') || descLower.includes('tip')) {
          giftCount++;
        }
        if (descLower.includes('like')) {
          likeCount++;
        }
        if (descLower.includes('referral')) {
          referralearn++;
        }
      }
    });

    console.log('Final Calculated Earnings:', totalEarning);
    console.log('Request Count:', requestCount);

    // For current month with transaction data, always use calculated values from transactions
    // Only use history.history for followers count if available
    if (isCurrentMonth && totalEarning > 0) {
      let followersCount = 0;

      if (history?.history) {
        const parseValue = (val: any) => {
          if (val === "---" || val === null || val === undefined) return 0;
          const parsed = typeof val === 'string' ? parseFloat(val) : val;
          return isNaN(parsed) ? 0 : parsed;
        };
        followersCount = parseValue(history.history.followers);

        console.log('Using calculated earnings with history followers:', followersCount);
      }

      const result = {
        coin: totalEarning,
        usd: totalEarning * 0.04,
        request: requestCount,
        earning: totalEarning,
        gift: giftCount,
        like: likeCount,
        followers: followersCount,
      };
      console.log('Returning Calculated Result (Current Month):', result);
      console.log('=== END DEBUG ===\n');
      return result;
    }

    // For past months or when no transaction data, return calculated values
    const result = {
      coin: totalEarning,
      usd: totalEarning * 0.04,
      request: requestCount,
      earning: totalEarning,
      gift: giftCount,
      like: likeCount,
      followers: 0,
    };
    console.log('Returning Calculated Result:', result);
    console.log('=== END DEBUG ===\n');
    return result;
  }, [history, selectedMonth, selectedYear, transactions, isCreator]);

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      if (!session?._id || !session?.token) return;

      try {
        const response = await fetch(`${URL}/withdraw-request/all/${session._id}`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Filter only pending requests
          const pending = data.requests?.filter((req: any) => req.status === 'pending') || [];
          setPendingWithdrawals(pending);
        }
      } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
      }
    };

    const fetchMonthlyHistory = async () => {
      if (!session?._id || !session?.token) return;

      try {
        const result = await dispatch(get_monthly_history({ userId: session._id, token: session.token }) as any);
        if (result.payload && result.payload.Month) {
          setMonthlyHistory(result.payload.Month);
        }
      } catch (error) {
        console.error('Error fetching monthly history:', error);
      }
      
    };

     const fetchPaymentAccount = async () => {
    if (!session?._id || !session?.token) return;
    try {
    const response = await fetch(`${URL}/addpayment/check-account/${session._id}`, {
  headers: { Authorization: `Bearer ${session?.token}` }
});
      const data = await response.json();
      if (data.exists) {
        setHasPaymentAccount(true);
        setPaymentAccountDetails(data.account);
      }
    } catch (error) {
      console.error('Error fetching payment account:', error);
    }
  };

    

    if (session?._id && session?.token) {
      dispatch(get_my_history({ userId: session._id, token: session.token }) as any);
      dispatch(get_transaction_history({ userId: session._id, token: session.token }) as any);
      dispatch(getprofile({ userid: session._id, token: session.token }) as any);
      fetchPendingWithdrawals();
      fetchMonthlyHistory();
      fetchPaymentAccount(); 
    }
  }, [dispatch, session]);

  // Separate useEffect for views - same as creator page
  useEffect(() => {
    const fetchViews = async () => {
      if (!session?._id || !session?.token) {
        return;
      }

      // Get creator ID from profile data (same as creator page)
      const portfolioId = creator_portfolio_id || session._id; // use profile creator_portfolio_id or fallback to session ID

      const data = {
        creator_portfolio_id: portfolioId,
        userId: session._id,
        token: session.token,
      };
      const response = await dispatch(getViews(data) as any);

      try {
        const payload = response?.payload;

       if (!payload) {
          setViews(0);
          setNonUserViews(0);
          setMonthlyViews({});
          return;
        }

        setViews(payload?.views ?? 0);
        setNonUserViews(payload?.nonUserViews ?? 0);
        setMonthlyViews(payload?.monthly ?? {});

      } catch {
        setViews(0);
        setNonUserViews(0);
        setMonthlyViews({});
      }
    };

    fetchViews();
  }, [session, dispatch, creator_portfolio_id]);

  const monthViewKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthViewCount =
    (monthlyViews[monthViewKey]?.users || 0) + (monthlyViews[monthViewKey]?.nonUsers || 0);

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:ml-36 min-h-screen py-8 px-6 text-white">
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
      {loading && (
        <div className="flex flex-col items-center mt-16">
          <PacmanLoader color="#fff" size={35} />
          <p className="text-sm mt-2">Loading...</p>
        </div>
      )}

      {/* Page heading */}
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold text-white">My Earnings</h1>
        <p className="mt-1 text-sm text-slate-400">Your balance, payouts and monthly performance.</p>
      </div>

      {/* Gold balance - always total current balance, not month-specific */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#f5c451]/[0.16] via-[#0d1220] to-[#0d1220] p-6 mb-4">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#f5c451]/15 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <button
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#161b2e] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540] focus:outline-none cursor-pointer"
            onClick={() => router.push("/goldstat/earnings")}
            type="button"
          >
            Gold &gt;
          </button>
          <HelpCircle
            className="cursor-pointer text-slate-400 [@media(hover:hover)]:hover:text-white transition-colors"
            width={20}
            height={20}
            strokeWidth={2.25}
            onClick={() => setShowPopup(true)}
          />
        </div>

        <div className="relative mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/goldstat/earnings")}
            className="focus:outline-none [@media(hover:hover)]:hover:scale-105 transition-transform"
          >
            <span
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: 44, height: 44, boxShadow: "0 4px 12px -4px rgba(245,196,81,0.5)" }}
            >
              <svg viewBox="0 0 24 24" width="44" height="44" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 8px rgba(245,196,81,0.4))" }}>
                <circle cx="12" cy="12" r="10" fill="#F5C451" />
                <circle cx="12" cy="12" r="10" fill="none" stroke="#B8860B" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="7" fill="none" stroke="#B8860B" strokeWidth="0.8" opacity="0.45" />
                <path d="M12 7.3l1.1 2.6 2.7.3-2 1.8.5 2.7-2.3-1.4-2.3 1.4.5-2.7-2-1.8 2.7-.3L12 7.3z" fill="#B8860B" opacity="0.55" />
              </svg>
            </span>
          </button>
          <p className="text-4xl sm:text-5xl font-extrabold text-white">{totalCurrentBalance}</p>
        </div>
        <p className="relative mt-2 text-sm text-slate-300">≈ ${totalCurrentBalanceUSD.toFixed(2)} <span className="text-slate-500">· 1 Gold = $0.04</span></p>
      </div>

      {/* Withdraw Request - always total current balance, not month-specific */}
      <WithdrawRequestCard usd={totalCurrentBalanceUSD} onWithdrawClick={handleWithdrawClick} />

      {/* Account Analytics - always visible, for the selected month */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0d1220] p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-base font-bold text-white">Account analytics</p>
          <div className="flex items-center gap-2">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#161b2e] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#6c63ff]/60"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#161b2e] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#6c63ff]/60"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.06] bg-[#111830] p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d2547] text-[#a89cff]"><Inbox size={16} /></span>
            <p className="mt-3 text-xs font-medium text-slate-400">Fan Request</p>
            <p className="mt-0.5 text-2xl font-extrabold text-white">{analytics.request}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#111830] p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2a2310] text-[#f5c451]"><Wallet size={16} /></span>
            <p className="mt-3 text-xs font-medium text-slate-400">Earnings</p>
            <p className="mt-0.5 text-2xl font-extrabold text-white">$ {(analytics.earning * 0.04).toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#111830] p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f2a22] text-[#2dd4bf]"><Eye size={16} /></span>
            <p className="mt-3 text-xs font-medium text-slate-400">Portfolio views</p>
            <p className="mt-0.5 text-2xl font-extrabold text-white">{monthViewCount}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#111830] p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2c1424] text-[#f472b6]"><Users size={16} /></span>
            <p className="mt-3 text-xs font-medium text-slate-400">New Fans</p>
            <p className="mt-0.5 text-2xl font-extrabold text-white">{analytics.followers}</p>
          </div>
        </div>

        {!(analytics.request > 0 || analytics.gift > 0 || analytics.like > 0 || analytics.followers > 0 || analytics.earning > 0 || monthViewCount > 0) && (
          <p className="mt-3 text-center text-xs text-slate-500">
            No activity for {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        )}

        <button
          onClick={() => setShowViewsModal(true)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-[#161b2e] py-2.5 text-xs font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540] [@media(hover:hover)]:hover:border-white/20"
        >
          Portfolio view breakdown
        </button>
      </div>

      {/* Pending Withdrawals Section */}
      {pendingWithdrawals.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0d1220] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-bold text-white">Pending Withdrawals</p>
            <span className="rounded-full border border-yellow-500/25 bg-[#2a2310] px-3 py-1 text-[11px] font-semibold text-yellow-400">
              {pendingWithdrawals.length} request{pendingWithdrawals.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2.5">
            {pendingWithdrawals.map((request, index) => (
              <div key={request._id || index} className="rounded-2xl border border-white/[0.06] bg-[#111830] p-4">
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-white">${request.amount}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(() => {
                        try {
                          // Check both createdAt and requestedAt fields
                          const dateField = request.createdAt || request.requestedAt;
                          if (!dateField) return 'Date not available';
                          const date = new Date(dateField);
                          return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
                        } catch (error) {
                          return 'Date not available';
                        }
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full border border-yellow-500/25 bg-[#2a2310] px-2.5 py-1 text-[11px] font-semibold text-yellow-400">
                      Pending
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {request.credentials?.currency || (() => {
                        const cryptoType = request.credentials?.cryptoType;
                        if (!cryptoType) return 'Crypto';
                        if (cryptoType.includes('_')) {
                          const [currency, network] = cryptoType.split('_');
                          return `${currency} (${network})`;
                        }
                        return cryptoType;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Payment Account Modal - Redirect to separate page */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1220] p-6 text-white">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#6c63ff]/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-white">Add Payment Account</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-2xl leading-none text-slate-400 transition-colors [@media(hover:hover)]:hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
              You need to add your payment account details before you can withdraw funds.
            </p>
            <div className="relative mt-5 space-y-2.5">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  router.push('/goldstat/payment-account?return=withdrawal');
                }}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-bold text-white transition-all [@media(hover:hover)]:hover:from-purple-500 [@media(hover:hover)]:hover:to-pink-400"
              >
                Go to Payment Account Page
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full rounded-xl border border-white/10 bg-[#161b2e] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0d1220] p-6 text-white">
            <h2 className="text-xl font-extrabold text-white">Confirm Withdrawal</h2>

            {/* Payment Account Details */}
            {paymentAccountDetails && (
              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#111830] p-4 text-left">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Payment Details</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs font-semibold text-red-400 transition-colors [@media(hover:hover)]:hover:text-red-300"
                  >
                    Delete Account
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Name</span><span className="text-right text-slate-200">{paymentAccountDetails.fullName}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Email</span><span className="text-right text-slate-200 break-all">{paymentAccountDetails.email}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Country</span><span className="text-right text-slate-200">{paymentAccountDetails.country}</span></div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Stablecoin</span>
                    <span className="text-right text-slate-200">
                      {paymentAccountDetails.currency || (() => {
                        const cryptoType = paymentAccountDetails.cryptoType;
                        if (!cryptoType) return 'Crypto';
                        if (cryptoType.includes('_')) {
                          const [currency, network] = cryptoType.split('_');
                          return `${currency} (${network})`;
                        }
                        return cryptoType;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">Wallet</span><span className="text-right text-slate-200 break-all">{paymentAccountDetails.walletAddress}</span></div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#111830] px-4 py-3 text-sm">
              <span className="text-slate-400">Available</span>
              <span className="font-extrabold text-white">${totalCurrentBalanceUSD.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Minimum withdrawal: $5</p>

            <div className="mt-4">
              <input
                type="number"
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-white/10 bg-[#161b2e] px-4 py-3 text-white placeholder:text-slate-500 focus:border-[#6c63ff]/60 focus:outline-none"
                min="5"
                max={totalCurrentBalanceUSD}
                step="0.01"
              />
              {withdrawError && (
                <p className="mt-2 text-sm text-red-400">{withdrawError}</p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-bold text-white transition-all [@media(hover:hover)]:hover:from-purple-500 [@media(hover:hover)]:hover:to-pink-400"
                onClick={handleConfirmWithdraw}
              >
                Confirm Withdraw
              </button>
              <button
                className="flex-1 rounded-xl border border-white/10 bg-[#161b2e] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540]"
                onClick={() => {
                  setShowConfirmModal(false);
                  setWithdrawAmount('');
                  setWithdrawError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#0d1220] p-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2a1216] text-2xl">🗑️</div>
            <h2 className="text-xl font-extrabold text-white">Delete Payment Account</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Are you sure you want to delete your payment account? You&apos;ll need to add it again to make withdrawals.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors [@media(hover:hover)]:hover:bg-red-500"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
              <button
                className="flex-1 rounded-xl border border-white/10 bg-[#161b2e] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540]"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instruction popup (question-mark icon) */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowPopup(false)}>
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#f5c451]/[0.16] via-[#0d1220] to-[#0d1220] p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#f5c451]/15 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 56, height: 56, boxShadow: "0 4px 12px -4px rgba(245,196,81,0.5)" }}
              >
                <svg viewBox="0 0 24 24" width="56" height="56" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 8px rgba(245,196,81,0.4))" }}>
                  <circle cx="12" cy="12" r="10" fill="#F5C451" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#B8860B" strokeWidth="1.2" />
                  <circle cx="12" cy="12" r="7" fill="none" stroke="#B8860B" strokeWidth="0.8" opacity="0.45" />
                  <path d="M12 7.3l1.1 2.6 2.7.3-2 1.8.5 2.7-2.3-1.4-2.3 1.4.5-2.7-2-1.8 2.7-.3L12 7.3z" fill="#B8860B" opacity="0.55" />
                </svg>
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-white">How payouts work</h2>

              <div className="mt-4 w-full rounded-2xl border border-white/[0.08] bg-[#111830] px-4 py-3">
                <p className="text-lg font-extrabold text-[#f5c451]">1 Gold = $0.04</p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                You can request a withdrawal at any time. Payouts are sent instantly to your USDT or USDC (BEP20) wallet.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                In rare cases of blockchain network delays, it may take up to 24 hours.
              </p>

              <button
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-bold text-white transition-all [@media(hover:hover)]:hover:from-purple-500 [@media(hover:hover)]:hover:to-pink-400"
                onClick={() => setShowPopup(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#0d1220] p-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0f2a22]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">Withdrawal Submitted!</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Withdrawal submitted successfully. Processing typically completes within 24 hours.
            </p>
            <button
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-bold text-white transition-all [@media(hover:hover)]:hover:from-green-500 [@media(hover:hover)]:hover:to-green-400"
              onClick={() => setShowSuccessModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] animate-slide-in">
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-[#2a1216] px-4 py-3 text-sm text-red-200 shadow-lg">
            <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="shrink-0 text-red-300 transition-colors [@media(hover:hover)]:hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}


      {showViewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setShowViewsModal(false)}>
          <div
            className="bg-[#111624] border border-white/10 rounded-2xl p-5 w-full max-w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-[17px] font-extrabold">Views breakdown</h2>
              <button onClick={() => setShowViewsModal(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="bg-[#0e1220] border border-white/10 rounded-xl px-4 py-3.5 mb-3.5 text-center">
              <div className="text-white text-[26px] font-extrabold">{views + nonUserViews}</div>
              <div className="text-slate-400 text-xs font-semibold mt-0.5">Total views</div>
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
              <div className="flex items-center justify-between bg-[#0e1220] border border-white/10 rounded-xl px-3.5 py-3">
                <div>
                  <div className="text-white text-[13.5px] font-bold">User views</div>
                  <div className="text-teal-400 text-[11.5px] font-semibold mt-0.5">Counts toward your ranking</div>
                </div>
                <div className="text-white text-xl font-extrabold">{views}</div>
              </div>

              <div className="flex items-center justify-between bg-[#0e1220] border border-white/10 rounded-xl px-3.5 py-3">
                <div>
                  <div className="text-white text-[13.5px] font-bold">Non-user views</div>
                  <div className="text-slate-500 text-[11.5px] font-semibold mt-0.5">Not counted toward ranking</div>
                </div>
                <div className="text-white text-xl font-extrabold">{nonUserViews}</div>
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              Only visits from logged-in fans count toward your ranking. This keeps rankings fair — visits from people who aren&apos;t signed in still show up here, they just don&apos;t move your ranking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;