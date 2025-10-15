"use client";

import React, { useState } from "react";
import Link from "next/link";

interface requestInfoProps {
  setrequestclick: (value: boolean) => void;
  amount: number | string;
  setsuccess: (value: boolean) => void;
  type?: string;
}

export const Requestinfo: React.FC<requestInfoProps> = ({
  setrequestclick,
  amount,
  setsuccess,
  type,
}) => {
  const [agreed, setAgreed] = useState(false);

  const chooseinfo = () => {
    const normalizedType = type?.toLowerCase().trim().replace(/\s+/g, " ");

    if (normalizedType) {
      if (normalizedType === "fan meet" || normalizedType === "fan date") {
        return "will be deducted from your balance, to be allocated to a pending status for creator's transport fare. These funds will be disbursed to the creator upon your confirmation of task completion";
      }
      if (normalizedType === "private show") {
        return "will be deducted from your balance per minute during the Fan call";
      }
    }

    console.log("Returning fallback message for type:", normalizedType);
    return "will be deducted from your balance for the selected service.";
  };

  return (
    <fieldset
      className="z-50 w-48 p-5 mx-auto bg-gray-800 rounded-lg h-fit"
      style={{ width: "95%", maxWidth: 500 }}
    >
      <p className="pt-2 text-sm text-center text-white">
        The amount of{" "}
        <span className="font-semibold text-yellow-500">
          {parseFloat(amount as string)}
        </span>{" "}
        golds {chooseinfo()}
      </p>

      {/* Agreement checkbox */}
      <div className="flex items-start gap-2 mt-4 text-sm text-white">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="terms" className="cursor-pointer">
          By continuing, you confirm that you have read and agree to the terms of
          this agreement
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          disabled={!agreed}
          className={`mr-1 text-sm p-2 ml-1 mt-3 rounded-lg w-1/2 shadow-2xl ${
            agreed ? "bg-yellow-600" : "bg-yellow-900 cursor-not-allowed"
          }`}
          onClick={() => {
            setsuccess(true);
            setrequestclick(false);
          }}
        >
          Continue
        </button>

        <button
          className="w-1/2 p-2 mt-3 ml-1 mr-1 text-sm bg-red-500 rounded-lg shadow-2xl"
          onClick={() => setrequestclick(false)}
        >
          Cancel
        </button>
      </div>

      {/* Example usage of Next.js Link if needed */}
      <div className="mt-3 text-center">
        <Link href="/terms" className="text-xs text-blue-400 underline">
          View Terms & Conditions
        </Link>
      </div>
    </fieldset>
  );
};
