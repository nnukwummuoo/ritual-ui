import React from "react";
// import { UnreadList } from "../List/UnreadList";

export const Unreadmsg = () => {
  // const msgnitocations = useSelector((state) => state.message.msgnitocations);
  const checkMessageList = () => {
    // if (msgnitocations.length > 0) {
    //   return (
    //     <ul className="pl-2 pr-2 mt-2 overflow-auto mb-8">
    //       {msgnitocations.map((value) => {
    //         return (
    //           <UnreadList
    //             photolink={value.photolink}
    //             username={value.username}
    //             content={value.content}
    //             count={value.messagecount}
    //             fromid={value.fromid}
    //             toid={value.toid}
    //             date={value.date}
    //             online={value.online}
    //           />
    //         );
    //       })}
    //     </ul>
    //   );
    // } else {
      return (
        <div className="flex flex-col justify-center items-center overflow-hidden">
          <p className="text-slate-400 mt-16">No! Unread Messages</p>
        </div>
      );
    // }
  };

  return <div>{checkMessageList()}</div>;
};
