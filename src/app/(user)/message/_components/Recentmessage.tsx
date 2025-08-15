import React, { useEffect, useRef, useState } from "react";
import { RecentList } from "../List/RecentList";
import PacmanLoader from "react-spinners/DotLoader";
import { useSelector, useDispatch } from "react-redux";
import { UnreadList } from "../List/UnreadList";
// import {
//   getmsgnitify,
//   reset_recent,
//   changemessagestatus,
// } from "../../app/features/message/messageSlice";

//let ListofIDS = []

export const Recentmessage = () => {
  // [messageList,setmessageList] = useState([1])
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#c2d0e1");
  // const token = useSelector((state) => state.register.refreshtoken);
  // const msgnotifystatus = useSelector((state) => state.message.msgnotifystatus);
  // const messageList = useSelector((state) => state.message.recentmsg);
  // const modelID = useSelector((state) => state.profile.modelID);
  // let userid = useSelector((state) => state.register.userID);
  let ref = useRef(true);
  let dispatch = useDispatch();
  let [Chatmessage, setChatmessage] = useState("");

  // useEffect(() => {
  //   if (msgnotifystatus !== "loading") {
  //     setLoading(true);
  //     dispatch(reset_recent());
  //     dispatch(getmsgnitify({ userid, token }));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (msgnotifystatus === "succeeded") {
  //     dispatch(changemessagestatus("idle"));
  //     //ListofIDS = []
  //     setLoading(false);
  //     setChatmessage("No! recent messages");
  //   }
  // }, [msgnotifystatus]);

  // const checkMessageList = () => {
  //   if (loading === false) {
  //     console.log(messageList);
  //     if (messageList.length > 0) {
  //       const sortedMessages = messageList.slice().sort((a, b) => {
  //         // Convert to numbers if not already
  //         return Number(b.date) - Number(a.date);
  //       });
  //       return (
  //         <ul className=" mt-2 overflow-auto mb-8 ">
  //           {sortedMessages.map((value, index) => {
  //             if (value.value === "unread") {
  //               return (
  //                 <UnreadList
  //                   content={value.content}
  //                   photolink={value.photolink}
  //                   username={value.username}
  //                   count={value.messagecount}
  //                   toid={value.toid}
  //                   fromid={value.fromid}
  //                   date={value.date}
  //                   online={value.online}
  //                 />
  //               );
  //             } else if (value.value === "recent") {
  //               return (
  //                 <RecentList
  //                   key={index}
  //                   photolink={value.photolink}
  //                   username={value.name}
  //                   content={value.content}
  //                   fromid={value.fromid}
  //                   toid={value.toid}
  //                   date={value.date}
  //                   online={value.online}
  //                 />
  //               );
  //             } else {
  //               return (
  //                 <div className="flex flex-col justify-center items-center overflow-hidden ">
  //                   <p className="text-slate-400 mt-16">no recent message!!</p>
  //                 </div>
  //               );
  //             }
  //           })}
  //         </ul>
  //       );
  //     } else {
  //       return (
  //         <div className="flex flex-col justify-center items-center overflow-hidden">
  //           <p className="text-slate-400 mt-16">no recent message!!</p>
  //         </div>
  //       );
  //     }
  //   }
  // };

  // let checkmessage = (toid, fromid)=>{

  //     let IStrue = ListofIDS.find(value=> {
  //       return value.fromid === fromid && value.toid === toid  || value.toid === fromid &&  value.fromid === toid
  //     } )

  //     if(IStrue){
  //       return false
  //     }else{
  //       return true
  //     }

  // }

  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center mt-5">
          <PacmanLoader
            color={color}
            loading={loading}
            size={35}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <p className="text-center text-slate-400 text-xs">
            getting recent chats...
          </p>
        </div>
      )}
      {/* {checkMessageList()} */}
    </div>
  );
};
