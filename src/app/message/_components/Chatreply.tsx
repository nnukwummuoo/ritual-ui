import React from "react";
import notseenIcon from "@public/icons/notseenIcon.svg";
import seenIcon from "@public/icons/seenIcon.svg";
import person from "@public/icons/person.svg";
import { useState } from "react";
import { useEffect } from "react";
// import { downloadImage } from "../../api/sendImage";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import dodoIcon from "@public/icons/icons8-profile_user.png";

export const Chatreply = ({ img, username, content, date, id, className }: { img: any, username: string, content: string, date: string, id: string, className: string }) => {
  const dates = format(new Date(Number(date)), "MM/dd/yyyy 'at' h:mm a"); // convert date to string
  const [photo, setphoto] = useState(person);
  
  //console.log('post date '+ date)
  // const userid = useSelector((state) => state.register.userID);
  // const Mycreator = useSelector((state) => state.profile.creatorID);

  // useEffect(() => {

  //     if (img) {
  //       setphoto(downloadImage(img, "profile"));

  //     }
  // }, []);
  // useEffect(() => {
  //   const fetchImage = async () => {
  //     if (img) {
  //       try {
  //         const result = img;
  //         // Use `result.href` as the image URL
  //         setphoto(result.href);
  //       } catch (error) {
  //         console.log("Image failed to load:", error);
  //         // Use default if the image download fails
  //         setphoto(dodoIcon);
  //       }
  //     } else {
  //       // Use default profile image when `img` is missing
  //       setphoto(dodoIcon);
  //     }
  //   };

  //   fetchImage();
  // }, [img]);

  // const checkseen = () => {
  //   if (userid === id) {
  //     return (
  //       <img
  //         alt="seenicon"
  //         src={seenIcon}
  //         className="w-5 h-5 object-cover"
  //       ></img>
  //     );
  //   }
  // };

  return (
    <div className="w-1/2 pl-1 pr-1 mb-3">
      <div className={`  ${className}`}>
        <div className="flex pl-2 pt-1 items-center">
          <img
            alt="usericon"
            src={img || dodoIcon}
            // src={dodoIcon}
            className="rounded-full w-5 h-5 object-cover mr-1"
            // onError={(e) => {
            //   e.target.onerror = null;
            //   e.target.src = dodoIcon;
            // }}
          ></img>
          <p className="text-slate-50 text-xs ">{username}</p>
        </div>
        <p className="p-3 text-normal text-sm font-serif text-black break-words whitespace-pre-wrap">
          {content}
        </p>
      </div>

      <div className="flex justify-between">
        {/* {checkseen()} */}
        <p className="text-xs text-green-800">{dates}</p>
      </div>
    </div>
  );
};
