import React, { useState, useEffect } from "react";
import dodo from "@public/icons/icons8-profile_Icon.png";
// import { downloadImage } from "../../../api/sendImage";
import onlineIcon from "@public/icons/onlineIcon.svg";
import offlineIcon from "@public/icons/offlineIcon.svg";
import { format, isToday } from "date-fns";
import DummyPics from "@public/icons/icons8-profile_Icon.png"
import { useRouter } from "next/navigation";

export const
  RecentList = ({
  photolink,
  username,
  content,
  toid,
  fromid,
  date,
  online,
}: {
  photolink: string;
  username: string;
  content: string;
  toid: string;
  fromid: string;
  date: string;
  online: boolean;
}) => {
  const [userphoto, setuserphoto] = useState(dodo);
  const [modelid, setmodelid] = useState([]);
  const router = useRouter();
  // let myid = useSelector((state) => state.register.userID);
  // let taken = false;
  // let date1 = new Date(Number(date)).toString();
  // const dates = format(date1, "MM/dd/yyyy 'at' h:mm a");


  let date1 = new Date(Number(date)).toString(); 
  const dates = isToday(date1) ? format(date1, "h:mm a") : format(date1, "MM/dd/yyyy");

  // useEffect(() => {  
  //   if (fromid === myid) {
  //     setmodelid([toid, fromid]);    
  //   } 
  //   if (toid === myid) {
  //     setmodelid([fromid, toid]);
  //   }
  //  if (photolink) {
  //   let photo1 = photolink;

  //   //console.log('Good Photo '+photo1)
  //   setuserphoto(photo1);
  // }
    

  //   //console.log('modelid'+modelid)
  // }, []);

  // const sliceContent = () => {
  //   // console.log("here is model "+modelid)
  //   if (content) {
  //     return content.slice(0, 10) + `...`;
  //   }
  // };

  return (
    // <li
    //   className="flex items-center justify-between px-4 py-3 mx-4 rounded-lg sm:px-2 bg-slate-800"
    //   onClick={(e) => {
    //     router.push(`/message/${modelid.toString()}`);
    //   }}
    // >
    //   <div className="flex ml-3">
    //     <img alt="userimg" src={photo} className="w-5 h-5 rounded-full"></img>
    //     <p className="ml-1 text-sm font-semibold text-white">{name}</p>
    //   </div>
    //   <div className="mt-3 ml-3 text-sm text-black">
    //     <p>{sliceContent()}</p>
    //   </div>
    // </li>

    <li className="mb-1"
      onClick={(e) => {
        // removenotification(date);
        router.push(`/message/${modelid.toString()}`);
      }}
      
    >
      <div className="flex items-center justify-between px-4 py-3 mx-2 rounded-lg sm:px-2 bg-slate-800 ">
        <div className="flex items-center gap-4 ">
          <div className="relative w-12 h-12">
            <img
              src={require("/dodo")}
              alt="message-image"
              className="object-cover w-full h-full rounded-full"
              // onError={(e) => { e.target.onerror = null;   e.target.src = DummyPics;}}
            />
            <div className="absolute z-10 w-6 h-6 m-1 top-6 left-6">
              <img
                alt={online ? "online" : "offline"}
                src={online ? onlineIcon : offlineIcon}
                className={`object-cover rounded-full w-5 h-5 ${
                  online ? "bg-[#d3f6e0]" : "bg-[#ffd8d9]"
                }`}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 text-md sm:text-sm">
              {username.split(" ")[0]}
            </h4>

            <p className="text-sm text-slate-400 sm:text-xs">
              {/* {sliceContent()} */}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-slate-400">{dates}</h4>
        </div>
      </div>
    </li>
  );
};
