"use client"
import React, { useState, useEffect } from "react";
// import { Acceptedlist } from "./creatornotifylist/Acceptedlist";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   acceptedr_req,
//   resetstat,
// } from "../../../app/features/booking/booking";
import PacmanLoader from "react-spinners/RingLoader";
import { Acceptedlist } from "./Acceptedlist";
// import { useAuth } from "../../../hooks/useAuth";

const acceptedFanReq = [
{
  name: "John Doe", //{value.name}
  photolink: "No link",//{value.photolink}
  status: "",//{value.status}
  type: "private show", //{value.type}
  date: "15/08/2025", //{value.date}
  time: "16:15:00", //{value.time}
  creator_portfolio_id: "9490040483hhrh3", //{value.creator_portfolio_id}
  creatoruserid: "094399u505jkete", //{value.creatoruserid}
  amount: 50000, //{value.amount}
  id: "3539rjeprjer93i" //{value.id}
},
{
  name: "John Doe", //{value.name}
  photolink: "No link",//{value.photolink}
  status: "",//{value.status}
  type: "private show", //{value.type}
  date: "15/08/2025", //{value.date}
  time: "16:15:00", //{value.time}
  creator_portfolio_id: "9490040483hhrh3", //{value.creator_portfolio_id}
  creatoruserid: "094399u505jkete", //{value.creatoruserid}
  amount: 50000, //{value.amount}
  id: "3539rjeprjer93i" //{value.id}
},
{
  name: "John Doe", //{value.name}
  photolink: "No link",//{value.photolink}
  status: "",//{value.status}
  type: "private show", //{value.type}
  date: "15/08/2025", //{value.date}
  time: "16:15:00", //{value.time}
  creator_portfolio_id: "9490040483hhrh3", //{value.creator_portfolio_id}
  creatoruserid: "094399u505jkete", //{value.creatoruserid}
  amount: 50000, //{value.amount}
  id: "3539rjeprjer93i" //{value.id}
}
]

const user = {
  creator_portfolio: false
}
export const Acceptedview = () => {
  // const Accepted = useSelector((state) => state.booking.acceptedList);
  const [loading, setloading] = useState(false);
  const [success, setsuccess] = useState(false);
  let [color, setColor] = useState("#c2d0e1");

  // const userid = useSelector((state) => state.register.userID);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const acceptedReqstat = useSelector((state) => state.booking.acceptedReqstat);
  // const acceptedReqMes = useSelector((state) => state.booking.acceptedReqMes);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   showAccpets();
  //   console.log(Accepted);
  // }, []);

  // useEffect(() => {
  //   if (acceptedReqstat === "succeeded") {
  //     setloading(false);
  //     dispatch(resetstat());
  //   }
  // }, [acceptedReqstat]);
  // const user = useAuth();
  const Showaccepted = () => {
    if (user?.creator_portfolio) {
      return (
        <p className="text-slate-400 text-center mt-16 text-xs">
          !You currently don`t have any accepted request
        </p>
      );
    }
    if (loading === false) {
      if (acceptedFanReq.length > 0) {
        const list = [...acceptedFanReq].reverse();
        return (
          <ul className="flex flex-col items-center mr-2 ml-2">
            {list.map((value, index) => {
              return (
                <Acceptedlist
                  key={`${index}`}
                  name={value.name}
                  photolink={value.photolink}
                  status={value.status}
                  type={value.type}
                  date={value.date}
                  time={value.time}
                  creator_portfolio_id={value.creator_portfolio_id}
                  creatoruserid={value.creatoruserid}
                  amount={value.amount}
                  id={value.id}
                  // userID={value.userid}
                />
              );
            })}
          </ul>
        );
      } else {
        return (
          <p className="text-slate-400 text-center mt-16 text-xs">
            !You currently don`t have any accepted request
          </p>
        );
      }
    }
  };

  // const showAccpets = async () => {
  //   if (acceptedReqstat !== "loading") {
  //     setloading(true);
  //     await dispatch(acceptedr_req({ userid, token }));
  //     setloading(false);
  //   }
  // };

  return (
    <div>
      {loading && (
        <div className="flex w-full items-center flex-col mt-16">
          <PacmanLoader
            color={color}
            loading={loading}
            size={35}
            aria-label="Loading Spinner"
            data-testid="loader"
          />

          <p className="text-slate-400 text-xs">please wait...</p>
        </div>
      )}
      <div>{Showaccepted()}</div>
    </div>
  );
};
