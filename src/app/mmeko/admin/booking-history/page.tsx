"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Ban, MessageSquare, Copy, Check } from "lucide-react";
import { getAdminBookings, getAdminBookingConversation, adminCancelBooking, adminReleasePayment, AdminBooking } from "@/api/adminBookings";

const STATUS_OPTIONS = ["all", "request", "accepted", "completed", "cancelled", "declined", "expired"];
const HOSTTYPE_OPTIONS = ["all", "Fan meet", "Fan date", "Fan call"];

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: typeof Clock; label: string }> = {
    request: { color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", icon: Clock, label: "Sent" },
    accepted: { color: "bg-green-500/20 text-green-400 border border-green-500/30", icon: CheckCircle, label: "Accepted" },
    completed: { color: "bg-purple-500/20 text-purple-400 border border-purple-500/30", icon: Check, label: "Completed" },
    cancelled: { color: "bg-orange-500/20 text-orange-400 border border-orange-500/30", icon: Ban, label: "Cancelled" },
    declined: { color: "bg-red-500/20 text-red-400 border border-red-500/30", icon: XCircle, label: "Declined" },
    expired: { color: "bg-gray-500/20 text-gray-400 border border-gray-500/30", icon: AlertCircle, label: "Expired" },
  };
  const c = config[status] || config.request;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3" />
      <span>{c.label}</span>
    </span>
  );
};

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hosttypeFilter, setHosttypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<AdminBooking | null>(null);

  const [conversationFor, setConversationFor] = useState<AdminBooking | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<{ id: string; fromid: string; toid: string; content: string; date: string }[]>([]);
  const [conversationNames, setConversationNames] = useState<{ fanName: string; creatorName: string } | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminBookings({
        page: currentPage,
        limit: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
        hosttype: hosttypeFilter !== "all" ? hosttypeFilter : undefined,
        search: searchTerm || undefined,
      });
      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, hosttypeFilter, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, hosttypeFilter, searchTerm]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  const copyRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setActioningId(cancelTarget.id);
    try {
      await adminCancelBooking(cancelTarget.id, cancelTarget.userid, cancelTarget.creator_portfolio_id);
      toast.success("Booking cancelled");
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setActioningId(null);
    }
  };

  const handleConfirmRelease = async () => {
    if (!releaseTarget) return;
    setActioningId(releaseTarget.id);
    try {
      await adminReleasePayment(releaseTarget.id, releaseTarget.userid, releaseTarget.creator_portfolio_id);
      toast.success("Payment released to creator");
      setReleaseTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to release payment");
    } finally {
      setActioningId(null);
    }
  };

  const openConversation = async (booking: AdminBooking) => {
    if (!booking.creatorUserid) {
      toast.error("Creator's account could not be resolved for this booking");
      return;
    }
    setConversationFor(booking);
    setConversationLoading(true);
    setConversationMessages([]);
    setConversationNames(null);
    try {
      const data = await getAdminBookingConversation(booking.userid, booking.creatorUserid);
      setConversationMessages(data.messages || []);
      setConversationNames({ fanName: data.fanName, creatorName: data.creatorName });
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Booking History</h1>
          <p className="text-gray-400 mt-2">
            All sent, accepted, cancelled, and completed booking requests across the platform ({totalCount} total)
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#111624] rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input
                type="text"
                placeholder="Search by booking ID, fan, or creator name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-gray-700 [&>option]:text-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <select
              value={hosttypeFilter}
              onChange={(e) => setHosttypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-gray-700 [&>option]:text-white"
            >
              {HOSTTYPE_OPTIONS.map((h) => (
                <option key={h} value={h}>{h === "all" ? "All types" : h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="bg-[#111624] rounded-lg shadow-sm border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No bookings match these filters.</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {bookings.map((b) => (
                <div key={b.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => b.bookingRef && copyRef(b.bookingRef)}
                          className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                          title="Copy booking ID"
                        >
                          {b.bookingRef || "No ID"}
                          {b.bookingRef && (copiedRef === b.bookingRef ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />)}
                        </button>
                        <StatusBadge status={b.status} />
                        <span className="text-xs text-gray-500">{b.hosttype || "Fan meet"}</span>
                      </div>
                      <p className="text-white text-sm">
                        <span className="font-semibold">{b.fanName}</span>
                        <span className="text-gray-500"> → </span>
                        <span className="font-semibold">{b.creatorName}</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {b.date ? `${b.date}${b.time ? ` at ${b.time}` : ""}` : "No date set"}
                        {b.place ? ` · ${b.place}` : ""}
                        {typeof b.price === "number" ? ` · ${b.price} gold` : ""}
                      </p>
                      <p className="text-gray-600 text-[11px] mt-1">Sent {formatDate(b.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {b.status === "request" && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          disabled={actioningId === b.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          Cancel request
                        </button>
                      )}

                      {b.status === "accepted" && (
                        <>
                          <button
                            onClick={() => setCancelTarget(b)}
                            disabled={actioningId === b.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setReleaseTarget(b)}
                            disabled={actioningId === b.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 border border-green-500/25 text-green-300 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            Release payment
                          </button>
                          <button
                            onClick={() => openConversation(b)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Read message
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400 px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4" onClick={() => setCancelTarget(null)}>
          <div className="bg-[#111624] rounded-2xl p-6 max-w-sm w-full border border-white/10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#f43f5e,#fb923c)" }} />
            <div className="flex items-center justify-center mb-4 mt-1">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.25)" }}>
                <Ban className="text-rose-400" size={24} />
              </div>
            </div>
            <h3 className="text-white font-bold text-base text-center mb-2">Cancel this booking?</h3>
            <p className="text-gray-400 text-xs text-center mb-6 leading-relaxed">
              {cancelTarget.bookingRef} — {cancelTarget.fanName} × {cancelTarget.creatorName}. This will notify both parties
              {cancelTarget.status === "accepted" ? " and refund any pending gold back to the fan" : ""}. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} disabled={actioningId === cancelTarget.id} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50">
                Go back
              </button>
              <button onClick={handleConfirmCancel} disabled={actioningId === cancelTarget.id} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg,#f43f5e,#fb7185)" }}>
                {actioningId === cancelTarget.id ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release payment confirmation */}
      {releaseTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4" onClick={() => setReleaseTarget(null)}>
          <div className="bg-[#111624] rounded-2xl p-6 max-w-sm w-full border border-white/10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#6c63ff,#9b59f5)" }} />
            <div className="flex items-center justify-center mb-4 mt-1">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(108,99,255,.12)", border: "1px solid rgba(108,99,255,.25)" }}>
                <CheckCircle className="text-[#9b8dff]" size={24} />
              </div>
            </div>
            <h3 className="text-white font-bold text-base text-center mb-2">Release this payment?</h3>
            <p className="text-gray-400 text-xs text-center mb-6 leading-relaxed">
              {releaseTarget.bookingRef} — {typeof releaseTarget.price === "number" ? `${releaseTarget.price} gold` : "This payment"} will be released to {releaseTarget.creatorName} and marked complete. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setReleaseTarget(null)} disabled={actioningId === releaseTarget.id} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirmRelease} disabled={actioningId === releaseTarget.id} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)" }}>
                {actioningId === releaseTarget.id ? "Releasing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read-only conversation */}
      {conversationFor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4" onClick={() => setConversationFor(null)}>
          <div className="bg-[#111624] rounded-2xl max-w-lg w-full border border-white/10 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div>
                <h3 className="text-white font-bold text-sm">
                  {conversationNames ? `${conversationNames.fanName} × ${conversationNames.creatorName}` : "Conversation"}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">{conversationFor.bookingRef} — read-only</p>
              </div>
              <button onClick={() => setConversationFor(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {conversationLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversationMessages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">No messages between these two yet.</p>
              ) : (
                conversationMessages.map((m) => {
                  const isFromFan = m.fromid === conversationFor.userid;
                  return (
                    <div key={m.id} className={`flex ${isFromFan ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[75%] rounded-xl px-3.5 py-2 text-sm ${isFromFan ? "bg-gray-700 text-white" : "bg-[#6c63ff] text-white"}`}>
                        <p>{m.content}</p>
                        <p className="text-[10px] opacity-60 mt-1">{m.date}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;