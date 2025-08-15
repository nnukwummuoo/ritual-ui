"use client";
import React, { useState, useEffect } from "react";
import PacmanLoader from "react-spinners/RingLoader";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
// Import your redux actions if available
// import { get_monthly_history } from "../../features/profile/profile";

import { get_monthly_history } from '@/store/goldstatSlice';
import { RootState } from '@/store/store';
import { useAuth } from '@/lib/context/auth-context';

// Remove dummyMonthsData. We'll use Redux state instead.

interface Earning {
  id: number;
  date: string;
  amount: number;
  type: string;
  desc: string;
}

interface MonthData {
  month: string;
  total: number;
  data: {
    year: number;
    earning: Earning[];
  };
}

const Earnings: React.FC = () => {
  const dispatch = useDispatch();
  const { session } = useAuth();
  const { earnings, loading, error } = useSelector((state: RootState) => state.goldstat);
  const [detailClick, setDetailClick] = useState(false);
  const [monthClick, setMonthClick] = useState("");
  const [earnsList, setEarnsList] = useState<any[]>([]);
  const [color] = useState("#FFFFFF");

  useEffect(() => {
    if (session?._id && session?.token) {
      dispatch(get_monthly_history({ userId: session._id, token: session.token }) as any);
    }
  }, [dispatch, session]);

  const handleMonthClick = (month: string, earning: any[]) => {
    setMonthClick(month);
    setEarnsList(earning);
    setDetailClick(true);
  };


  const displayMonth = () => {
    if (!earnings || earnings.length === 0) return <p className="text-center text-gray-400">No earnings data</p>;
    return earnings.map((value) => (
      <div className="w-full h-full mb-3" key={value.month}>
        <div className="flex justify-between">
          <div className="flex">
            <p className="text-white font-bold">{value.month}</p>
            <p className="text-white font-bold ml-3">{value.data.year}</p>
          </div>
          <div className="flex">
            <p className="text-white font-semibold">US${value.total}</p>
            <button
              onClick={() => {
                setDetailClick(true);
                setMonthClick(value.month);
                setEarnsList(value.data.earning);
              }}
            >
              <img
                alt="detailsIcon"
                src="/icons/icons8-detail.png"
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
        <hr className="h-1 bg-slate-500 w-full rounded-md" />
      </div>
    ));
  };

  const listOfMonthTrans = () => {
    if (earnsList.length <= 0) {
      return (
        <div className="w-full h-full flex justify-center items-center ">
          <p className="text-yellow-500 ">
            You have 0 transaction on {monthClick}
          </p>
        </div>
      );
    }
    const listRev = [...earnsList].reverse();
    return listRev.map((value) => monthTransactions(value));
  };

  const showDate = (time: string) => {
    const date = format(new Date(time), "MM/dd/yyyy 'at' h:mm a");
    return date;
  };

  const monthTransactions = (value: Earning) => {
    return (
      <div className="flex flex-col w-full bg-blue-500 pt-1 pb-1 mb-2 rounded-md" key={value.id}>
        <div className="flex w-full pl-2 pr-2">
          <img
            alt="dateIcon"
            src="/icons/icons8-date.png"
            className="w-5 h-5 object-cover"
          />
          <p className="ml-2 text-xs ">{showDate(value.date)}</p>
        </div>
        <div className="flex w-full pl-2 pr-2 mt-1">
          <img
            alt="detailIcon"
            src="/icons/icons8-detail.png"
            className="w-5 h-5 object-cover"
          />
          <p className="ml-2 text-xs ">{value.desc}</p>
        </div>
        <div className="flex w-full pl-2 pr-2 mt-1">
          <img
            alt="incomeIcon"
            src="/icons/icons8-income.png"
            className="w-5 h-5 object-cover"
          />
          <p className="ml-2 text-xs font-bold text-green-600 ">
            +${value.amount}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-11/12 lg:w-10/12 xl:w-9/12 mx-auto min-h-screen">
      <div
        className="w-full md:w-3/4 flex flex-col mx-auto md:ml-24 lg:ml-32 xl:ml-48"
        onClick={() => {}}
      >
        <div className="w-full h-full pt-12">
          <div className="w-full flex flex-col items-center mt-1">
            <p className="text-xl font-bold text-white">
              Transaction History
            </p>
            <p className="text-sm text-slate-300">Estimated - Last 12 months</p>
          </div>
          {loading && (
            <div className="flex w-full mt-16 flex-col items-center">
              <PacmanLoader
                color={color}
                loading={loading}
                size={35}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="text-sm text-white">Fetching history...</p>
            </div>
          )}
          {!loading && (
            <div className="flex flex-col h-full w-full pl-4 pr-4 mt-5">
              {displayMonth()}
              {detailClick && (
                <div
                  className="bg-slate-300 left-5 right-5 h-40 mb-3 mt-2  pr-2 pl-2 rounded-md z-20 top-1/4 absolute shadow shadow-black note"
                >
                  <div className="flex flex-col w-full h-full relative">
                    <div className="flex w-full">
                      <p className="text-center w-2/3 ml-7 text-sm font-bold">
                        {`${monthClick}`} transactions
                      </p>
                      <div className="w-1/3 flex justify-end">
                        <button onClick={() => setDetailClick(false)}>
                          <img alt="closeIcon" src="/icons/closeIcon.svg" />
                        </button>
                      </div>
                    </div>
                    <div className="flex w-full h-full overflow-auto flex-col">
                      {listOfMonthTrans()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;

