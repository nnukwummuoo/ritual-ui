import React, { useState, useEffect } from "react";
import dodo from "../../../../icons/person.svg";
import deleteicon from "../../../../icons/deleteicon.svg";
// import reviewicon from "@/icons/icons8-review.png";
import PacmanLoader from "react-spinners/RotateLoader";
import dodoIcon from "../../../../icons/icons8-profile_Icon.png";
import { CancelReq_frag } from "./CancelReq_frag";
let comtext = "Mark as Complete";
// import { downloadImage } from '../../../../api/sendImage';
// import {
//   completepayment,
//   resetstat,
//   deleteCreator,
//   Cancelrequest,
// } from "../../../../app/features/booking/booking";
// import {
//   review,
//   changecreatorstatus,
// } from "../../../../app/features/creator/creatorSlice";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "material-react-toastify";
// import {
//   getall_request,
//   acceptedr_req,
//   add_call_data,
// } from "../../../../app/features/booking/booking";
// import {aCancelReq_frag } from "../componets/CancelReq_frag";

interface AcceptedProps {
  name: string;
  status: string;
  type: string;
  date: string;
  time: string;
  creatorid: string;
  photolink: string;
  id: string;
  creatoruserid: string;
  amount: number,
}
export const Acceptedlist = ({
  name,
  status,
  type,
  date,
  time,
  creatorid,
  photolink,
  id,
  creatoruserid,
  amount,
}: AcceptedProps) => {
  const [loading, setloading] = useState(false);
  let [color, setColor] = useState("#d49115");
  let [image, setimage] = useState(dodo);
  // let [revcontent, setrevcontent] = useState("");
  // const userid = useSelector((state) => state.register.userID);
  // const cancelstats = useSelector((state) => state.booking.cancelstats);
  // const cancelmessage = useSelector((state) => state.booking.cancelmessage);
  // const balance = useSelector((state) => state.profile.balance);
  // const Mycreator = useSelector((state) => state.profile.creatorID);
  // const profilename = useSelector((state) => state.profile.firstname);
  // let [approvebutton, setapprovebutton] = useState(false);
  // const paystats = useSelector((state) => state.booking.paystats);
  // const paymessage = useSelector((state) => state.booking.paymessage);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const reviewstats = useSelector((state) => state.creator.reviewstats);
  // const reviewmessage = useSelector((state) => state.creator.reviewmessage);
  // const [reviewbutt, setreviewbutt] = useState(false);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  const [delB_click, setdelB_click] = useState(false);

  // useEffect(() => {
  //   setimage(photolink);
  //   if (status === "accepted") {
  //     setapprovebutton(true);
  //   } else if (status === "completed") {
  //     comtext = "Completed";
  //     setapprovebutton(true);
  //   } else if (status === "decline") {
  //     setapprovebutton(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (paystats === "succeeded") {
  //     dispatch(deleteCreator({ creatorid: creatorid, date: date, time: time }));
  //     dispatch(getall_request({ userid, token, creatorid: Mycreator }));
  //     dispatch(acceptedr_req({ userid, token }));
  //     dispatch(resetstat());
  //     // setloading(!loading);
  //   }

  //   if (cancelstats === "succeeded") {
  //     dispatch(deleteCreator({ creatorid: creatorid, date: date, time: time }));
  //     dispatch(getall_request({ userid, token, creatorid: Mycreator }));
  //     dispatch(acceptedr_req({ userid, token }));
  //     dispatch(resetstat());
  //     setloading(!loading);
  //   }

  //   if (paystats === "failed") {
  //     // setloading(!loading);

  //     console.log("complete payment message " + paystats);
  //   }

  //   if (cancelstats === "failed") {
  //     setloading(!loading);

  //     console.log("complete payment message " + cancelmessage);
  //   }

  //   if (reviewstats === "succeeded") {
  //     setrevcontent("");
  //     setreviewbutt(false);
  //     setloading(false);
  //     dispatch(changecreatorstatus("idle"));
  //   }

  //   if (reviewstats === "failed") {
  //     setloading(false);
  //     dispatch(changecreatorstatus("idle"));
  //   }
  // }, [paystats, cancelstats, reviewstats]);

  // const showbutton = () => {
  //   if (approvebutton) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  // const paycomlete = () => {
  //   if (paystats !== "Loading") {
  //     const response = dispatch(
  //       completepayment({ token, userid, creatorid, date, time, id })
  //     );
  //   }
  // };

  const showPS_button = () => {
    if (type === "Private show") {
      return (
        <button
          className="text-xs bg-yellow-500 rounded-lg p-2 shadow shadow-black mt-1 active:bg-yellow-300 hover:bg-yellow-200 "
          // onClick={(e) => {
          //   let today = Date.now();
          //   if (today >= date) {
          //     toast.info("your private call schedule not yet time", {
          //       autoClose: false,
          //     });
          //     return;
          //   }
          //   console.log("creator price " + amount);
          //   let creatorid2 = [
          //     creatoruserid,
          //     userid,
          //     "caller",
          //     profilename,
          //     amount,
          //     balance,
          //   ];
          //   dispatch(add_call_data(creatorid2));
          //   navigate(`/privatecall`);
          // }}
        >
          Start Fan Call
        </button>
      );
    } else {
      return (
        <button
          className="text-xs bg-yellow-500 rounded-lg p-2 shadow shadow-black mt-1 active:bg-yellow-300 hover:bg-yellow-200 "
          // onClick={(e) => {
          //   paycomlete();
          //   comtext = "Completed";
          // }}
          disabled={status === "Completed"}
        >
          {status}
        </button>
      );
    }
  };

  // const ()=>{} = () => {
  //   if (cancelstats !== "loading") {
  //     setloading(!loading);
  //     dispatch(Cancelrequest({ token, creatorid, userid, date, time }));
  //   }
  // };

  // const reviewbutton = () => {
  //   if (reviewstats !== "loading") {
  //     setloading(true);
  //     dispatch(review({ token, userid, creatorid, content: revcontent }));
  //   }
  // };
  const [initialStatus, setInitialStatus] = useState("Mark as Completed");

  return (
    <li className="bg-gray-900 p-1 w-full ml-2 mr-2 rounded-lg mb-2">
      {loading && (
        <div className="w-full flex flex-col items-center mb-2">
          <PacmanLoader
            color={color}
            loading={loading}
            size={10}
            aria-label="Loading Spinner"
            data-testid="loader"
          />

          <p className="text-xs">please wait...</p>
        </div>
      )}
      <div className="flex">
        <img
          alt="creatorimg"
          src={"/icons/person.svg"}
          className="w-7 h-7 rounded-full object-cover"
        />
        <div className="flex flex-col ml-1 p-1">
          <p className="text-xs bg-gray-800 text-white">
            {`${name}`} {`${status}`} your {`${type}`} request on {`${date}`}{" "}
            {`${time}`}
          </p>
        </div>
      </div>
      <div className="w-full flex items-center justify-center">
        {status === "completed" && (
          <button className="text-xs capitalize bg-yellow-500 rounded-lg p-2 shadow shadow-black mt-1 active:bg-yellow-300 hover:bg-yellow-200 ">
            {status}
          </button>
        )}

        {status === "accepted" && type !== "Private show" && (
          <button
            className="text-xs bg-yellow-500 rounded-lg p-2 shadow shadow-black mt-1 active:bg-yellow-300 hover:bg-yellow-200 "
            // onClick={(e) => {
            //   paycomlete();
            //   setInitialStatus("Completed");
            // }}
          >
            {initialStatus}
          </button>
        )}
        {status === "accepted" && type === "Private show" && (
          <button
            className="text-xs bg-yellow-500 rounded-lg p-2 shadow shadow-black mt-1 active:bg-yellow-300 hover:bg-yellow-200 "
            // onClick={(e) => {
            //   let today = Date.now();
            //   if (today >= date) {
            //     toast.info("your private call schedule not yet time", {
            //       autoClose: false,
            //     });
            //     return;
            //   }
            //   console.log("creator price " + amount);
            //   let creatorid2 = [
            //     creatoruserid,
            //     userid,
            //     "caller",
            //     profilename,
            //     amount,
            //     balance,
            //   ];
            //   dispatch(add_call_data(creatorid2));
            //   navigate(`/privatecall`);
            // }}
          >
            Start Fan call
          </button>
        )}
      </div>

      {status === "pending" && (
        <CancelReq_frag setbutton={setdelB_click} cancel_req={()=>{console.log("Accepted list")}} />
      )}

      <div className="w-full flex justify-between">
        {true && ( //is aprovebuton
          <button > {/*onClick={(e) => setreviewbutt(!reviewbutt)}*/}
            <div>
              <div className="flex justify-center">
                <img
                  alt="reviewicon"
                  src={"/icons/icons8-review.png"}
                  className="object-cover w-5 h-5"
                ></img>
              </div>
              <p className="text-xs">Drop review</p>
            </div>
          </button>
        )}

        {/* {showbutton() && (
          <button onClick={(e) => ()=>{}()}>
            <img
              alt="deleteimg"
              src={deleteicon}
              className="w-4 h-4 object-cover mt-1"
            ></img>
          </button>
        )} */}
      </div>

      {true && ( // reviewbutt
        <div className="w-full items-center flex flex-col">
          <div className="flex justify-start"></div>
          <textarea
            className="rounded-md bg-slate-400 placeholder:text-white placeholder:text-xs placeholder:text-center w-1/2 h-14"
            placeholder="write review about this creator"
            // onInput={(e) => setrevcontent(e.currentTarget.value)}
          ></textarea>
          <button
            className="bg-green-500 mt-2 mb-2 p-2 text-xs rounded text-slate-50 shadow shadow-black"
            // onClick={(e) => reviewbutton()}
          >
            Send
          </button>
        </div>
      )}
    </li>
  );
};
