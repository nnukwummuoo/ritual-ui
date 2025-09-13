"use client";

import React, { useState } from "react";
import Image from "next/image";
// import { useRouter } from 'next/navigation';
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
  // const router = useRouter();
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // const token = useSelector((state: RootState) => state.register.refreshtoken);
  const userID = useSelector((state: RootState) => state.register.userID);
   const login = useSelector((state: RootState) => state.register.logedin);

  const pay = async () => {
  if (!login) {
    toast.error("Please log in to purchase gold", { autoClose: 2000 });
    console.log(login)
    // Optionally: router.push('/login'); // Uncomment if using next/navigation
    return;
  }
  if (!currencyValue) {
    toast.error("Please select a gold pack", { autoClose: 2000 });
    return;
  }
    try {
      setLoading(true);
  const selectedGold = golds.find((gold) => Number(gold.value) === currencyValue);
      // ✅ Fix: Explicitly convert to number to handle string | undefined | 0
  const amount = Number((selectedGold?.amount || "0").replace(/[^0-9.]/g, ""));
      
      // Optional: Validate the amount after conversion
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid gold pack amount", { autoClose: 2000 });
        return;
      }

      const res = await getPaymentLink(
        amount,  // Now guaranteed to be number
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
      console.error("Payment error details:", error); // Added for debugging logout issues
      toast.error("An error occurred during payment", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // Table data from golds array
  const tableRows = golds.map((gold) => (
    <tr key={gold.value} className="border-b border-[#323544] last:border-b-0">
      <td className="py-3 px-3 text-center text-base border-r border-[#323544] whitespace-nowrap">{gold.value}</td>
      <td className="py-3 px-3 text-center text-base border-r border-[#323544] whitespace-nowrap">{gold.amount}</td>
      <td className="py-3 px-3 text-center text-base border-r border-[#323544] whitespace-nowrap">{gold.bonus || "-"}</td>
      <td className="py-3 px-3 text-center text-base whitespace-nowrap">
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
    <div
      className="min-h-screen w-screen flex items-center justify-start px-6"
      style={{
        background: "linear-gradient(180deg, #15182a 0%, #161928 100%)",
        minHeight: "100vh",
        width: "100vw",
        paddingBottom: "40px",
      }}
    >
      <div className="flex flex-col items-center w-full max-w-md mx-0 ml-16">
        {/* Gold Shop Avatar */}
        <div>
          <Image
            src="icons/m-logo.png"
            alt="Gold Shop Logo"
            width={77}
            height={77}
            className="object-contain"
          />
        </div>
        {/* Title */}
        <h1 className="mt-6 text-white text-3xl font-bold text-center">Gold Shop</h1>
        {/* Subtitle */}
        <div className="flex items-center mt-2 gap-2">
          <span
            className="rounded-full flex items-center justify-center"
            style={{
              background: "#FFD682",
              width: 28,
              height: 28,
            }}
          >
            <span className="text-[#1A1C2C] text-lg font-bold">$</span>
          </span>
          <span className="text-[#b6b7c7] text-base font-medium whitespace-nowrap">
            Buy Gold with USDT <span className="text-[#636583] font-normal">(BEP20)</span>
          </span>
        </div>

        {/* Table Card */}
        <div
          className="w-full bg-[#191c2f] rounded-2xl shadow-md p-0 mb-8 mt-10 overflow-hidden"
          style={{ border: "1px solid #23243c" }}
        >
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-[#323544]">
                <th className="py-3 px-3 font-semibold text-base text-center border-r border-[#323544] whitespace-nowrap">Pack</th>
                <th className="py-3 px-3 font-semibold text-base text-center border-r border-[#323544] whitespace-nowrap">Price</th>
                <th className="py-3 px-3 font-semibold text-base text-center border-r border-[#323544] whitespace-nowrap">Bonus</th>
                <th className="py-3 px-3 font-semibold text-base text-center whitespace-nowrap">Tag</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {/* Gold Pack Select & Pay */}
        <div className="flex flex-col items-center gap-6 w-full">
          <select
            required
            className="block bg-[#23243c] text-white rounded-lg px-4 py-3 w-full appearance-none border border-[#23243c] focus:outline-none focus:ring-2 focus:ring-[#FFD682] font-medium"
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
            className={`w-full h-12 rounded-lg font-bold text-lg ${
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