"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { toast } from "material-react-toastify";
import { golds } from "@/data/intresttypes";
import { getPaymentLink } from "@/api/payment";

interface RootState {
  register: {
    refreshtoken: string;
    userID: string;
    logedin: boolean;
  };
}

// Icons for tags
const tagIcons: Record<string, React.ReactNode> = {
  "Casual Fan": null,
  "Hot Choice": <span role="img" aria-label="hot">🔥</span>,
  "Most Popular": <span role="img" aria-label="star">⭐</span>,
  "Fan Favorite": <span role="img" aria-label="heart">💖</span>,
  "Best Value": <span role="img" aria-label="key">🔑</span>,
};

const Topup: React.FC = () => {
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const userID = useSelector((state: RootState) => state.register.userID);
  const login = useSelector((state: RootState) => state.register.logedin);

  const pay = async () => {
    if (!login) {
      toast.error("Please log in to purchase gold", { autoClose: 2000 });
      return;
    }
    if (!currencyValue) {
      toast.error("Please select a gold pack", { autoClose: 2000 });
      return;
    }
    try {
      setLoading(true);
      const selectedGold = golds.find((gold) => Number(gold.value) === currencyValue);
      const amount = Number((selectedGold?.amount || "0").replace(/[^0-9.]/g, ""));
      
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid gold pack amount", { autoClose: 2000 });
        return;
      }

      const res = await getPaymentLink(
        amount,
        userID,
        "usdtbep20",
        `Gold Pack Purchase: ${currencyValue} Gold`
      );

      if (res?.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
      } else {
        toast.error(res.message || "Failed to create payment", { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Payment error details:", error);
      toast.error("An error occurred during payment", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // Table data from golds array
  const tableRows = golds.map((gold) => (
    <tr key={gold.value} className="border-b border-[#323544] last:border-b-0">
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">{gold.value}</td>
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">{gold.amount}</td>
      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">{gold.bonus || "-"}</td>
      <td className="py-2 px-2 text-center text-sm sm:text-base whitespace-nowrap">
        {gold.tag ? (
          <span className="flex items-center gap-1 justify-center whitespace-nowrap">
            {tagIcons[gold.tag] || null}
            {gold.tag}
          </span>
        ) : "-"}
      </td>
    </tr>
  ));

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        {/* Gold Shop Avatar */}
        <div>
          <Image
            src="icons/m-logo.png"
            alt="Gold Shop Logo"
            width={60}
            height={60}
            className="object-contain sm:w-[77px] sm:h-[77px]"
          />
        </div>
        {/* Title */}
        <h1 className="mt-2 sm:mt-4 text-white text-2xl sm:text-3xl font-bold text-center">Gold Shop</h1>
        {/* Subtitle */}
        <div className="flex items-center mt-4 gap-2">
          <span
            className="rounded-full flex items-center justify-center"
            style={{
              background: "#FFD682",
              width: 24,
              height: 24,
            }}
          >
            <span className="text-[#1A1C2C] text-base sm:text-lg font-bold">$</span>
          </span>
          <span className="text-[#b6b7c7] text-sm sm:text-base font-medium whitespace-nowrap">
            Buy Gold with USDT <span className="text-[#636583] font-normal">(BEP20)</span>
          </span>
        </div>

        {/* Table Card */}
        <div
          className="w-full bg-[#191c2f] rounded-2xl shadow-md p-0 mb-6 mt-4 sm:mt-6 overflow-x-auto"
          style={{ border: "1px solid #23243c" }}
        >
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-[#323544]">
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Pack</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Price</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">Bonus</th>
                <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center whitespace-nowrap">Tag</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {/* Gold Pack Select & Pay */}
        <div className="flex flex-col items-center gap-4 w-full">
          <select
            required
            className="block bg-[#23243c] text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full appearance-none border border-[#23243c] focus:outline-none focus:ring-2 focus:ring-[#FFD682] font-medium text-sm sm:text-base"
            value={currencyValue || ""}
            onChange={(e) => setCurrencyValue(Number(e.target.value))}
          >
            <option value="" disabled>
              Choose Gold Pack
            </option>
            {golds.map((value) => (
              <option key={value.value} value={value.value}>
                {value.value} / ${value.amount}{value.bonus ? ` / +${value.bonus}` : ""}
              </option>
            ))}
          </select>
          <button
            className={`w-full h-10 sm:h-12 rounded-lg font-bold text-base sm:text-lg ${
              loading
                ? "bg-[#FFD682]/60 text-[#b6b7c7] cursor-not-allowed"
                : "bg-[#FFD682] text-[#15182a] hover:bg-[#ffe7ac] active:bg-[#ffd682]"
            } shadow transition-all`}
            onClick={pay}
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue To Payment Page"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topup;