"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/RingLoader";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const Allview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;

  const { notifications, notifications_stats } = useSelector(
    (state: RootState) => state.profile
  );
  const userId = useSelector((state: RootState) => state.profile.userId);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && token) {
      dispatch(getNotifications({ userid: userId, token }));
    }
  }, [dispatch, userId, token]);

  useEffect(() => {
    setLoading(notifications_stats === "loading");
  }, [notifications_stats]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <PacmanLoader color="#fff" loading={true} size={35} />
        <p className="text-slate-400 text-xs mt-2">please wait...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-slate-400 text-xs">
          Notifications about your account will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-4 space-y-4 min-h-screen">
      {notifications.map((note: any) => (
        <div
          key={note._id}
          className="relative bg-[#0B0F1A]/70 backdrop-blur-xl border border-slate-800 shadow-lg 
                     rounded-2xl p-6 w-full max-w-md text-white transition hover:border-slate-700"
        >
          <div className="flex flex-col items-start space-y-3">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500/10 p-1.5 rounded-full">
                <CheckCircle className="text-green-500 w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">
                Application Status
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {note.message}
            </p>

            <div className="pt-2">
              <Link href={`/creator/create`}>
              <button
                className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                          rounded-lg text-sm text-slate-200 transition">
                Creator Portfolio
              </button>
            </Link>
            </div>

            <span className="absolute right-4 bottom-3 text-[10px] text-slate-500">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
