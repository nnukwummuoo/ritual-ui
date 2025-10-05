"use client"
import React, { useState, useEffect } from "react";
import PacmanLoader from "react-spinners/RingLoader";
// import { useSelector, useDispatch } from "react-redux";
// import { getall_request } from "../../../app/features/booking/booking";
// import { Acceptedlist } from "./creatornotifylist/Acceptedlist";
// import { Meetuplist } from "./creatornotifylist/Meetuplist";
// import { List_of_message } from "../../users/List_of_message";
// import { Gennavigation } from "../../../navs/Gennav";
// import { Acceptedview } from "./Acceptedview";
// import { useAuth } from "../../../hooks/useAuth";
// import { Requestlist } from "./Requestlist";

export const Allview = () => {
  const [loading, setloading] = useState(true);
  const [success, setsuccess] = useState(false);
  const [reload, setReload] = useState(false);
  //  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   setAllBookings(Allrequest);
  //   console.log(Allrequest);
  // }, [Allrequest, reload]);

  // useEffect(() => {
  //   fetchall_req();
  // }, [reload]);

  // const loggedUser = useAuth();
  //     setloading(false);
  //   }
  //   if (allrequest_stats === "failed") {
  //     setloading(false);
  //   }
  // }, [allrequest_stats]);

  // const getallrequest = () => {
  //   if (loading === false) {
  //     if (Allrequest.length > 0) {
  //       // const allRequest = [...Allrequest];
  //       // console.log(allRequest);
  //       return allBookings.map((value, index) => {
  //         if (
  //           (value.creatorid !== Mycreator && value.status === "accepted") ||
  //           value.status === "decline" ||
  //           value.status === "completed"
  //         ) {
  //           return (
  //             !loggedUser?.creator_portfolio && (
  //               <ul className="flex flex-col items-center pl-2 pr-2 w-full mb-1">
  //                 <Acceptedlist
  //                   key={`${index}_${userid}`}
  //                   name={value.name}
  //                   photolink={value.photolink}
  //                   status={value.status}
  //                   type={value.type}
  //                   date={value.date}
  //                   time={value.time}
  //                   creatorid={value.creatorid}
  //                   creatoruserid={value.creatoruserid}
  //                   amount={value.amount}
  //                   id={value.id}
  //                 />
  //               </ul>
  //             )
  //           );
  //         }

  //         if (value.status === "pending" && value.creatorid !== Mycreator) {
  //           return (
  //             !loggedUser?.creator_portfolio && (
  //               <ul className="flex flex-col items-center pl-2 pr-2 w-full mb-1">
  //                 <Requestlist
  //                   photolink={value.photolink}
  //                   creatorname={value.name}
  //                   creatortype={value.type}
  //                   date={value.date}
  //                   time={value.time}
  //                   creatorid={value.creatorid}
  //                   id={value.id}
  //                   setRequests={setAllBookings}
  //                 />
  //               </ul>
  //             )
  //           );
  //         }

  //         if (
  //           value.status === "pending" ||
  //           (value.status === "accepted" && value.creatorid === Mycreator)
  //         ) {
  //           let messaging = check_status(value.status, value.type, value.name);
  //           return (
  //             <ul className="flex flex-col items-center pl-2 pr-2 w-full mb-1">
  //               <Meetuplist
  //                 id={value.id}
  //                 clientname={value.name}
  //                 type={value.type}
  //                 photolink={value.photolink}
  //                 date={value.date}
  //                 time={value.time}
  //                 venue={value.place}
  //                 postuserid={value.clientid}
  //                 creatorid={value.creatorid}
  //                 status={value.status}
  //                 latter1={messaging}
  //                 setRequests={setAllBookings}
  //                 setReload={setReload}
  //               />
  //             </ul>
  //           );
  //         }

  //         if (value.ismessage) {
  //           return (
  //             <ul className="flex flex-col items-center pl-2 pr-2">
  //               <List_of_message
  //                 id={value.id}
  //                 time={value.time}
  //                 message={value.message}
  //                 Mycreator={Mycreator}
  //                 setRequests={setAllBookings}
  //               />
  //             </ul>
  //           );
  //         }
  //       });
  //     } else {
  //       return (
  //         <div className="w-full h-full flex justify-center items-center mt-16">
  //           <p className="text-slate-400  text-xs">
  //             Notifications about your account will appear here.
  //           </p>
  //         </div>
  //       );
  //     }
  //   }
  // };

  // const fetchall_req = async () => {
  //   setloading(true);
  //   await dispatch(getall_request({ userid, token, creatorid: Mycreator }));
  //   setloading(false);
  // };

  // const check_status = (status, type, clientname) => {
  //   if (status === "accepted") {
  //     return (latter = `you accepted a ${type} request with ${clientname}`);
  //   } else {
  //     return (latter = `${clientname} Requested a ${type} with you`);
  //   }
  // };

  return (
    <div className="w-full ">
      <div className="w-full  flex flex-col mt-2 mb-5">
        {loading && (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <PacmanLoader
              color={"#fff"}
              loading={loading}
              size={35}
              aria-label="Loading Spinner"
              data-testid="loader"
            />

            <p className="text-slate-400 text-xs">please wait...</p>
          </div>
        )}

        <div className="w-full flex flex-col pb-7 overflow-auto mb-3">
          {/* <Acceptedview /> */}
          {/* {getallrequest()} */}
        </div>
      </div>
    </div>
  );
};
