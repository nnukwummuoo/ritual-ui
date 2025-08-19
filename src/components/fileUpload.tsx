import React, { useState } from "react";

type Props = {
  label: string;
  name: string;
  icon: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  openAsModal?: boolean;
  onOpenModal?: () => void;
};

const FileInput = ({ label, name, icon, onChange, accept, openAsModal, onOpenModal }: Props) => {
  const [fileName, setFileName] = useState("Click to post image");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileName(file.name);
    }
    if (onChange) onChange(e);
  };

  return (
    <div className="">
      <label htmlFor={name} className="block text-sm font-semibold text-white mb-2">
        {label}
      </label>
      <label
        htmlFor={name}
        className="flex items-center justify-between gap-4 bg-[#0c0f27] text-gray-300 border border-[#1a1e3f] rounded-xl px-4 py-3 cursor-pointer transition-all duration-300 hover:border-orange-500 hover:shadow-md hover:bg-[#0c0f27]/60"
        onClick={(e) => {
          if (openAsModal && onOpenModal) {
            e.preventDefault();
            onOpenModal();
          }
        }}
      > 
        <div className="flex items-center gap-3 ">

        <div className="text-orange-500 ">{icon}</div>
        <p className="text-sm truncate ">{fileName}</p>
        </div>
        <input
          type="file"
          id={name}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default FileInput;

