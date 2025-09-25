"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useVerifyModels } from "@/hooks/useVerifyModels";
export default function ModelCard() {
  const { users, loading, error, approve, reject, formatDate, capitalizeName } =
    useVerifyModels();
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div />;

  return (
    <div className="min-h-screen mx-4 md:w-10/12 lg:w-9/12 xl:w-9/12 mb-32 md:mt-8">
      <div className="flex flex-col items-center w-full mt-12">
        <p className="jost text-[1.3em] text-white py-4 font-[500]">
          Verify new models
        </p>
        {loading && <p className="text-gray-400">Loading models...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && users.length === 0 && !error && (
          <p className="text-gray-400">No models to verify.</p>
        )}

        {users.map((user) => (
          <article
            key={user.userid}
            className="w-full sm:max-w-md md:max-w-lg bg-[#210F37] rounded-2xl shadow-lg p-4 md:p-6 ring-1 mx-auto ring-gray-100 mb-6">
            <header className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold leading-tight">
                  {capitalizeName(user.fullName)}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {user.city}, {user.country}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {formatDate(user.createdAt)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  model id:{user._id}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    Model Application
                  </span>
                  <div className="text-xs text-gray-400">
                    Status:{" "}
                    <span
                      className={
                        user.Model_Application_status === "pending"
                          ? "text-orange-400"
                          : "text-green-400"
                      }>
                      {user.Model_Application_status === "pending"
                        ? "pending"
                        : "accepted"}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="flex flex-col items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(user.idPhoto)}>
                <span className="text-xs text-gray-500">ID Photo</span>
                <div className="w-full h-52 sm:h-36 bg-white rounded-md overflow-hidden shadow-sm relative">
                  <Image
                    src={user.idPhoto}
                    alt="ID"
                    fill
                    placeholder="blur"
                    blurDataURL="/tiny_blur.jpg"
                    className="object-cover"
                  />
                </div>
              </div>

              <div
                className="flex flex-col items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(user.selfieWithId)}>
                <span className="text-xs text-gray-500">Selfie with ID</span>
                <div className="w-full h-52 sm:h-36 bg-white rounded-md overflow-hidden shadow-sm relative">
                  <Image
                    src={user.selfieWithId}
                    alt="Selfie with ID"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </section>

            <footer className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full justify-between sm:justify-start">
                {user.Model_Application_status === "pending" ? (
                  <>
                    <button
                      onClick={() => approve(user.userid)}
                      className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition">
                      Accept
                    </button>
                    <button
                      onClick={() => reject(user.userid)}
                      className="px-3 py-2 rounded-md border border-gray-200 text-sm hover:bg-gray-50 transition">
                      Reject
                    </button>
                  </>
                ) : user.Model_Application_status === "accepted" ? (
                  <span className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">
                    Approved
                  </span>
                ) : (
                  <span className="px-3 py-2 rounded-md border bg-red-600 border-gray-200 text-gray-400 text-sm">
                    Decliend
                  </span>
                )}
              </div>
            </footer>
          </article>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}>
          <div className="relative w-[90%] h-[80%] md:w-[60%] md:h-[80%]">
            <Image
              src={selectedImage}
              alt="Full View"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
