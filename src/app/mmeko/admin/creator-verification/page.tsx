"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getdocument, verifycreator, rejectdocument } from "@/store/creatorSlice";
import PacmanLoader from "react-spinners/RingLoader";
import { getImageSource, createImageFallbacks } from "@/lib/imageUtils";

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
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
    >
      {/* Header Section */}
      <div className="flex flex-col items-start mb-4">
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
    <div className="container mx-auto mt-8 bg-gray-900 text-white min-h-screen pb-16">
      <h1 className="text-2xl mb-6 font-bold text-center">
        Admin: Verify User Documents
      </h1>

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
              className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
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