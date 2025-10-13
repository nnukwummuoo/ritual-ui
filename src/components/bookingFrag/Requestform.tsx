/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {addMonths} from "date-fns/addMonths";
import {format} from "date-fns/format";
import RotateLoader from "react-spinners/RotateLoader";
import { useSelector, useDispatch } from "react-redux";
import { bookAcreator, bookmdel, resetstat } from "@/store/booking";
import { RootState, AppDispatch } from "@/store/store"; // adjust path based on your store setup
import { toast } from "material-react-toastify";
import { useUserId } from "@/lib/hooks/useUserId";

interface RequestFormProps {
  setsuccess: (value: boolean) => void;
  setrequested: (value: boolean) => void;
  creator_portfolio_id: string;
  type: string;
  toast: {
    error: (msg: string, options?: { autoClose?: number }) => void;
  };
  price: number;
  creator: any;
}

export const Requestform: React.FC<RequestFormProps> = ({
  setsuccess,
  setrequested,
  creator_portfolio_id,
  type,
  price,
  creator
}) => {
  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");

  const userid = useUserId();
  const token = useSelector((state: any) => state.register.refreshtoken);
  const bookingstats = useSelector((state: RootState) => state.booking.bookingstats);
  const bookingmessage = useSelector((state: RootState) => state.booking.bookingmessage);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (bookingstats === "succeeded") {
      setsuccess(false);
      setrequested(true);
      setLoading(false);
      // dispatch(resetstat());
    }

    if (bookingstats === "failed") {
      setsuccess(false);
      setLoading(false);
      // dispatch(resetstat());
      toast.error(
        typeof bookingmessage === "string"
          ? bookingmessage
          : "Please check internet connection",
        { autoClose: 2000 }
      );
    }
  }, [bookingstats, bookingmessage, dispatch, setrequested, setsuccess, toast]);

  // Set max date to 3 months from today
  const maxDate = format(addMonths(new Date(), 3), "yyyy-MM-dd");

  const checkInput = async () => {
    console.log('Form data:', { date, time, place });
    
    if (!time) {
      toast.error("Input time", { autoClose: 2000 });
      return;
    }
    if (!date) {
      toast.error("Input date", { autoClose: 2000 });
      return;
    }
    if (!place) {
      toast.error("Input venue", { autoClose: 2000 });
      return;
    }

    if (bookingstats !== "loading") {
      setLoading(true);
      const tst=toast.loading("Your request is being processed")
      try {
        console.log('Sending booking request with date:', date);
        const res = await bookAcreator({
          place,
          time,
          date,
          userid: userid,
          creator_portfolio_id: creator.hostid,
          type: creator.hosttype,
          price: creator.price
        });
        const serviceType = creator.hosttype || "Fan meet";
        toast.success(`Your ${serviceType} request has been submitted and sent to ${creator?.name || "The creator"}`)
        setsuccess(true)
        setrequested(true)
      } catch (err) {
        toast.error(""+err)
      } finally {
        toast.dismiss(tst);
        setLoading(false)
      }
    }
  };

  return (
    <div className="w-[95%] max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-lg z-50">
      <p className="text-center text-sm font-semibold text-white underline underline-offset-4">
        Please Enter Request Details
      </p>

      <fieldset className="mt-6 space-y-4">
        {/* Date input */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white w-24">Enter Date</label>
          <input
            type="date"
            className="flex-1 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            min={new Date().toISOString().split("T")[0]}
            max={maxDate}
            value={date}
            onChange={(e) => {
              console.log('Date selected:', e.target.value);
              setDate(e.target.value);
            }}
            required
          />
        </div>

        {/* Time input */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white w-24">Enter Time</label>
          <input
            type="time"
            className="flex-1 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Venue input */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white w-24">Input Venue</label>
          <input
            type="text"
            className="flex-1 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm px-4 py-2 rounded-md shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
              checkInput();
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Done"}
          </button>
        </div>

        {/* Loader */}
        <div className="flex justify-center pt-4">
          <RotateLoader
            color={color}
            loading={loading}
            size={12}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </fieldset>
    </div>
  );
};
