"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { get_my_history } from "@/store/goldstatSlice";
import { RootState } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/PacmanLoader";
import HistoryCard from "@/components/goldstat/HistoryCard";

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
}

const WithdrawRequestCard = ({ usd }: { usd: number }) => (
  <div className="bg-gray-800 text-white p-4 rounded-lg mb-3 w-full">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm">Withdrawable Money</p>
        <p className="text-xl font-bold">${usd}</p>
      </div>
      <button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-4 py-2 rounded-lg">
        Withdraw
      </button>
    </div>
  </div>
);

const PaymentAccountModal = () => (
  <div className="bg-gray-800 text-white p-4 rounded-lg w-full">
    <p className="text-sm mb-2">Securely link your Wise or Payoneer account</p>
    <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all font-bold px-4 py-2 rounded-lg">
      Add Account
    </button>
  </div>
);

const HistoryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { session } = useAuth();

  const { history, loading, error } = useSelector(
    (state: RootState) => state.goldstat
  );

  const analytics: Analytics = {
    coin: 0,
    usd: 0,
    request: 0,
    earning: 0,
    gift: 0,
    like: 0,
  };

  useEffect(() => {
    if (session?._id && session?.token) {
      dispatch(get_my_history({ userId: session._id, token: session.token }) as any);
    }
  }, [dispatch, session]);

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:ml-36 min-h-screen py-8 px-6 text-white">
      {loading && (
        <div className="flex flex-col items-center mt-16">
          <PacmanLoader color="#fff" size={35} />
          <p className="text-sm mt-2">Loading...</p>
        </div>
      )}

      {/* Gold Card */}
      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-3">
        <div className="flex justify-between">
          <button
            className="text-sm text-blue-400 font-semibold focus:outline-none cursor-pointer"
            onClick={() => router.push("/goldstat/earnings")}
            type="button"
          >
            Gold &gt;
          </button>
          <img src="/icons/help.svg" alt="help" className="w-4 h-4" />
        </div>
        <div className="flex items-center mt-2">
          <button
            type="button"
            onClick={() => router.push("/goldstat/earnings")}
            className="focus:outline-none hover:scale-105 transition-transform"
          >
            <img
              src="/icons/icons8.png"
              alt="gold"
              className="w-8 h-8 mr-1"
            />
          </button>
          <p className="text-lg font-bold">{analytics.coin}</p>
        </div>
        <p className="text-sm">= ${analytics.usd}</p>
      </div>

      {/* Withdraw Request */}
      <WithdrawRequestCard usd={analytics.usd} />

      {/* Account Analytics */}
      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-3">
        <div className="flex justify-between mb-3">
          <p className="font-semibold text-sm">Account analytics</p>
          <p className="text-xs">Last 28 days</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-600 rounded-lg p-2 flex flex-col">
            <p>Appointments</p>
            <p className="text-xl font-bold">{analytics.request}</p>
          </div>
          <div className="bg-indigo-600 rounded-lg p-2 flex flex-col">
            <p>Earnings</p>
            <p className="text-xl font-bold">${analytics.earning}</p>
          </div>
          <div className="bg-emerald-600 rounded-lg p-2 flex flex-col">
            <p>Gifts</p>
            <p className="text-xl font-bold">{analytics.gift}</p>
          </div>
          <div className="bg-pink-600 rounded-lg p-2 flex flex-col">
            <p>Likes</p>
            <p className="text-xl font-bold">{analytics.like}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex flex-col gap-4 mt-6">
        {error && (
          <p className="text-center text-red-400">Failed to fetch history</p>
        )}

        {history && history.length > 0 ? (
          history.map((item: Transaction) => (
            <HistoryCard
              key={item.id}
              name={item.description || "Transaction"}
              amount={`$${item.amount}`}
              date={item.created_at}
              status={item.status || "completed"}
            />
          ))
        ) : !error && (
          <p className="text-center text-gray-400">
            No transaction history found.
          </p>
        )}
      </div>

      {/* Payment Account Modal */}
      <PaymentAccountModal />
    </div>
  );
};

export default HistoryPage;
