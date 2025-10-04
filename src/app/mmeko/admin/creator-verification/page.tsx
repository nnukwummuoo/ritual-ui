"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getdocument, verifycreator, rejectdocument } from "@/store/creatorSlice";
import PacmanLoader from "react-spinners/RingLoader";

export default function AdminVerifyDocumentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const docs = useSelector((state: RootState) => state.creator.documents); // Documents for all users
  const docStatus = useSelector((state: RootState) => state.creator.getdocumentstatus);
  const verifyStatus = useSelector((state: RootState) => state.creator.verifycreatorstatus);
  const rejectStatus = useSelector((state: RootState) => state.creator.rejectdocumentstatus);

  // State to track fetched documents
  const [userDocuments, setUserDocuments] = useState<any[]>([]);

  // Fetch all documents on component mount
  useEffect(() => {
    dispatch(getdocument()).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setUserDocuments(result.payload.documents || []);
        console.log("Documents:", result.payload.documents); // Debug log
      }
    });
  }, [dispatch]);

  // Approve handler
  const handleApprove = (docId: string, userId: string) => {
    dispatch(verifycreator({ userid: userId, docid: docId })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setUserDocuments((prev) => prev.filter((doc) => doc._id !== docId));
      }
    });
  };

  // Reject handler
  const handleReject = (docId: string, userId: string) => {
    dispatch(rejectdocument({ userid: userId, docid: docId })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setUserDocuments((prev) => prev.filter((doc) => doc._id !== docId));
      }
    });
  };

  return (
    <div className="container mx-auto mt-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-6 font-bold text-center">Admin: Verify User Documents</h1>

      {/* Display loading state for documents */}
      {docStatus === "loading" && (
        <div className="flex flex-col items-center mt-8">
          <PacmanLoader color="#d49115" loading={true} size={70} />
          <p className="mt-2">Fetching documents...</p>
        </div>
      )}

      {/* Display error state for documents */}
      {docStatus === "failed" && (
        <p className="text-red-500 text-center">Failed to fetch documents.</p>
      )}

      {/* Display documents */}
      {docStatus === "succeeded" && userDocuments.length === 0 && (
        <p className="text-center">No documents found.</p>
      )}
      {docStatus === "succeeded" && userDocuments.length > 0 && (
        <div className="space-y-8">
          {userDocuments.map((doc: any) => (
            <div key={doc._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{doc.firstname} {doc.lastname}</h2>
                  <p className="text-sm text-gray-400">{doc.address || "N/A"}, {doc.country || "N/A"}</p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(doc.createdAt).toLocaleString() || "24-September-2025 08:00:43"}
                  </p>
                  <p className="text-xs text-gray-500">model id: {doc._id || "68d33a4ab6619662747534468"}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">Model Application</span>
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Status: {doc.verify ? "accepted" : "pending"}</span>
                </div>
              </div>

              {/* ID Photo Section */}
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="text-md font-medium mb-2">ID Photo</h3>
                {doc.idPhotofile?.idPhotofilelink ? (
                  <img
                    src={doc.idPhotofile.idPhotofilelink}
                    alt="ID Photo"
                    className="w-full h-64 object-cover rounded-lg bg-pink-200"
                  />
                ) : (
                  <div className="w-full h-64 bg-pink-200 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">No ID Photo Available</p>
                  </div>
                )}
              </div>

              {/* Selfie with ID Section */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2">Selfie with ID</h3>
                {doc.holdingIdPhotofile?.holdingIdPhotofilelink ? (
                  <img
                    src={doc.holdingIdPhotofile.holdingIdPhotofilelink}
                    alt="Selfie with ID"
                    className="w-full h-64 object-cover rounded-lg bg-pink-200"
                  />
                ) : (
                  <div className="w-full h-64 bg-pink-200 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">No Selfie with ID Available</p>
                  </div>
                )}
              </div>

              {/* Accept/Reject Buttons */}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}