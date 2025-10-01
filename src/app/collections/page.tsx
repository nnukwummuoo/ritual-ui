"use client";
import React, { useEffect, useState } from "react";
import { MdShoppingBag, MdFavorite } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getcollection, deletecollection } from "@/store/profile";
import { remove_Crush } from "@/store/creatorSlice";

interface ImageCardProps {
  src: string;
  status: string;
  type: string;
  name: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, status, type, name }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSrc = Boolean(src);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-800">
      {!isLoaded && hasSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FaSpinner className="animate-spin text-white text-2xl" />
        </div>
      )}
      {hasSrc ? (
        <img
          src={src}
          alt="Preview"
          className={`w-full h-72 object-cover sm:rounded-xl transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div className="w-full h-72 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-300">
          No image
        </div>
      )}
      {(isLoaded || !hasSrc) && (
        <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
          <BsThreeDotsVertical />
        </button>
      )}
      {(isLoaded || !hasSrc) && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${
              status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="text-white text-sm">{type}</span>
          <span className="text-white text-sm">{name}</span>
        </div>
      )}
    </div>
  );
};

type CollectionItem = Record<string, any>;
const Content: React.FC<{
  items: CollectionItem[];
  onDelete: (id: string) => void;
}> = ({ items, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {items?.length ? (
        items.map((it: any, idx: number) => {
          const src = it.thumbnaillink || it.thumbnail || it.image || it.photolink || it.src || "";
          const name = it.contentname || it.name || it.title || "Content";
          const status = it.status || "active";
          const type = it.content_type || it.type || "premium";
          const id = it.id || it._id || it.contentid || it.contentId || String(idx);
          return (
            <div key={id} className="relative">
              <ImageCard src={src} status={status} type={type} name={name} />
              <div className="absolute top-2 left-2">
                <button
                  onClick={() => onDelete(String(id))}
                  className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center text-gray-400 py-10">No purchased content yet.</div>
      )}
    </div>
  );
};

const Crush: React.FC<{
  items: CollectionItem[];
  onRemove: (creatorid: string) => void;
}> = ({ items, onRemove }) => {
  return (
    <div className="mt-4">
      <h2 className="text-white text-center mb-4 text-lg font-semibold">
        List Of My Crush Creators
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items?.length ? (
          items.map((it: any, idx: number) => {
            const src = it.photolink || it.photo || it.image || it.src || "";
            const name = it.creatorname || it.name || it.nickname || "Creator";
            const status = it.status || "active";
            const type = it.type || "standard";
            const creatorid = it.creatorid || it.creatorId || it.id || it._id || String(idx);
            return (
              <div key={String(creatorid)} className="relative">
                <ImageCard src={src} status={status} type={type} name={name} />
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => onRemove(String(creatorid))}
                    className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-400 py-10">No crush creators yet.</div>
        )}
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"content" | "crush">("content");
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const collectionstats = useSelector((s: RootState) => s.profile.collectionstats);
  const collection_error = useSelector((s: RootState) => s.profile.fllowmsg as string);
  const listofcontent = useSelector((s: RootState) => s.profile.listofcontent as any[]);
  const listofcrush = useSelector((s: RootState) => s.profile.listofcrush as any[]);

  // Fetch collections when user is known
  useEffect(() => {
    if (userid) {
      dispatch(getcollection({ userid, token }));
    }
  }, [dispatch, userid, token]);

  const getBtnStyle = (tab: "content" | "crush") =>
    activeTab === tab
      ? { backgroundColor: "#292d31", borderColor: "#d1d5db" }
      : { backgroundColor: "#18181b", borderColor: "#334155" };

  return (
    <div
      className="h-screen overflow-y-scroll bg-[#0e0f2a] text-white"
      style={{ scrollbarGutter: "stable both-edges" }}
    >
      <div className="w-full max-w-2xl mx-auto pt-16 px-4">
        <div className="w-full flex flex-col text-gray-400">
          {/* Sticky Tab Buttons */}
          <div className="sticky z-8 top-0 bg-[#0e0f2a] pb-4">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                className="flex items-center justify-center gap-2 border-2 transition-all duration-200 ease-in-out text-white py-3 px-4 rounded-lg font-medium w-full shadow-sm hover:shadow-md text-sm sm:text-base"
                style={getBtnStyle("content")}
                onClick={() => setActiveTab("content")}
              >
                <MdShoppingBag className="text-xl" />
                Purchased Content
              </button>
              <button
                className="flex items-center justify-center gap-2 border-2 transition-all duration-200 ease-in-out text-white py-3 px-4 rounded-lg font-medium w-full shadow-sm hover:shadow-md text-sm sm:text-base"
                style={getBtnStyle("crush")}
                onClick={() => setActiveTab("crush")}
              >
                <MdFavorite className="text-xl" />
                Crush List
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-6">
            {/* Loading */}
            {collectionstats === "loading" && (
              <div className="flex items-center justify-center py-10 text-gray-300">
                <FaSpinner className="animate-spin mr-2" /> Loading collections...
              </div>
            )}

            {/* Error Banner */}
            {collectionstats === "failed" && (
              <div className="mb-3 rounded border border-red-500 bg-red-900/30 text-red-300 p-3 text-sm">
                {collection_error || "Failed to load collections."}
              </div>
            )}

            {/* Data */}
            {collectionstats !== "loading" && (
              activeTab === "content" ? (
                <Content
                  items={listofcontent || []}
                  onDelete={async (id) => {
                    try {
                      await dispatch(deletecollection({ token, id })).unwrap();
                      await dispatch(getcollection({ userid, token }));
                    } catch (e) {
                      // noop: error banner above will show via fllowmsg/collectionstats if needed
                    }
                  }}
                />
              ) : (
                <Crush
                  items={listofcrush || []}
                  onRemove={async (creatorid) => {
                    try {
                      await dispatch(remove_Crush({ userid, token, creatorid })).unwrap();
                      await dispatch(getcollection({ userid, token }));
                    } catch (e) {
                      // noop
                    }
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
