"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { getprofile } from "@/store/profile";
import { AppDispatch, RootState } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import axios from "axios";
import { URL } from "@/api/config";

const Success: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const NP_id = searchParams.get("NP_id"); // capture NP_id if present

  const { session } = useAuth();
  const token = useAuthToken() || session?.token;
  const userId = useSelector((state: RootState) => state.profile.userId);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // ✅ Step 1: Remove NP_id query from URL immediately
    if (NP_id) {
      const cleanUrl = window.location.origin + "/buy-gold/success";
      window.history.replaceState(null, "", cleanUrl);
    }

    // ✅ Step 2: One-time automatic refresh to restore user session
    const hasRefreshed = sessionStorage.getItem("successPageRefreshed");
    if (!hasRefreshed) {
      sessionStorage.setItem("successPageRefreshed", "true");
      window.location.reload();
      return; // stop execution until reload finishes
    }

    // ✅ Step 3: Verify payment after refresh (once session is restored)
    const verifyPayment = async () => {
      try {
        const res = await axios.get(`${URL}/payment/verify`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        if (data.success) {
          setStatus("Payment verified successfully. Your gold balance has been updated.");
          if (userId && token) {
            dispatch(getprofile({ userid: userId, token }));
          }
          setTimeout(() => {
            sessionStorage.removeItem("successPageRefreshed"); // cleanup
            router.push("/");
          }, 3000);
        } else {
          setStatus("Payment verification failed or already completed.");
        }
      } catch (err: any) {
        console.error("Payment verification failed:", err.response?.data || err.message);
        setStatus("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) verifyPayment();
  }, [userId, token, dispatch, router, NP_id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-700 mb-6">
          {loading
            ? "Verifying your payment..."
            : status || "Your payment has been processed successfully."}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              sessionStorage.removeItem("successPageRefreshed");
              router.push("/");
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
