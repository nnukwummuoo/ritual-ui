import React, { useState } from "react";
import type { ContentItem } from "@/types/collection";
import { MdDelete } from "react-icons/md";
import PacmanLoader from "react-spinners/RotateLoader";

const MyContentList: React.FC<ContentItem> = ({
  exclusiveid,
  name,
  id,
  exclusivelink,
  contenttype,
}) => {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Replace with your delete logic
  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000); // Mock delete
  };

  return (
    <div className="relative my-1">
      <div className="absolute top-2 right-2 z-10">
        <button
          className="text-white bg-slate-800 rounded-full p-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
          </svg>
        </button>
        {showMenu && (
          <div className="absolute top-10 right-0 bg-slate-800 rounded-md shadow-lg p-2">
            <button
              className="w-full text-left text-white font-bold py-1 px-2 hover:bg-slate-700 whitespace-nowrap"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Content
            </button>
          </div>
        )}
      </div>
      {loading && (
        <div className="w-full flex flex-col items-center">
          <PacmanLoader color="#d49115" loading={loading} size={10} />
        </div>
      )}
      <div
        className="bg-slate-800 rounded-lg overflow-hidden shadow-md cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {contenttype === "image" ? (
          <img src={exclusivelink} alt={name} className="w-full h-60 object-cover" />
        ) : (
          <video src={exclusivelink} controls className="w-full h-60 object-cover" />
        )}
        <div className="p-2">
          <p className="text-white font-semibold">{name}</p>
        </div>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div className="bg-[#080b14] p-4 rounded-lg">
            {contenttype === "image" ? (
              <img src={exclusivelink} alt={name} className="max-h-[70vh] mx-auto" />
            ) : (
              <video src={exclusivelink} controls className="max-h-[70vh] mx-auto" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContentList;