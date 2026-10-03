/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getFanDocuments, verifyfan, rejectfan, updateApplicationDocument, deleteApplicationDocument } from "@/store/creatorSlice";
import { useAuth } from "@/lib/context/auth-context";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { toast, ToastContainer } from "react-toastify";
import ClockLoader from "react-spinners/ClockLoader";

/* ─── types ─── */
type DocStatus = "pending" | "approved" | "declined";
type FilterTab = "pending" | "approved" | "declined" | "all";

interface FanDoc {
  _id: string;
  userid: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  photolink?: string;
  // correct nested shape from backend
  idPhotofile?: { idPhotofilelink?: string };
  holdingIdPhotofile?: { holdingIdPhotofilelink?: string };
  createdAt?: string;
  status: DocStatus;
  documentType?: string;
  verify?: boolean; // raw backend field
}

/* ─── helpers ─── */
const timeAgo = (date?: string) => {
  if (!date) return "Unknown time";
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

const initials = (doc: FanDoc) =>
  ((doc.firstname?.[0] || "") + (doc.lastname?.[0] || "")).toUpperCase() || "?";

const AVATAR_GRADIENTS = [
  "from-[#6c63ff] to-[#9b59f5]",
  "from-[#f472b6] to-[#db2777]",
  "from-[#2dd4bf] to-[#0891b2]",
  "from-[#fb923c] to-[#ea580c]",
  "from-[#a3e635] to-[#65a30d]",
];

/* ─── Lightbox ─── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center text-lg hover:bg-white/20 transition-colors"
      >✕</button>
      <img
        src={src}
        alt="Document"
        className="max-w-full max-h-[90vh] rounded-xl border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

/* ─── Confirm Modal (bottom sheet) ─── */
function ConfirmModal({ type, onConfirm, onCancel, loading }: {
  type: "approved" | "declined" | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!type) return null;
  const isApprove = type === "approved";
  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[480px] bg-[#111824] rounded-t-[20px] border-t border-white/[.08] px-6 pb-10 pt-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-sm bg-white/10 mx-auto mb-5" />
        <div className="text-base font-extrabold mb-1.5">
          {isApprove ? "Approve verification?" : "Decline verification?"}
        </div>
        <div className="text-[13px] text-[#94a3b8] mb-6 leading-relaxed">
          {isApprove
            ? "This will grant the fan a verified badge and 2× request acceptance rate."
            : "The fan will be notified that their verification was unsuccessful and can reapply."}
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
              isApprove
                ? "bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-lg shadow-green-900/30"
                : "bg-red-500/10 border border-red-500/20 !text-red-400"
            }`}
          >
            {loading ? <ClockLoader color={isApprove ? "#fff" : "#ef4444"} size={14}/> : null}
            {loading ? "Processing…" : isApprove ? "Yes, Approve" : "Yes, Decline"}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#94a3b8] bg-white/5 border border-white/[.07] hover:text-white hover:bg-white/[.08] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Application Card ─── */
function AppCard({
  doc, idx, onAction, onEdit, onDelete,
}: {
  doc: FanDoc; idx: number; onAction: (id: string, userid: string, type: "approved" | "declined") => void;
  onEdit: (doc: FanDoc) => void; onDelete: (doc: FanDoc) => void;
}) {
  const [lightbox, setLightbox] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
  const fullName = [doc.firstname, doc.lastname].filter(Boolean).join(" ") || "Unknown User";

  // ✅ FIX: read from correct nested paths
  const idPhotoUrl = doc.idPhotofile?.idPhotofilelink;
  const holdingIdPhotoUrl = doc.holdingIdPhotofile?.holdingIdPhotofilelink;

  const cardBorder =
    doc.status === "approved" ? "border-green-500/20" :
    doc.status === "declined" ? "border-red-500/15 opacity-60" :
    "border-white/[.07] hover:border-[#6c63ff]/20";

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox("")} />}
      <div className={`bg-[#111624] border rounded-[18px] overflow-hidden mb-5 transition-colors ${cardBorder}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-[22px] py-[18px] border-b border-white/[.04]">
          <div className="flex items-center gap-3.5">
            {doc.photolink ? (
              <img src={doc.photolink} alt={fullName} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
            ) : (
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-extrabold text-white bg-gradient-to-br ${gradient}`}>
                {initials(doc)}
              </div>
            )}
            <div>
              <div className="text-[15px] font-bold flex items-center gap-2 flex-wrap">
                {fullName}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  doc.status === "pending"  ? "bg-amber-500/10 text-amber-400" :
                  doc.status === "approved" ? "bg-green-500/10 text-green-400" :
                                              "bg-red-500/10 text-red-400"
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="text-xs text-[#475569]">@{doc.username || doc.userid?.slice(0,8)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[11.5px] text-[#475569]">Submitted {timeAgo(doc.createdAt)}</div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#94a3b8] hover:bg-white/10 text-lg"
                aria-label="Application options"
              >
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute top-9 right-0 z-20 w-36 bg-[#1a2233] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  <button
                    onClick={() => { onEdit(doc); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => { onDelete(doc); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Docs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-px bg-white/[.04]">
          {[
            { label: "Government ID",  icon: "🪪",  url: idPhotoUrl },
            { label: "Selfie with ID", icon: "🤳", url: holdingIdPhotoUrl },
          ].map(slot => (
            <div key={slot.label} className="bg-[#111624] p-5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#475569] mb-3">
                <span className="text-[13px]">{slot.icon}</span> {slot.label}
              </div>
              <div
                onClick={() => slot.url && setLightbox(slot.url)}
                className={`bg-[#0e1220] border border-white/[.07] rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative group transition-colors ${slot.url ? "cursor-pointer hover:border-[#6c63ff]/30" : ""}`}
              >
                {slot.url ? (
                  <>
                    <img src={slot.url} alt={slot.label} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"/>
                    <div className="absolute bottom-2 right-2 bg-black/60 rounded-[5px] px-2 py-0.5 text-[10px] text-white/60 font-semibold">Tap to expand</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-5 text-center">
                    <div className="text-[28px] opacity-40">{slot.icon}</div>
                    <div className="text-[11px] text-[#475569]">{doc.documentType || "Document"}<br/>submitted</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {doc.status === "pending" ? (
          <div className="flex items-center justify-between flex-wrap gap-3 px-[22px] py-4">
            <div className="text-xs text-[#475569]">Review the documents above before actioning</div>
            <div className="flex gap-2.5">
              <button
                onClick={() => onAction(doc._id, doc.userid, "declined")}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-[9px] bg-red-500/[.08] border border-red-500/20 text-red-400 text-[13px] font-bold hover:bg-red-500/15 transition-colors"
              >✕ Decline</button>
              <button
                onClick={() => onAction(doc._id, doc.userid, "approved")}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-[9px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white text-[13px] font-bold shadow-lg shadow-green-900/30 hover:-translate-y-px hover:shadow-green-900/50 transition-all"
              >✓ Approve</button>
            </div>
          </div>
        ) : (
          <div className={`px-[22px] py-3.5 text-[13px] font-semibold flex items-center gap-2 ${doc.status === "approved" ? "text-green-400" : "text-red-400"}`}>
            {doc.status === "approved" ? "✓ Verified — fan has been notified" : "✕ Declined — fan has been notified"}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Edit Fan Application Modal (photos only — fan submissions carry no personal fields) ─── */
function EditFanPhotosModal({
  doc, onClose, onSave, saving,
}: {
  doc: FanDoc; onClose: () => void; saving: boolean;
  onSave: (docid: string, files: { idPhotofile?: File; holdingIdPhotofile?: File }) => void;
}) {
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [holdingIdPhotoFile, setHoldingIdPhotoFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(doc.idPhotofile?.idPhotofilelink || null);
  const [holdingPreview, setHoldingPreview] = useState<string | null>(doc.holdingIdPhotofile?.holdingIdPhotofilelink || null);

  const handleIdPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdPhotoFile(file);
    setIdPreview(URL.createObjectURL(file));
  };
  const handleHoldingPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHoldingIdPhotoFile(file);
    setHoldingPreview(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#111624] border border-white/10 rounded-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">Edit Fan Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Government ID Photo</label>
            {idPreview && <img src={idPreview} alt="ID" className="w-full h-40 object-cover rounded-lg mb-2" />}
            <input type="file" accept="image/*" onChange={handleIdPhotoPick} className="text-xs text-gray-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Selfie with ID</label>
            {holdingPreview && <img src={holdingPreview} alt="Selfie" className="w-full h-40 object-cover rounded-lg mb-2" />}
            <input type="file" accept="image/*" onChange={handleHoldingPhotoPick} className="text-xs text-gray-300" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-300 bg-white/5 hover:bg-white/10">
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={() => onSave(doc._id, {
              idPhotofile: idPhotoFile || undefined,
              holdingIdPhotofile: holdingIdPhotoFile || undefined,
            })}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[#a89cff] hover:bg-[#9384ff] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteConfirmModal({ doc, onCancel, onConfirm, deleting }: {
  doc: FanDoc; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  const fullName = [doc.firstname, doc.lastname].filter(Boolean).join(" ") || "this user";
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
      <div className="bg-[#111624] border border-white/10 rounded-xl w-full max-w-sm p-6 text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="text-base font-bold mb-2">Delete this application?</h3>
        <p className="text-sm text-[#94a3b8] mb-6">
          Are you sure you want to delete {fullName}'s fan verification application? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-300 bg-white/5 hover:bg-white/10">
            Cancel
          </button>
          <button
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminFanVerificationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = useAuthToken() || session?.token;

  const [docs,       setDocs]       = useState<FanDoc[]>([]);
  const [filter,     setFilter]     = useState<FilterTab>("pending");
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Confirm modal state
  const [modal,     setModal]     = useState<{ docId: string; userid: string; type: "approved" | "declined" } | null>(null);
  const [actioning, setActioning] = useState(false);

  // Edit / delete state
  const [editingDoc, setEditingDoc] = useState<FanDoc | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<FanDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSaveEdit = async (docid: string, files: { idPhotofile?: File; holdingIdPhotofile?: File }) => {
    setSavingEdit(true);
    try {
      const result = await dispatch(updateApplicationDocument({ docid, fields: {}, files })).unwrap();
      if (result?.document) {
        setDocs((prev) => prev.map((d) => (d._id === docid ? { ...d, ...result.document } : d)));
      }
      setEditingDoc(null);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to update application");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    setDeleting(true);
    try {
      await dispatch(deleteApplicationDocument({ docid: deletingDoc._id })).unwrap();
      setDocs((prev) => prev.filter((d) => d._id !== deletingDoc._id));
      setDeletingDoc(null);
      toast.success("Application deleted.");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  /* ─── fetch all docs on mount ─── */
useEffect(() => {
  dispatch(getFanDocuments())
    .unwrap()
    .then((res: any) => {
      const raw: any[] = res.documents || [];
      const mapped: FanDoc[] = raw.map((d: any) => ({
        _id:                d._id,
        userid:             d.userid,
        firstname:          d.firstname,
        lastname:           d.lastname,
        username:           d.username,
        photolink:          d.photolink,
        idPhotofile:        d.idPhotofile,
        holdingIdPhotofile: d.holdingIdPhotofile,
        createdAt:          d.createdAt,
        documentType:       d.documentType,
        verify:             d.verify,
        status: d.verify === true ? "approved" : "pending",
      }));
      setDocs(mapped);
    })
    .catch((err: any) => toast.error(err?.message || "Failed to load documents"))
    .finally(() => setLoadingDocs(false));
}, [dispatch]);

  const pendingCount = docs.filter(d => d.status === "pending").length;
  const filtered     = filter === "all" ? docs : docs.filter(d => d.status === filter);

  const handleAction = (docId: string, userid: string, type: "approved" | "declined") => {
    setModal({ docId, userid, type });
  };

const confirmAction = async () => {
  if (!modal) return;
  setActioning(true);
  try {
    if (modal.type === "declined") {
      await dispatch(rejectfan({ userid: modal.userid, docid: modal.docId })).unwrap();
      setDocs(prev => prev.filter(d => d._id !== modal.docId));
    } else {
      await dispatch(verifyfan({ userid: modal.userid, docid: modal.docId, token })).unwrap();
      setDocs(prev => prev.map(d => d._id === modal.docId ? { ...d, status: "approved" } : d));
    }
    toast.success(modal.type === "approved" ? "Fan verified!" : "Application declined.");
  } catch (err: any) {
    toast.error(err?.message || "Action failed. Please try again.");
  } finally {
    setActioning(false);
    setModal(null);
  }
};

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "declined", label: "Declined" },
    { key: "all",      label: "All"      },
  ];

  return (
    <div className="min-h-screen bg-[#080b14] text-[#f1f5f9]">
      <ToastContainer position="top-center" theme="dark"/>

      {/* Confirm modal */}
      <ConfirmModal
        type={modal?.type || null}
        onConfirm={confirmAction}
        onCancel={() => setModal(null)}
        loading={actioning}
      />

      {/* Edit application modal */}
      {editingDoc && (
        <EditFanPhotosModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSave={handleSaveEdit}
          saving={savingEdit}
        />
      )}

      {/* Delete confirm modal */}
      {deletingDoc && (
        <DeleteConfirmModal
          doc={deletingDoc}
          onCancel={() => setDeletingDoc(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <div className="max-w-[960px] mx-auto px-6 py-9 pb-20">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight">Fan Verification</h1>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-[11px] font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
                  {pendingCount} pending
                </div>
              )}
            </div>
            <p className="text-[13px] text-[#94a3b8]">Review and action fan identity submissions</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filter === tab.key
                    ? "bg-[#6c63ff]/12 border-[#6c63ff]/25 text-[#a89cff]"
                    : "bg-transparent border-white/[.07] text-[#94a3b8] hover:text-white hover:bg-white/[.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loadingDocs && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <ClockLoader color="#6c63ff" size={36}/>
            <p className="text-[13px] text-[#475569]">Loading submissions…</p>
          </div>
        )}

        {/* Cards */}
      {!loadingDocs && filtered.length > 0 && filtered.map((doc, i) => (
          <AppCard key={doc._id} doc={doc} idx={i} onAction={handleAction} onEdit={setEditingDoc} onDelete={setDeletingDoc}/>
        ))}

        {/* Empty state */}
        {!loadingDocs && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-40">🛡</div>
            <div className="text-base font-bold mb-1.5">No {filter} verifications</div>
            <div className="text-[13px] text-[#94a3b8]">Nothing to review here right now.</div>
          </div>
        )}

      </div>
    </div>
  );
}