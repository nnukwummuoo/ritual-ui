/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import PacmanLoader from "react-spinners/RingLoader";
import { useDispatch, useSelector } from "react-redux";

import { get_transaction_history } from '@/store/goldstatSlice';
import { RootState } from '@/store/store';
import { useAuth } from '@/lib/context/auth-context';
import HistoryCard from "@/components/goldstat/HistoryCard";

interface Transaction {
  id: string;
  created_at: string;
  amount: string;
  description?: string;
  status?: "completed" | "pending" | "failed";
}

const Earnings: React.FC = () => {
  const dispatch = useDispatch();
  const { session } = useAuth();
  const { transactions, loading, error } = useSelector((state: RootState) => state.goldstat);
  const { earnings } = useSelector((state: RootState) => state.profile);


  useEffect(() => {
    if (session?._id && session?.token) {
      dispatch(get_transaction_history({ userId: session._id, token: session.token }) as any);
    }
  }, [dispatch, session]);

  // Show all transactions
  const allTransactions = transactions || [];

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:ml-36 min-h-screen py-8 px-6 text-white">
      {loading && (
        <div className="flex flex-col items-center mt-16">
          <PacmanLoader color="#fff" size={35} />
          <p className="text-sm mt-2">Loading...</p>
        </div>
      )}

      {/* Back + heading */}
      <button
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#161b2e] px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540] focus:outline-none cursor-pointer"
        onClick={() => window.history.back()}
        type="button"
      >
        ← Back
      </button>
      <div className="mt-4 mb-5">
        <h1 className="text-3xl font-extrabold text-white">Gold</h1>
        <p className="mt-1 text-sm text-slate-400">Your Gold balance and every transaction.</p>
      </div>

      {/* Gold balance */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#f5c451]/[0.16] via-[#0d1220] to-[#0d1220] p-6">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#f5c451]/15 blur-3xl" />
        <p className="relative text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gold balance</p>
        <div className="relative mt-3 flex items-center gap-3">
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
          <p className="text-4xl sm:text-5xl font-extrabold text-white">{earnings || 0}</p>
        </div>
        <p className="relative mt-2 text-sm text-slate-300">≈ ${((parseFloat(earnings) || 0) * 0.04).toFixed(2)} <span className="text-slate-500">· 1 Gold = $0.04</span></p>
      </div>

      {/* All Transactions */}
      <div className="flex flex-col gap-3 mt-7">
        <h3 className="text-lg font-bold text-white">All Transactions</h3>
        {error && (
          <p className="rounded-2xl border border-red-500/25 bg-[#2a1216] px-4 py-3 text-center text-sm text-red-300">Failed to fetch transactions</p>
        )}

        {allTransactions && allTransactions.length > 0 ? (
          allTransactions.map((item: Transaction) => (
            <HistoryCard
              key={item.id}
              name={item.description || "Transaction"}
              amount={item.amount}
              date={new Date(item.created_at).toLocaleDateString()}
              status={item.status || "completed"}
            />
          ))
        ) : !error && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0d1220] px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-300">No transactions found</p>
            <p className="mt-1 text-xs text-slate-500">Your Gold activity will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;