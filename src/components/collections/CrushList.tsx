import React, { useState } from "react";
import type { CrushItem } from "@/types/collection";

const CrushList: React.FC<CrushItem> = ({
  photolink,
  name,
  id,
  userid,
  hosttype,
  creatorid,
  location,
  online,
}) => {
  const [buttonPressed, setButtonPressed] = useState(false);

  return (
    <div
      className="bg-slate-300 p-1 w-full rounded-lg"
      onMouseDown={() => {
        setTimeout(() => setButtonPressed(true), 1300);
      }}
      onMouseUp={() => setButtonPressed(false)}
      onTouchStart={() => {
        setTimeout(() => setButtonPressed(true), 1300);
      }}
      onTouchEnd={() => setButtonPressed(false)}
    >
      <div className="flex items-center gap-2">
        <img
          src={photolink}
          alt={name}
          className="w-14 h-14 rounded-full object-cover border-2 border-white"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{name}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                online ? "bg-green-500" : "bg-gray-400"
              }`}
              title={online ? "Online" : "Offline"}
            ></span>
          </div>
          <span className="text-xs text-gray-600">{location}</span>
        </div>
      </div>
    </div>
  );
};

export default CrushList;