"use client"
import React, { useState, useEffect } from "react";
import Locker from "../../icons/locker.svg";
import { ToastContainer, toast } from "react-toastify";
import Notifybuy from "./Notifybuy";
import Viewcontent from "./Viewcontent";
import DummyImage from "./../../icons/mmekoDummy.png";
// import { downloadImage } from "../../api/sendImage";
// import {
//   ProfilechangeStatus,
//   buy_exclusive_content,
//   delete_exclusive_content,
//   delete_exclusive_thumb,
// } from "../../app/features/profile/profile";
// import { getprofilebyid } from "../../app/features/profile/comprofile";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";

let disable_form = false;
type exclusiveTypes = {
  image: string,
  price: number,
  content_type: string,
  buy: ()=> void,
  contentlink: string,
  contentname: string,
  modelId: string,
  setisbuying: ()=> void,
  id: string,
  me: boolean,
  thumblink: string,
}


export const Exclusive = ({
  image,
  price,
  content_type,
  buy,
  contentlink,
  contentname,
  modelId,
  setisbuying,
  id,
  me,
  thumblink,
}: exclusiveTypes) => {
  let detail = `This Content is locked click to buy @${price} Gold`;
  let [file, setfile] = useState(image);
  const toastId = React.useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // const [thumbimg, setthumbimg] = useState(image);
  // let balance = useSelector((state) => state.profile.balance);
  // const testmsg = useSelector((state) => state.profile.testmsg);
  // const thumbdelstats = useSelector((state) => state.profile.thumbdelstats);
  // const buyexstats = useSelector((state) => state.profile.buyexstats);
  // const deleteexstats = useSelector((state) => state.profile.deleteexstats);
  // const myuserid = useSelector((state) => state.register.userID);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // console.log(modelId, "line 48");
  // useEffect(() => {
  //   if (contentlink) {
  //     disable_form = false;
  //     setfile(contentlink);
  //   }

  //   if (thumblink) {
  //     setthumbimg(thumblink);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (buyexstats === "succeeded") {
  //     dispatch(ProfilechangeStatus("idle"));
  //     disable_form = false;
  //     if (toastId.current) {
  //       toast.dismiss(toastId.current);
  //     }
  //     setisbuying(true);
  //   }

  //   if (buyexstats === "failed") {
  //     detail = `This Content is locked click to buy @${price} Gold`;
  //     if (toastId.current) {
  //       toast.dismiss(toastId.current);
  //     }
  //     disable_form = false;
  //     dispatch(ProfilechangeStatus("idle"));
  //   }

  //   if (deleteexstats === "succeeded") {
  //     dispatch(ProfilechangeStatus("idle"));
  //     dispatch(delete_exclusive_thumb(thumblink));
  //   }

  //   if (deleteexstats === "failed") {
  //     dispatch(ProfilechangeStatus("idle"));
  //     disable_form = false;
  //   }
  // }, [buyexstats, deleteexstats]);

  // useEffect(() => {
  //   if (thumbdelstats === "succeeded") {
  //     dispatch(ProfilechangeStatus("idle"));
  //     disable_form = false;
  //     setShowMenu(false);
  //     dispatch(getprofilebyid({ userid: myuserid, clientid: myuserid }));
  //   }
  // }, [thumbdelstats]);

  // const clicktobuy = () => {
  //   if (buy === false) {
  //     return true;
  //   }
  // };

  // const buynow = () => {
  //   let mybalance = parseFloat(balance);
  //   let buyprice = parseFloat(price);
  //   let my_current_balance = mybalance - buyprice;

  //   if (mybalance >= buyprice) {
  //     if (buyexstats !== "loading") {
  //       disable_form = true;
  //       detail = "purchasing please wait...";
  //       dispatch(
  //         buy_exclusive_content({
  //           userid: myuserid,
  //           token,
  //           exclusiveid: id,
  //           price: price,
  //           pricebalance: my_current_balance,
  //           exclusivename: contentname,
  //           exclusivelink: contentlink,
  //           modelID: modelId,
  //         })
  //       );
  //     }
  //   } else {
  //     if (toastId.current) {
  //       toast.dismiss(toastId.current);
  //     }
  //     navigate("/topup");
  //   }
  // };

  // const cancel = () => {
  //   toast.dismiss(toastId.current);
  // };

  // const showcontent = () => {
  //   if (buy === true) {
  //     if (content_type === "image") {
  //       return (
  //         <img
  //           src={file}
  //           alt="exclusive_img"
  //           className="object-cover w-full rounded-md h-full cursor-pointer"
  //           onClick={() => setShowModal(true)}
  //           onError={(e) => {
  //             e.target.onerror = null;
  //             e.target.src = DummyImage;
  //           }}
  //         />
  //       );
  //     } else if (content_type === "video") {
  //       return (
  //         <video
  //           src={file}
  //           className="object-cover w-full rounded-md h-full"
  //           autoPlay
  //           controls
  //         />
  //       );
  //     }
  //   } else {
  //     return (
  //       <img
  //         src={thumbimg}
  //         alt="exclusive_img"
  //         className="object-cover w-full rounded-md h-full"
  //       />
  //     );
  //   }
  // };

  // const buycontent = () => {
  //   toastId.current = toast(
  //     <Notifybuy price={price} buy={buynow} cancel={cancel} />,
  //     { autoClose: false }
  //   );
  // };

  // const deletecontent = () => {
  //   if (deleteexstats !== "loading") {
  //     disable_form = true;
  //     detail = "deleting please wait...";
  //     dispatch(delete_exclusive_content({ token, id }));
  //   }
  // };

  return (
    <div className="relative my-1 h-[85vh] w-full">
      <ToastContainer position="top-center" theme="dark" />
      {me && (
        <div className="absolute top-2 right-2 z-10">
          <button
            className="text-white bg-slate-800 rounded-full p-2"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01"
              ></path>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute top-10 right-0 bg-slate-800 rounded-md shadow-lg p-2">
              <button
                className="w-full text-left text-white font-bold py-1 px-2 whitespace-nowrap hover:bg-slate-700"
                // onClick={deletecontent}
                // disabled={deleteexstats === "loading"}
              >
                Delete Content
              </button>
            </div>
          )}
        </div>
      )}
      {/* {showcontent()} */}
      {showModal && (
        <Viewcontent
          photo={file}
          phototype={content_type}
          onClose={() => setShowModal(false)}
        />
      )}
      {true && (
        <div className="absolute w-full px-4 text-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <img
            src={Locker}
            alt="exclusive_img"
            className="object-cover w-6 h-8 pb-2 mx-auto"
          />
          <h4 className="w-full text-sm font-semibold py-1 text-white bg-green-600 rounded">
            <button disabled={disable_form}> {/*onClick={buycontent}*/}
              {detail}
            </button>
          </h4>
        </div>
      )}
      <p className="overflow-hidden text-sm text-white truncate">
        {contentname}
      </p>
    </div>
  );
};
