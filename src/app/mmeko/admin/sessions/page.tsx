"use client";

import React, { useState } from "react";
import axios from "axios";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { IoWarningOutline } from "react-icons/io5";

const SessionManagement = () => {
  const token = useAuthToken();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleForceLogout = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(
        `${URL}/api/admin/force-logout-all`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setResult(res.data?.message || "All users have been logged out.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to log out users. Please try again.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Session Management</h1>
      <p className="text-gray-400 mb-6">
        Force every logged-in user off the platform. They&apos;ll need to log in again on their next action.
      </p>

      <div className="bg-[#111624] border border-red-500/30 rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <IoWarningOutline className="text-red-400 mt-1 flex-shrink-0" size={22} />
          <div>
            <h2 className="font-semibold text-red-400">Log out all users</h2>
            <p className="text-sm text-gray-400 mt-1">
              This immediately invalidates every active session across the platform —
              including other admins. Everyone will be required to log in again. This cannot be undone.
            </p>
          </div>
        </div>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            Log out all users
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleForceLogout}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Logging everyone out..." : "Yes, log out everyone now"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}

        {result && <p className="text-green-400 text-sm mt-4">{result}</p>}
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default SessionManagement;