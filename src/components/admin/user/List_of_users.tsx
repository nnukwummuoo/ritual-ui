"use client";

import React, { useState, useEffect } from "react";
import profileIcon from "@/icons/icons8-profile_Icon.png";
import femaleIcon from "@/icons/femaleIcon.svg";
import maleIcon from "@/icons/maleIcon.svg";
import optionIcon from "@/icons/navmenu.svg";
import deleteIcon from "@/icons/deleteicon.svg";
import waitIcon from "@/icons/hourglassIcon.svg";
import cancelIcon from "@/icons/closeIcon.svg";
import PacmanLoader from "react-spinners/RingLoader";
import Image, { StaticImageData } from 'next/image';

interface ListOfUsersProps {
  mark: boolean;
  markall: boolean;
  firstname: string;
  lastname: string;
  photolink?: string;
  gender: string;
  country: string;
  id: string;
  mark_user: string[];
  onDeleteUser?: (userId: string) => void;
  onSuspendUser?: (userId: string, endDate: number) => void;
}

export const List_of_users: React.FC<ListOfUsersProps> = ({
  mark,
  markall,
  firstname,
  lastname,
  photolink,
  gender,
  country,
  id,
  mark_user,
  onDeleteUser,
  onSuspendUser,
}) => {
  const [option_click, setoption_click] = useState(false);
  const [suspend_click, setsuspend_click] = useState(false);
  const [suspend_date, set_suspend_date] = useState("");
  const [showmark, setshowmark] = useState(false);
  const [tick, settick] = useState(false);
  const [loading, setLoading] = useState(false);
  const [color] = useState("#f54242");
  const [status, setstatus] = useState("");
  const [proIMG, setproIMG] = useState<string | StaticImageData>(profileIcon);
const [gender_type, setgender_type] = useState<string | StaticImageData>(maleIcon);

  useEffect(() => {
    if (mark) {
      setshowmark(true);
      settick(false);
    }
    if (markall) {
      setshowmark(true);
      settick(true);
    }
  }, [mark, markall]);

  useEffect(() => {
    check_gender();
    checkphoto();
  }, []);

  const checkphoto = () => {
    if (photolink) {
      setproIMG(photolink);
    }
  };

  const check_gender = () => {
    if (gender.toUpperCase() === "MALE") {
      setgender_type(maleIcon);
    } else if (gender.toUpperCase() === "FEMALE") {
      setgender_type(femaleIcon);
    }
  };

  const deleteButton = () => {
    setLoading(true);
    setoption_click(false);
    setstatus("deleting user..");
    if (onDeleteUser) {
      onDeleteUser(id);
    }
    setLoading(false);
  };

  const three_day = (Days: string) => {
    let day = parseInt(Days);
    let date = Date.now();
    let first_date = new Date(Number(date));
    let enddate = new Date(first_date.setDate(first_date.getDate() + day));
    return enddate;
  };

  const suspendButton = () => {
    if (suspend_date) {
      setLoading(true);
      setoption_click(false);
      setstatus("suspending user..");
      let end_date = three_day(suspend_date).getTime();
      if (onSuspendUser) {
        onSuspendUser(id, end_date);
      }
      setLoading(false);
    }
  };

  return (
    <li className="flex pl-1 pr-1 rounded-lg bg-slate-400 w-full mt-2 justify-between">
      <div>
        <div className="flex">
          <Image
            alt="profileIcon"
            src={proIMG || proIMG}
            className="w-7 h-7 rounded-full"
          />
          <p className="text-white ml-1 text-sm font-bold">{`${firstname} ${lastname}`}</p>
        </div>

        <div className="flex">
          <p className="text-white ml-1 text-sm font-bold mt-1">Gender</p>
          <Image
            alt="maleIcon"
            src={gender_type || gender_type}
            className="w-7 h-7 rounded-full"
          />
        </div>

        <div className="flex">
          <p className="text-white ml-1 text-sm font-bold mt-1">Location:</p>
          <p className="text-white ml-1 text-sm font-bold mt-1">{country}</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center mt-8 w-full">
          <PacmanLoader
            color={color}
            loading={loading}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <p className="text-xs">{status}..</p>
        </div>
      )}

      <div className="my-auto flex flex-col">
        <div>
          {option_click && (
            <div className="w-fit h-fit p-2 bg-indigo-500 absolute z-10 right-1/4 overflow-auto rounded-lg shadow shadow-white">
              <button
                className="flex bg-red-950 rounded-lg p-1 shadow shadow-black mb-2"
                onClick={deleteButton}
              >
                <img
                  alt="deleteIcon"
                  src={deleteIcon.src || deleteIcon}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-bold text-xs text-white">delete account</p>
              </button>

              <button
                className="flex bg-orange-500 rounded-lg p-1 shadow shadow-black"
                onClick={() => setsuspend_click(true)}
              >
                <img
                  alt="waitIcon"
                  src={waitIcon.src || waitIcon}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-bold text-xs text-white">suspend account</p>
              </button>

              {suspend_click && (
                <div className="w-full h-fit flex flex-col mt-1 bg-yellow-200 rounded-md">
                  <div className="w-full flex justify-end">
                    <button onClick={() => setsuspend_click(false)}>
                      <img
                        alt="cancelIcon"
                        src={cancelIcon.src || cancelIcon}
                        className="w-5 h-5 object-cover"
                      />
                    </button>
                  </div>
                  <select
                    required
                    className="payment-list mt-1 rounded-lg border border-black"
                    onChange={(e) => set_suspend_date(e.currentTarget.value)}
                  >
                    <option value="" selected disabled hidden>
                      Choose time
                    </option>
                    <option value="7">1 week</option>
                    <option value="28">1 month</option>
                    <option value="84">3 months</option>
                    <option value="336">12 months</option>
                  </select>

                  <button
                    className="bg-blue-500 mt-1 rounded-lg text-xs font-bold ml-1 mr-1 text-white mb-2"
                    onClick={suspendButton}
                  >
                    suspend
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setoption_click(!option_click)}>
            <img alt="optionIcon" src={optionIcon.src || optionIcon} />
          </button>
        </div>

        {showmark && (
          <input
            type="radio"
            checked={tick}
            onClick={() => {
              settick(true);
              if (!mark_user.includes(id)) {
                mark_user.push(id);
              }
              console.log("number of marked users " + mark_user.length);
            }}
          />
        )}
      </div>
    </li>
  );
};
