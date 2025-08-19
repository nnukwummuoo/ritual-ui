"use client"; // Required if this is a Client Component in Next.js 13+

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createpost } from "@/store/post";
import { FaPlus } from "react-icons/fa";

// Import local assets from public folder or keep static imports
import person2 from "../../icons/icons8-profile_Icon.png";
import backicon from "../../icons/backIcon.svg";
import { AppDispatch } from "@/store/store";

const PostImage = () => {
  const photo = useSelector((state: any) => state.comprofile.profilephoto);
  const token = useSelector((state: any) => state.register.refreshtoken);
  const firstname = useSelector((state: any) => state.profile.firstname);
  const lastname = useSelector((state: any) => state.profile.lastname);
  const nickname = useSelector((state: any) => state.profile.nickname);
  const userid = useSelector((state: any) => state.register.userID);
  const poststatus = useSelector((state: any) => state.post.poststatus);
  const message = useSelector((state: any) => state.post.message);

  const dispatch = useDispatch<AppDispatch>();

  const [content, setContent] = useState("");
  const [filelink, setFilelink] = useState<File | null>(null);
  const [imgsrc, setImgsrc] = useState<string | undefined>();
  const [showimage, setShowimage] = useState(false);
  const [propics, setPropics] = useState<any>(person2);
  const [username, setUsername] = useState("");

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (photo) setPropics(photo);
    setUsername(nickname || `${firstname} ${lastname}`);
  }, [photo, nickname, firstname, lastname]);

  const postcontent = async () => {
    if (!filelink) {
      toast.error("Please choose a photo to post", { autoClose: false });
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response: any = await dispatch(
        createpost({
          userid,
          filelink,
          token,
          content,
          posttype: "image",
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        })
      );

      if (response.payload.ok) {
        toast.dismiss();
        setUploadProgress(0);
        toast.success(response.payload.message, { autoClose: 1000 });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md p-4 mx-auto mt-10 text-white bg-gray-900 shadow-lg rounded-2xl">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={() => toast.dismiss()} className="mr-2">
          <Image alt="back icon" src={backicon} className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold">Post</h2>
      </div>

      {/* Profile Info (hidden) */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          alt="profile"
          src={propics}
          width={40}
          height={40}
          className="object-cover border rounded-full border-slate-600"
        />
        <span className="text-sm font-medium text-gray-300">{username}</span>
      </div>

      {/* Upload Section */}
      <div
        className="flex flex-col items-center justify-center p-6 mt-2 transition border-2 border-gray-400 border-dashed cursor-pointer rounded-xl hover:bg-gray-800"
        onClick={() =>
          !isUploading && document.getElementById("image-upload")?.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (isUploading) return;

          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) {
            setFilelink(file);
            setImgsrc(URL.createObjectURL(file));
            setShowimage(true);
          } else {
            toast.error("Only image files are allowed");
          }
        }}
      >
        <FaPlus className="w-10 h-10 mb-2 text-slate-300 opacity-70" />
        <p className="text-slate-300">
          {isUploading ? "Uploading..." : "Click or drag an image to upload"}
        </p>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFilelink(file);
              setImgsrc(URL.createObjectURL(file));
              setShowimage(true);
            }
          }}
        />
      </div>

      {/* Preview */}
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          height: 250,
          border: "1px solid #222",
          borderRadius: 15,
          marginBottom: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="mt-3 border-slate-600"
      >
        {showimage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgsrc}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <p className="text-slate-300">Preview Upload</p>
        )}
      </div>

      {/* Content */}
      <textarea
        className="w-full h-28 p-2 rounded-lg bg-[#2a2a2a] text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
        placeholder="What's on your mind?"
        value={content}
        disabled={isUploading}
        onInput={(e) => setContent(e.currentTarget.value)}
      ></textarea>

      {/* Button */}
      <button
        onClick={postcontent}
        disabled={isUploading}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-3
          transition-all duration-300 shadow-md 
          ${
            isUploading
              ? "bg-gradient-to-r from-purple-800 to-purple-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-400 hover:from-orange-500 hover:to-yellow-400"
          }
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full h-3 rounded-full bg-gray-300 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white animate-pulse"
                style={{
                  width: `${uploadProgress}%`,
                  transition: "width 0.4s ease-in-out",
                }}
              ></div>
            </div>
            <span className="mt-1 text-xs tracking-wide animate-pulse">
              Uploading... {uploadProgress}%
            </span>
          </div>
        ) : (
          <span className="tracking-wide">🎬 Post</span>
        )}
      </button>
    </div>
  );
};

export default PostImage;
