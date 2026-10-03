"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getdocument, verifycreator, rejectdocument, updateApplicationDocument, deleteApplicationDocument } from "@/store/creatorSlice";
import PacmanLoader from "react-spinners/RingLoader";
import { getImageSource, createImageFallbacks } from "@/lib/imageUtils";

/* ─── Edit Application Modal ─── */
function EditApplicationModal({
  doc, onClose, onSave, saving,
}: {
  doc: any; onClose: () => void; saving: boolean;
  onSave: (docid: string, fields: Record<string, any>, files: { idPhotofile?: File; holdingIdPhotofile?: File }) => void;
}) {
  const [form, setForm] = useState({
    firstname: doc.firstname || "",
    lastname: doc.lastname || "",
    email: doc.email || "",
    dob: doc.dob || "",
    country: doc.country || "",
    city: doc.city || "",
    address: doc.address || "",
    documentType: doc.documentType || "",
    idexpire: doc.idexpire || "",
  });
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [holdingIdPhotoFile, setHoldingIdPhotoFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(doc.idPhotofile?.idPhotofilelink || null);
  const [holdingPreview, setHoldingPreview] = useState<string | null>(doc.holdingIdPhotofile?.holdingIdPhotofilelink || null);

  const handleChange = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

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
      <div className="bg-[#111624] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">Edit Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {([
            ["firstname", "First Name"], ["lastname", "Last Name"],
            ["email", "Email"], ["dob", "Date of Birth"],
            ["country", "Country"], ["city", "City"],
            ["address", "Address"], ["documentType", "Document Type"],
            ["idexpire", "ID Expiry"],
          ] as [string, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1">{label}</label>
              <input
                value={(form as any)[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full bg-[#0e1220] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          ))}
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
            onClick={() => onSave(doc._id, form, {
              idPhotofile: idPhotoFile || undefined,
              holdingIdPhotofile: holdingIdPhotoFile || undefined,
            })}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60"
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
  doc: any; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
      <div className="bg-[#111624] border border-gray-700 rounded-xl w-full max-w-sm p-6 text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="text-base font-bold mb-2">Delete this application?</h3>
        <p className="text-sm text-gray-400 mb-6">
          Are you sure you want to delete this application for {doc.firstname} {doc.lastname}? This cannot be undone.
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

export default function AdminVerifyDocumentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.profile.userId);
  const docs = useSelector((state: RootState) => state.creator.documents);
  const docStatus = useSelector((state: RootState) => state.creator.getdocumentstatus);
  const verifyStatus = useSelector((state: RootState) => state.creator.verifycreatorstatus);
  const rejectStatus = useSelector((state: RootState) => state.creator.rejectdocumentstatus);

  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [approvedDocs, setApprovedDocs] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 3-dot menu / edit / delete state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const applyUpdatedDoc = (updated: any) => {
    setPendingDocs((prev) => prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d)));
    setApprovedDocs((prev) => prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d)));
  };

  const handleSaveEdit = async (docid: string, fields: Record<string, any>, files: { idPhotofile?: File; holdingIdPhotofile?: File }) => {
    setSavingEdit(true);
    try {
      const result = await dispatch(updateApplicationDocument({ docid, fields, files })).unwrap();
      if (result?.document) applyUpdatedDoc(result.document);
      setEditingDoc(null);
    } catch (err: any) {
      alert(typeof err === "string" ? err : "Failed to update application");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    setDeleting(true);
    try {
      await dispatch(deleteApplicationDocument({ docid: deletingDoc._id })).unwrap();
      setPendingDocs((prev) => prev.filter((d) => d._id !== deletingDoc._id));
      setApprovedDocs((prev) => prev.filter((d) => d._id !== deletingDoc._id));
      setDeletingDoc(null);
    } catch (err: any) {
      alert(typeof err === "string" ? err : "Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  // Fetch documents on mount
  useEffect(() => {
    dispatch(getdocument()).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        const allDocs = result.payload.documents || [];
        setPendingDocs(allDocs.filter((d: any) => !d.verify));
        setApprovedDocs(allDocs.filter((d: any) => d.verify));
      }
    });
  }, [dispatch]);

  // Approve handler
  const handleApprove = (docId: string, userId: string) => {
    dispatch(verifycreator({ userid: userId, docid: docId })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setPendingDocs((prev) => prev.filter((doc) => doc._id !== docId));
        setApprovedDocs((prev) => [
          ...prev,
          { ...pendingDocs.find((doc) => doc._id === docId), verify: true },
        ]);
      }
    });
  };

  // Reject handler
  const handleReject = (docId: string, userId: string) => {
    dispatch(rejectdocument({ userid: userId, docid: docId })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setPendingDocs((prev) => prev.filter((doc) => doc._id !== docId));
      }
    });
  };

  // Handle image click for preview
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  // Close preview
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const renderDocumentCard = (doc: any, isApproved = false) => (
    <div
      key={doc._id}
      className="bg-[#111624] p-6 rounded-lg shadow-lg border border-gray-700"
    >
      {/* Header Section */}
      <div className="flex flex-col items-start mb-4 relative w-full">
        <button
          onClick={() => setOpenMenuId(openMenuId === doc._id ? null : doc._id)}
          className="absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-white/10 text-lg"
          aria-label="Application options"
        >
          ⋮
        </button>
        {openMenuId === doc._id && (
          <div className="absolute top-9 right-0 z-20 w-36 bg-[#1a2233] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => { setEditingDoc(doc); setOpenMenuId(null); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => { setDeletingDoc(doc); setOpenMenuId(null); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              🗑 Delete
            </button>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">
            {doc.firstname} {doc.lastname}
          </h2>
          <p className="text-sm text-gray-400">
            Date of Birth: {doc.dob || "N/A"}
          </p>
          <p className="text-xs text-gray-400">Email: {doc.email || "N/A"}</p>
          <p className="text-sm text-gray-400">
            Document Type: {doc.documentType || "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            {doc.address || "N/A"}, {doc.country || "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            Submitted: {new Date(doc.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Creator Id: {doc._id || "N/A"}</p>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">
            Creator Application
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              doc.verify ? "bg-green-600" : "bg-yellow-600"
            }`}
          >
            Status: {doc.verify ? "approved" : "pending"}
          </span>
        </div>
      </div>

      {/* ID Photo */}
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <h3 className="text-md font-medium mb-2">ID Photo</h3>
        {doc.idPhotofile?.idPhotofilelink ? (
          (() => {
            const imageSource = getImageSource(doc.idPhotofile.idPhotofilelink, 'creator');
            const imageFallbacks = createImageFallbacks(doc.idPhotofile.idPhotofilelink, 'creator');
            const src = imageSource.src;
            
            return (
              <img
                src={src}
                alt="ID Photo"
                className="w-full h-64 object-cover rounded-lg bg-pink-200 cursor-pointer"
                onClick={() => handleImageClick(doc.idPhotofile.idPhotofilelink)}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement & { dataset: any };
                  
                  // Try fallback URLs if available
                  if (imageFallbacks.fallbacks.length > 0) {
                    const currentSrc = img.src;
                    const fallbackIndex = imageFallbacks.fallbacks.findIndex(fallback => fallback === currentSrc);
                    const nextFallback = imageFallbacks.fallbacks[fallbackIndex + 1];
                    
                    if (nextFallback) {
                      img.src = nextFallback;
                      return;
                    }
                  }
                  
                  // If all fallbacks fail, try original URL if it's different
                  if (imageSource.originalUrl && imageSource.originalUrl !== img.src) {
                    img.src = imageSource.originalUrl;
                    return;
                  }
                  
                  // If all attempts fail, show placeholder
                  img.src = '/icons/icon-512x512.png';
                  img.alt = 'Image failed to load';
                }}
              />
            );
          })()
        ) : (
          <div className="w-full h-64 bg-pink-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">No ID Photo Available</p>
          </div>
        )}
      </div>

      {/* Selfie with ID */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-md font-medium mb-2">Selfie with ID</h3>
        {doc.holdingIdPhotofile?.holdingIdPhotofilelink ? (
          (() => {
            const imageSource = getImageSource(doc.holdingIdPhotofile.holdingIdPhotofilelink, 'creator');
            const imageFallbacks = createImageFallbacks(doc.holdingIdPhotofile.holdingIdPhotofilelink, 'creator');
            const src = imageSource.src;
            
            return (
              <img
                src={src}
                alt="Selfie with ID"
                className="w-full h-64 object-cover rounded-lg bg-pink-200 cursor-pointer"
                onClick={() => handleImageClick(doc.holdingIdPhotofile.holdingIdPhotofilelink)}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement & { dataset: any };
                  
                  // Try fallback URLs if available
                  if (imageFallbacks.fallbacks.length > 0) {
                    const currentSrc = img.src;
                    const fallbackIndex = imageFallbacks.fallbacks.findIndex(fallback => fallback === currentSrc);
                    const nextFallback = imageFallbacks.fallbacks[fallbackIndex + 1];
                    
                    if (nextFallback) {
                      img.src = nextFallback;
                      return;
                    }
                  }
                  
                  // If all fallbacks fail, try original URL if it's different
                  if (imageSource.originalUrl && imageSource.originalUrl !== img.src) {
                    img.src = imageSource.originalUrl;
                    return;
                  }
                  
                  // If all attempts fail, show placeholder
                  img.src = '/icons/icon-512x512.png';
                  img.alt = 'Image failed to load';
                }}
              />
            );
          })()
        ) : (
          <div className="w-full h-64 bg-pink-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">No Selfie with ID Available</p>
          </div>
        )}
      </div>

      {/* Buttons only for pending */}
      {!isApproved && (
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => handleApprove(doc._id, doc.userid)}
            disabled={verifyStatus === "loading" || doc.verify}
            className="bg-green-600 px-4 py-2 rounded-lg text-white hover:bg-green-700 disabled:bg-green-400"
          >
            {verifyStatus === "loading" ? "Approving..." : "Accept"}
          </button>
          <button
            onClick={() => handleReject(doc._id, doc.userid)}
            disabled={rejectStatus === "loading" || doc.verify}
            className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700 disabled:bg-red-400"
          >
            {rejectStatus === "loading" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto mt-8 bg-[#080b14] text-white min-h-screen pb-16">
      <h1 className="text-2xl mb-6 font-bold text-center">
        Admin: Verify User Documents
      </h1>

      {/* Edit application modal */}
      {editingDoc && (
        <EditApplicationModal
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            {(() => {
              const imageSource = getImageSource(previewImage, 'creator');
              const imageFallbacks = createImageFallbacks(previewImage, 'creator');
              const src = imageSource.src;
              
              return (
                <img
                  src={src}
                  alt="Full Screen Preview"
                  className="w-full h-auto max-h-screen object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement & { dataset: any };
                    
                    // Try fallback URLs if available
                    if (imageFallbacks.fallbacks.length > 0) {
                      const currentSrc = img.src;
                      const fallbackIndex = imageFallbacks.fallbacks.findIndex(fallback => fallback === currentSrc);
                      const nextFallback = imageFallbacks.fallbacks[fallbackIndex + 1];
                      
                      if (nextFallback) {
                        img.src = nextFallback;
                        return;
                      }
                    }
                    
                    // If all fallbacks fail, try original URL if it's different
                    if (imageSource.originalUrl && imageSource.originalUrl !== img.src) {
                      img.src = imageSource.originalUrl;
                      return;
                    }
                    
                    // If all attempts fail, show placeholder
                    img.src = '/icons/icon-512x512.png';
                    img.alt = 'Image failed to load';
                  }}
                />
              );
            })()}
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 bg-[#111624] text-white p-2 rounded-full hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {docStatus === "loading" && (
        <div className="flex flex-col items-center mt-8">
          <PacmanLoader color="#d49115" loading={true} size={70} />
          <p className="mt-2">Fetching documents...</p>
        </div>
      )}

      {/* Error */}
      {docStatus === "failed" && (
        <p className="text-red-500 text-center">Failed to fetch documents.</p>
      )}

      {/* Pending Section */}
      {docStatus === "succeeded" && (
        <>
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">
              Pending Applications ({pendingDocs.length})
            </h2>
            {pendingDocs.length === 0 ? (
              <p className="text-gray-400">No pending documents.</p>
            ) : (
              <div className="space-y-8">
                {pendingDocs.map((doc) => renderDocumentCard(doc, false))}
              </div>
            )}
          </div>

          {/* Approved Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              Approved Applications ({approvedDocs.length})
            </h2>
            {approvedDocs.length === 0 ? (
              <p className="text-gray-400">No approved documents yet.</p>
            ) : (
              <div className="space-y-8">
                {approvedDocs.map((doc) => renderDocumentCard(doc, true))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}