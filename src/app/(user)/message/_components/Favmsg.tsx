import { useState } from "react";
import { RecentList } from "../List/RecentList";
// import { RecentList } from "../List/RecentList";

export const Favmsg = () => {
  const [messageList, setmessageList] = useState([]);

  const checkMessageList = () => {
    if (messageList.length > 0) {
      return (
        <ul className="pl-2 pr-2 mt-2 overflow-auto mb-8">
          {messageList.map((value: {
            id: string,
            photolink: string,
            username: string,
            content: string,
            toid: string,
            fromid: string,
            date: string,
            online: boolean,
          }) => {
            return <RecentList key={value.id} {...value} />;
          })}
        </ul>
      );
    } else {
      return (
        <div className="flex flex-col h-full justify-center items-center overflow-hidden">
          <p className="text-yellow-500 mt-16">No! Favourite Messaging</p>
        </div>
      );
    }
  };
  return <div>{checkMessageList()}</div>;
};
