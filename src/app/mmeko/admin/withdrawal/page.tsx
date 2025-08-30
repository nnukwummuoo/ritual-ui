"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  IoCheckmarkDone,
  IoWallet,
  IoTime,
  IoEye,
} from "react-icons/io5";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "material-react-toastify";
import { useSelector } from "react-redux";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import 'material-react-toastify/dist/ReactToastify.css';
import { URL } from "@/api/config"; // adjust this path to match your setup
import { WithdrawalRequest } from "@/types/withdraw";

// ✅ Dynamically import Modal for client-side only rendering
const Modal = dynamic(() => import("react-modal"), { ssr: false });



const WithdrawalRequests = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);

  const token = useAuthToken();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${URL}/withdraw-request`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setWithdrawals(res.data.requests);
      setLoading(false);
    } catch (err) {
      // Quietly fail: no toasts; leave a clean UI for later backend fixes
      console.debug("[Withdrawals] fetch error suppressed:", err);
      setWithdrawals([]);
      setLoading(false);
    }
  };

  const markAsPaid = async (id: any) => {
    const result = await Swal.fire({
      title: 'Confirm Payment',
      text: "Are you sure this payment has been made?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Mark as Paid',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(`${URL}/withdraw-request/${id}/pay`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setWithdrawals((prev: any) =>
        prev.map((item: any) =>
          item._id === id ? { ...item, status: "paid" } : item
        )
      );
      toast.success("Payment marked as successful!", {
        position: "top-right",
      });
    } catch (err) {
      // Suppress user-facing error; log only
      console.debug("[Withdrawals] markAsPaid error suppressed:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer position="top-center" />
      <h1 className="text-2xl font-bold mb-6 text-emerald-400">
        Withdrawal Requests
      </h1>

      {loading ? (
        <p className="text-center text-gray-300">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {withdrawals?.map((req) => (
            <div
              key={req._id}
              className="bg-gray-800 rounded-xl shadow-lg p-5 hover:shadow-emerald-400 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  {req.credentials?.accountHolder || "User"}
                </h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    req.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="text-sm mb-2 flex items-center gap-2">
                <IoWallet className="text-emerald-400" />
                <span>Amount: ${req.amount}</span>
              </div>

              <div className="text-sm mb-4 flex items-center gap-2">
                <IoTime className="text-emerald-400" />
                <span>
                  Requested:
                  {req.requestedAt || req.createdAt
                    ? new Date(req.requestedAt ?? req.createdAt!).toLocaleDateString("en-US")
                    : "N/A"}
                </span>
              </div>

              {req.status === "pending" ? (
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() => setSelected(req)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-400 transition text-sm w-1/2"
                  >
                    <IoEye className="inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => markAsPaid(req._id)}
                    className="bg-emerald-500 text-white px-3 py-2 rounded-md hover:bg-emerald-400 transition text-sm w-1/2"
                  >
                    Mark Paid
                  </button>
                </div>
              ) : (
                <div className="flex items-center text-green-400 font-medium gap-2 mt-2">
                  <IoCheckmarkDone />
                  Paid
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onRequestClose={() => setSelected(null)}
        className="bg-white rounded-lg p-6 max-w-md mx-auto mt-32 shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50"
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Account Details
        </h2>
        {selected?.credentials ? (
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Method:</strong> {selected.credentials.method}</p>
            <p><strong>Full Name:</strong> {selected.credentials.fullName || selected.credentials.accountHolder}</p>
            <p><strong>Account Number:</strong> {selected.credentials.accountNumber}</p>
            <p><strong>Bank:</strong> {selected.credentials.bankName}</p>
            <p><strong>Currency:</strong> {selected.credentials.currency}</p>
            <p><strong>Email:</strong> {selected.credentials.email}</p>
            <p><strong>Phone:</strong> {selected.credentials.phone}</p>
            <p><strong>Country:</strong> {selected.credentials.country}</p>
          </div>
        ) : (
          <p>No account details found.</p>
        )}
        <button
          onClick={() => setSelected(null)}
          className="mt-6 bg-emerald-500 px-4 py-2 rounded text-white hover:bg-emerald-400"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default WithdrawalRequests;
