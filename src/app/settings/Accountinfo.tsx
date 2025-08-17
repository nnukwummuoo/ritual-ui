"use client"
import React, { useEffect, useRef, useState } from "react";
import Head from "../../components/Head";
import { useDispatch, useSelector } from "react-redux";
import { updateEdit, getEdit } from "@/store/comprofile";
import type { AppDispatch, RootState } from "@/store/store";

const AccountinfoPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const isUploading = useSelector((s: RootState) => s.comprofile.updateEdit_stats === "loading");

  // Optional: if you already store current photo URL somewhere, hydrate it here.
  // Example: const currentPhoto = useSelector((s: RootState) => s.comprofile.editData?.photoLink);
  // useEffect(() => setAvatarSrc(currentPhoto), [currentPhoto]);

  const openPicker = () => fileRef.current?.click();
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setAvatarSrc(blobUrl);

    if (userid && token) {
      dispatch(updateEdit({ userid, token, updatePhoto: file }))
        .unwrap()
        .then(() => dispatch(getEdit({ userid, token })))
        .catch(() => {/* optionally handle error */});
    }
  };

  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  return (
    <div className="sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto">
      
      <div className='w-full flex flex-col'>
      <Head heading="ACCOUNT INFO" />

      {/* Avatar Picker */}
      <div className="mt-6 mb-2 flex items-center gap-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={isUploading}
          className="rounded-full overflow-hidden ring-2 ring-slate-600 hover:ring-slate-400 transition"
          style={{ width: 96, height: 96 }}
          aria-label="Change profile photo"
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-300">
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4.4 0-8 2.3-8 5v3h16v-3c0-2.7-3.6-5-8-5z"/>
              </svg>
            </div>
          )}
        </button>
        <div>
          <p className="text-sm text-slate-300">Click the avatar to upload a new profile photo.</p>
          {isUploading && <p className="text-xs text-slate-400">Uploading…</p>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>

      <div className="w-full max-w-md space-y-6 mt-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="text"
            value="user@example.com"
            disabled
            className="w-full px-4 py-4 bg-inherit text-white border border-gray-600 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Joined</label>
          <input
            type="text"
            value="20/08/2024"
            disabled
            className="w-full px-4 py-4 bg-inherit text-white border border-gray-600 rounded-md"
          />
        </div>
      </div>

      {/* Logout Button */}
      <button className="mt-6 w-full max-w-md px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-500">
        Log out all devices and accounts
      </button>
      </div>
     
    </div>
  );
};

export default AccountinfoPage