/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {  useEffect } from "react";
import PacmanLoader from "react-spinners/RingLoader";
import { useDispatch, useSelector } from "react-redux";

import Image from "next/image";

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
      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-3">
        <div className="flex justify-between">
            <button
            className="text-sm text-blue-400 font-semibold focus:outline-none cursor-pointer"
            onClick={() => window.history.back()}
            type="button"
          >
            ← Back
          </button>
          <Image
            src="/icons/help.svg"
            alt="help"
            width={16}
            height={16}
            className="cursor-pointer"
          />
          </div>
        <div className="flex items-center mt-2">
          <Image
            src="/icons/icons8.png"
            alt="gold"
            width={32}
            height={32}
            className="mr-1"
          />
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

