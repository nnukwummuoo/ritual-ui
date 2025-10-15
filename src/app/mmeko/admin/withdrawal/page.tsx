/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const token = useAuthToken();

  // Color array for containers
  const colors = ['purple', 'orange', 'pink', 'yellow', 'black'];
  
  // Get color for a specific index
  const getColorForIndex = (index: number) => colors[index % colors.length];

  // Filter withdrawals based on search term and selected color
  const filteredWithdrawals = withdrawals.filter((req, index) => {
    const userFullName = (req as any).userId ? `${(req as any).userId.firstname || ''} ${(req as any).userId.lastname || ''}`.trim() : '';
    const userNickname = (req as any).userId?.nickname || '';
    const credentialsFullName = req.credentials?.fullName || '';
    
    const matchesSearch = !searchTerm || 
      userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credentialsFullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColor = !selectedColor || getColorForIndex(index) === selectedColor;
    
    return matchesSearch && matchesColor;
  });

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
    const fetchRequests = async () => {
      try {
        console.log("Fetching withdrawal requests...");
        const res = await axios.get(`${URL}/withdraw-request`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        // Sort by creation date, newest first
        const sortedRequests = (res.data.requests || []).sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.requestedAt || 0);
          const dateB = new Date(b.createdAt || b.requestedAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setWithdrawals(sortedRequests);
        setLoading(false);
      } catch (err) {
        console.error("[Withdrawals] fetch error:", err);
        setWithdrawals([]);
        setLoading(false);
      }
    };

    if (token) {
      fetchRequests();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <ToastContainer position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-400">
          Withdrawal Requests
        </h1>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Color Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 whitespace-nowrap">Filter by color:</span>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedColor(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedColor === null
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedColor === color
                    ? `bg-${color}-600 text-white`
                    : `bg-${color}-500 text-white hover:bg-${color}-600`
                }`}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-300">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWithdrawals?.map((req, index) => {
            const containerColor = getColorForIndex(index);
            return (
              <div
                key={req._id}
                className="bg-gray-800 rounded-xl shadow-lg p-5 hover:shadow-emerald-400 transition relative"
              >
                {/* Colored Circle */}
                <div className={`absolute bottom-4 right-4 w-4 h-4 rounded-full bg-${containerColor}-500`}></div>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {(req as any).userId ? `${(req as any).userId.firstname || ''} ${(req as any).userId.lastname || ''}`.trim() || req.credentials?.fullName || "User" : req.credentials?.fullName || "User"}
                    </h2>
                    {(req as any).userId?.nickname && (
                      <p className="text-sm text-gray-400">@{(req as any).userId.nickname}</p>
                    )}
                  </div>
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
            );
          })}
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
            <p><strong>User Name:</strong> {(selected as any).userId ? `${(selected as any).userId.firstname || ''} ${(selected as any).userId.lastname || ''}`.trim() || selected.credentials.fullName : selected.credentials.fullName}</p>
            {(selected as any).userId?.nickname && (
              <p><strong>Nickname:</strong> @{(selected as any).userId.nickname}</p>
            )}
            <p><strong>Payment Name:</strong> {selected.credentials.fullName}</p>
            <p><strong>Email:</strong> {selected.credentials.email}</p>
            <p><strong>Phone:</strong> {selected.credentials.phone}</p>
            <p><strong>Country:</strong> {selected.credentials.country}</p>
            <p><strong>Crypto Type:</strong> {(selected.credentials as any).cryptoType}</p>
            <p><strong>Wallet Address:</strong> {(selected.credentials as any).walletAddress}</p>
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
