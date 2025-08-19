"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
// import { loadStripe } from "@stripe/stripe-js";

import styles from "../../navs/Navs.module.css"; // use CSS module in Next.js
import cardIcon from "../../icons/cardIcon.svg";
import goldIcon from "../../icons/icons8.png";
import { golds } from "@/data/intresttypes";
// import { PAY_API } from "../../data/intresttypes";
// import { sucess_url, fail_url } from "@/api/config";
import { getPaymentLink } from "@/api/payment";

interface RootState {
  register: {
    refreshtoken: string;
    userID: string;
    logedin: boolean;
  };
}

const Topup: React.FC = () => {
  const router = useRouter();
  const [currencyValue, setCurrencyValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const userid = useSelector((state: RootState) => state.register.userID);
  const login = useSelector((state: RootState) => state.register.logedin);

//   useEffect(() => {
//     if (!login) {
//       router.push("/");
//     }
//   }, [login, router]);

  const showItems = () =>
    golds.map((value) => (
      <option key={value.value} value={value.value}>
        {value.amount} – {value.bonus}
      </option>
    ));

  const pay = async () => {
    if (!currencyValue) {
      toast.error("Enter amount", { autoClose: 2000 });
      return;
    }

    try {
      setLoading(true);
      const res = await getPaymentLink(currencyValue);
      if (res?.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto bg-gray-900 flex flex-col items-center min-h-screen">
      <div className="w-full md:px-8 h-full md:mt-0 mt-8">
        <div className="w-full h-full flex flex-col items-center justify-center pl-1 pr-1 pt-4">
          <div className="w-full rounded-lg flex flex-col justify-center pl-2 pr-2">
            <p className="text-center text-slate-600 mb-5 font-bold">
              Choose Gold Amount
            </p>

            <div className="w-full flex justify-center bg-[#292d31] h-fit mb-12 rounded-lg gap-2">
              <Image alt="cardIcon" src={cardIcon} className="ml-2" />
              <select required className="payment-list bg-[#292d31] w-full">
                <option value="" disabled hidden>
                  Select Payment Method
                </option>
                <option>Credit/Debit Card (Visa/Mastercard/Discover)</option>
              </select>
            </div>

            <div className="w-full flex justify-center bg-[#292d31] h-fit mb-12 rounded-lg">
              <Image
                alt="goldIcon"
                src={goldIcon}
                className="ml-2 w-7 h-7 object-cover mt-3"
              />
              <select
                required
                className="payment-list bg-[#292d31]"
                onChange={(e) => setCurrencyValue(Number(e.currentTarget.value))}
              >
                <option value="" disabled hidden>
                  Choose Gold Amount
                </option>
                {showItems()}
              </select>
            </div>

            <div className="w-full flex justify-center">
              <button
                className={`${
                  loading ? "bg-gray-300" : "bg-orange-500"
                } h-12 rounded-lg pl-2 pr-2 hover:bg-orange-400 active:bg-orange-300`}
                onClick={pay}
                disabled={loading}
              >
                <p className="text-white font-bold text-center">
                  Continue To Payment Page
                </p>
              </button>
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-5 text-center">
            In order to serve you better, please take a minute to give us{" "}
            <button className="text-orange-500 hover:text-orange-400 active:text-orange-300">
              feedback
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Topup;
