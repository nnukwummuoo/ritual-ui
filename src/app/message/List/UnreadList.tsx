import React, { useState } from "react";
import onlineIcon from "@public/icons/onlineIcon.svg";
import offlineIcon from "@public/icons/offlineIcon.svg";
import { format, isToday } from "date-fns";
import { useRouter } from "next/navigation";
// import dodo from "../../../icons/icons8-profile_Icon.png";
// import { downloadImage } from "../../../api/sendImage";
// import { removenotification } from "../../../app/features/message/messageSlice";
// import DummyPics from "@public/icons/icons8-profile_Icon.png"

let taken = false;

export const UnreadList = ({
  photolink,
  username,
  content,
  count,
  toid,
  fromid,
  key,
  date,
  online,
}:
{
  photolink: string,
  username: string,
  content: string,
  count: number,
  toid: string,
  fromid: string,
  key: string,
  date: string,
  online: boolean,
}) => {
  const [modelid, setmodelid] = useState([]);
  const router = useRouter();
  // const [userphoto, setuserphoto] = useState(dodo);
  // let myid = useSelector((state) => state.register.userID);
  
    let date1 = new Date(Number(date)).toString(); 
    const dates = isToday(date1) ? format(date1, "h:mm a") : format(date1, "MM/dd/yyyy");

  // useEffect(() => {
  //   //  console.log("this is client "+client)
   

  //   setmodelid((value) => [...value, fromid, toid ]);
   
  //     if (photolink) {
  //       let photo1 = photolink;

  //       //console.log('Good Photo '+photo1)
  //       setuserphoto(photo1);
  //     }
    
  //   //console.log('modelid'+modelid)
  // }, []);

  // const sliceContent = () => {
  //   if (content) {
  //     return content.slice(0, 10) + `...`;
  //   }
  // };

  return (
    <li className="mb-1 "
      onClick={(e) => {
        //console.log("inside UreadList "+modelid)
       // removenotification(date);
        router.push(`/message/${modelid.toString()}`);
      }}
      
    >
      <div className="flex items-center justify-between px-4 py-3 mx-2 rounded-lg sm:px-2 bg-slate-800">
        <div className="flex items-center gap-4 ">
          <div className="relative w-12 h-12 ">
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
          <div className="pt-1 justify-items-end">
            <h4 className="w-5 h-5 text-sm text-center text-black rounded-full bg-slate-300">
              {count}
            </h4>
          </div>
        </div>
      </div>
    </li>
  );
};
