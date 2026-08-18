/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import PacmanLoader from "react-spinners/RingLoader";
import { useDispatch, useSelector } from "react-redux";

import Image from "next/image";
import { HelpCircle } from "lucide-react";

import { get_transaction_history } from '@/store/goldstatSlice';
import { RootState } from '@/store/store';
import { useAuth } from '@/lib/context/auth-context';
import HistoryCard from "@/components/goldstat/HistoryCard";

// Remove dummyMonthsData. We'll use Redux state instead.

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

      {/* Gold Card */}
      <div className="bg-[#111624] rounded-lg px-4 py-3 mb-3">
        <div className="flex justify-between">
          <button
            className="text-sm text-blue-400 font-semibold focus:outline-none cursor-pointer"
            onClick={() => window.history.back()}
            type="button"
          >
            ← Back
          </button>
         <HelpCircle className="text-blue-400 cursor-pointer" width={18} height={18} strokeWidth={2.25} />
        </div>
        <div className="flex items-center mt-2">
          <span
            className="rounded-full flex items-center justify-center shrink-0 mr-1"
            style={{ width: 32, height: 32, boxShadow: "0 4px 12px -4px rgba(245,196,81,0.5)" }}
          >
            <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 4px 8px rgba(245,196,81,0.4))" }}>
              <circle cx="12" cy="12" r="10" fill="#F5C451" />
              <circle cx="12" cy="12" r="10" fill="none" stroke="#B8860B" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="7" fill="none" stroke="#B8860B" strokeWidth="0.8" opacity="0.45" />
              <path d="M12 7.3l1.1 2.6 2.7.3-2 1.8.5 2.7-2.3-1.4-2.3 1.4.5-2.7-2-1.8 2.7-.3L12 7.3z" fill="#B8860B" opacity="0.55" />
            </svg>
          </span>
          <p className="text-lg font-bold">{earnings || 0}</p>
        </div>
        <p className="text-sm">= ${((parseFloat(earnings) || 0) * 0.04).toFixed(2)}</p>
      </div>

      {/* All Transactions */}
      <div className="flex flex-col gap-4 mt-6">
        <h3 className="text-lg font-bold text-white mb-2">All Transactions</h3>
        {error && (
          <p className="text-center text-red-400">Failed to fetch transactions</p>
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
          <p className="text-center text-gray-400">
            No transactions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Earnings;

