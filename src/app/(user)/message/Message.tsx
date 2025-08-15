"use client"
import React, { useEffect, useState, useRef } from "react";
import PacmanLoader from "react-spinners/DotLoader";
import { FaAngleLeft } from "react-icons/fa";
import { MsgRequestNav } from "./_components/MsgRequestNav";
import { BottomNav } from "./_components/BottomNav";
// import { RecentList } from "./List/RecentList";
// import { Gennavigation } from "../../navs/Gennav";
// import { Unreadmsg } from "./_components/Unreadmsg";
// import { useSelector, useDispatch } from "react-redux";
// import { Recentmessage } from "./Recentmessage";
// import { Favmsg } from "./Favmsg";
// import { getmsgnitify } from "../../app/features/message/messageSlice";


export const MessageView = () => {
  let [loading, setLoading] = useState<boolean>(false);
  let [color, setColor] = useState<string>("#c2d0e1");
  // const login = useSelector((state) => state.register.logedin);
  // const recentmsg = useSelector((state) => state.message.recentmsg);
  // const navigate = useNavigate();
  // const token = useSelector((state) => state.register.refreshtoken);
  // const msgnotifystatus = useSelector((state) => state.message.msgnotifystatus);
  // const messageList = useSelector((state) => state.message.Allmsg);
  // let userid = useSelector((state) => state.register.userID);
  // let ref = useRef(true);
  // let dispatch = useDispatch();
  // let [Chatmessage, setChatmessage] = useState("");
  // const [click,setclick] = useState(true)
  // useEffect(() => {
  //   if (!login) {
  //     window.location.href = "/";
  //   } //else {
  //   //   dispatch(getmsgnitify({ userid, token }));
  //   // }
  // }, []);

  // const shownote = () => {
  //   if (loading === false) {
  //     console.log("notification length " + recentmsg.length);
  //     if (recentmsg.length > 0) {
  //       return recentmsg.map((value) => {
  //         if (value.value === "notify") {
  //           return (
  //             <Unreadmsg
  //               photolink={value.photolink}
  //               username={value.username}
  //               content={value.content}
  //               fromid={value.fromid}
  //               toid={value.toid}
  //               dates={value.date}
  //               count={value.messagecount}
  //             />
  //           );
  //         } else if (value.value === "recent") {
  //           console.log("inside recent");
  //           return (
  //             <RecentList
  //               fromid={value.fromid}
  //               toid={value.toid}
  //               contents={value.content}
  //               name={value.name}
  //               image={value.photolink}
                
  //             />
  //           );
  //         }
  //       });
  //     } else {
  //       return (
  //         <div className="flex flex-col items-center justify-center overflow-hidden">
  //           <p className="mt-16 text-slate-400">No! Messages</p>
  //         </div>
  //       );
  //     }
  //   }
  // };

  // const checknotification = () => {
  //   if (recentmsg.length > 0) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // useEffect(() => {
  //   if (msgnotifystatus === "succeeded") {
  //     setLoading(false);
  //   }
  // }, [msgnotifystatus]);


  return (
    <div className=" sm:w-8/12 lg:w-7/12 xl:w-7/12" >
             
<div className="md:w-3/5 md:mx-auto">
      
       <header className="flex items-center gap-4 md:ml-10">
        <FaAngleLeft
          color="white"
          size={30}
          // onClick={() => {
          //   navigate("/");
          // }}
        />

        <h4 className="text-lg font-bold text-white">MESSAGES</h4>
      </header>

      {/* <div className="sticky top-0 z-10 " onClick={(e)=>setclick(true)}> // replace with div below */} 
      <div className="sticky top-0 z-10 " >
        <div className="px-2 pb-2 md:px-4 sm:p-6 lg:pl-10 ">
          <input
            type="text"
            className="w-full h-10 px-4 text-center rounded-full"
            placeholder="Search for message"
          />
        </div>
        <MsgRequestNav />
      </div>

      {/* Move scrollable content here */}
      <div className="overflow-y-auto h-[calc(100vh-100px)] pb-3">
        <div className="flex flex-col w-full">
          {loading && (
            <div className="flex flex-col items-center mt-5">
              <PacmanLoader
                color={color}
                loading={loading}
                size={35}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="text-xs text-center text-slate-400">
                getting message...
              </p>
            </div>
          )}
        </div>
      </div></div>
      <div className=""><BottomNav /></div>
    </div>
  );
};
