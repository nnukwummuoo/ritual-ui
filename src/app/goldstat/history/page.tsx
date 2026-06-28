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

const WithdrawRequestCard = ({ usd, onWithdrawClick }: { usd: number; onWithdrawClick: () => void }) => (
  <div className="bg-[#111624] text-white p-4 rounded-lg mb-3 w-full">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm">Withdrawable Money</p>
        {usd >= 5 ? <p className="text-xl font-bold">${usd.toFixed(2)}</p> : <p className="text-xs">Available once balance ≥ $5</p>}
      </div>
      <button
        className={`transition-all text-white font-bold px-4 py-2 rounded-lg ${usd >= 5
          ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 cursor-pointer'
          : 'bg-gray-500 cursor-not-allowed opacity-50'
          }`}
        disabled={usd < 5}
        onClick={usd >= 5 ? onWithdrawClick : undefined}
      >
        {usd >= 5 ? 'Withdraw' : '$5 required for available balance'}
      </button>
    </div>
  </div>
);

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
        const payload = response?.payload?.response;

        if (!payload) {
          setViews(0);
          return;
        }

        // Ensure payload is a valid JSON string
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;

        setViews(parsed?.views ?? 0);

      } catch {
        setViews(0);
      }
    };

    fetchViews();
  }, [session, dispatch, creator_portfolio_id]);

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

      {/* Gold Card - Always show total current balance, not month-specific */}
      <div className="bg-[#111624] rounded-lg px-4 py-3 mb-3">
        <div className="flex justify-between">
          <button
            className="text-sm text-blue-400 font-semibold focus:outline-none cursor-pointer"
            onClick={() => router.push("/goldstat/earnings")}
            type="button"
          >
            Gold &gt;
          </button>
          <Image
            src="/icons/help.svg"
            alt="help"
            width={16}
            height={16}
            className="cursor-pointer"
            onClick={() => setShowPopup(true)}
          />
        </div>
        <div className="flex items-center mt-2">
          <button
            type="button"
            onClick={() => router.push("/goldstat/earnings")}
            className="focus:outline-none hover:scale-105 transition-transform"
          >
            <Image
              src="/icons/icons8.png"
              alt="gold"
              width={32}
              height={32}
              className="mr-1"
            />
          </button>
          <p className="text-lg font-bold">{totalCurrentBalance}</p>
        </div>
        <p className="text-sm">= ${totalCurrentBalanceUSD.toFixed(2)}</p>
      </div>

      {/* Withdraw Request - Always show total current balance, not month-specific */}
      <WithdrawRequestCard usd={totalCurrentBalanceUSD} onWithdrawClick={handleWithdrawClick} />

      {/* Account Analytics - Show for selected month */}
      {analytics.request > 0 || analytics.gift > 0 || analytics.like > 0 || analytics.followers > 0 || analytics.earning > 0 ? (
        <div className="bg-[#111624] rounded-lg px-4 py-3 mb-3">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-sm">Account analytics</p>
            <div className="flex items-center gap-2">
              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-600 rounded-lg p-2 flex flex-col">
              <p>Fan Request</p>
              <p className="text-xl font-bold">{analytics.request}</p>
            </div>
            <div className="bg-indigo-600 rounded-lg p-2 flex flex-col">
              <p>Earnings</p>
              <p className="text-xl font-bold">$ {(analytics.earning * 0.04).toFixed(2)}</p>
            </div>
            <div className="bg-emerald-600 rounded-lg p-2 flex flex-col">
              <p>Portfolio views</p>
              <p className="text-xl font-bold">{views}</p>
            </div>
            <div className="bg-pink-600 rounded-lg p-2 flex flex-col">
              <p>New Fans</p>
              <p className="text-xl font-bold">{analytics.followers}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#111624] rounded-lg px-4 py-3 mb-3">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-sm">Account analytics</p>
            <div className="flex items-center gap-2">
              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
          <div className="text-center text-gray-400">
            <p className="text-sm">No activity for {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      )}

      {/* Pending Withdrawals Section */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-[#111624] rounded-lg px-4 py-3 mb-3">
          <div className="flex justify-between mb-3">
            <p className="font-semibold text-sm">Pending Withdrawals</p>
            <p className="text-xs text-yellow-400">{pendingWithdrawals.length} request{pendingWithdrawals.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2">
            {pendingWithdrawals.map((request, index) => (
              <div key={request._id || index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">${request.amount}</p>
                    <p className="text-xs text-gray-400">
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
                    <span className="inline-block bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111624] p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add Payment Account</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              You need to add your payment account details before you can withdraw funds.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  router.push('/goldstat/payment-account?return=withdrawal');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-6 py-3 rounded-lg"
              >
                Go to Payment Account Page
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111624] p-8 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-bold mb-4 text-white">Confirm Withdrawal</h2>

            {/* Payment Account Details */}
            {paymentAccountDetails && (
              <div className="bg-gray-700 p-4 rounded-lg mb-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete Account
                  </button>
                </div>
                <p className="text-sm text-gray-300"><strong>Name:</strong> {paymentAccountDetails.fullName}</p>
                <p className="text-sm text-gray-300 break-all"><strong>Email:</strong> {paymentAccountDetails.email}</p>
                <p className="text-sm text-gray-300"><strong>Country:</strong> {paymentAccountDetails.country}</p>
               <p className="text-sm text-gray-300"><strong>Stablecoin:</strong> {paymentAccountDetails.currency || (() => {
  const cryptoType = paymentAccountDetails.cryptoType;
  if (!cryptoType) return 'Crypto';
  if (cryptoType.includes('_')) {
    const [currency, network] = cryptoType.split('_');
    return `${currency} (${network})`;
  }
  return cryptoType;
})()}</p>
                <p className="text-sm text-gray-300 break-all"><strong>Wallet:</strong> {paymentAccountDetails.walletAddress}</p>
              </div>
            )}

            <p className="text-gray-300 mb-4">
              Available: ${totalCurrentBalanceUSD.toFixed(2)}<br />
              Min: $5
            </p>

            <div className="mb-4">
              <input
                type="number"
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="5"
                max={totalCurrentBalanceUSD}
                step="0.01"
              />
              {withdrawError && (
                <p className="text-red-400 text-sm mt-2">{withdrawError}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-6 py-3 rounded-lg flex-1"
                onClick={handleConfirmWithdraw}
              >
                Confirm Withdraw
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg flex-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111624] p-8 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-bold mb-4 text-white">Delete Payment Account</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete your payment account? You&apos;ll all need to add it again to make withdrawals.
            </p>

            <div className="flex gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg flex-1"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111624] p-8 rounded-lg shadow-lg text-center w-96">
            <div className="flex justify-center mb-6">
              <Image src="/icons/icons8.png" alt="gold" width={64} height={64} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Instruction</h2>
            <p className="text-white mb-6 text-lg">1 gold = $0.04 </p>
            <p className="text-white mb-6 text-lg">You can make withdrawals manually and the corresponding amount
              will be credited to your USDT (BEP20) wallet within 24 hours </p>
            <button
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-6 py-3 rounded-lg"
              onClick={() => setShowPopup(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111624] p-8 rounded-lg shadow-lg text-center w-96">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Withdrawal Submitted!</h2>
            <p className="text-gray-300 mb-6">
              Withdrawal submitted successfully. Processing typically completes within 24 hours
            </p>
            <button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all text-white font-bold px-6 py-3 rounded-lg"
              onClick={() => setShowSuccessModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;