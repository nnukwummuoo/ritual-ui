import React, { useState, useEffect } from "react";
import PacmanLoader from "react-spinners/RotateLoader";
import dodoIcon from "../../../../icons/icons8-profile_Icon.png";
import person from "../../../../icons/person.svg";
// import { downloadImage } from "../../../../api/sendImage";
// import {
//   Cancelrequest,
//   deleterequest,
//   resetstat,
// } from "../../../../app/features/booking/booking";
// import { useSelector, useDispatch } from "react-redux";

interface Request {
  creatortype: string;
  creatorname: string,
  date: string,
  photolink: string,
  time: string,
  creator_portfolio_id: string,
  id: string,
  setRequests: ()=> void,
}
export function Requestlist({
  creatortype,
  creatorname,
  date,
  photolink,
  time,
  creator_portfolio_id,
  id,
  setRequests,
}: Request) {
  const [loading, setloading] = useState(false);
  let [color, setColor] = useState("#d49115");
  let [image, setimage] = useState(person);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const cancelstats = useSelector((state) => state.booking.cancelstats);
  // const userid = useSelector((state) => state.register.userID);
  // const dispatch = useDispatch();
  // const photo = useSelector((state) => state.comprofile.profilephoto);

  // useEffect(() => {
  //   setimage(photo);
  // }, []);

  // useEffect(() => {
  //   if (cancelstats === "succeeded") {
  //     dispatch(deleterequest({ creator_portfolio_id: creator_portfolio_id, date: date, time: time }));
  //     dispatch(resetstat());
  //     setloading(!loading);
  //   }

  //   if (cancelstats === "failed") {
  //     setloading(!loading);
  //   }
  // }, [cancelstats]);

  // const deleterequests = async () => {
  //   setloading(true);
  //   const res = await dispatch(
  //     Cancelrequest({
  //       token,
  //       userid,
  //       creator_portfolio_id,
  //       time,
  //       date,
  //       id,
  //     })
  //   );
  //   console.log(res);
  //   if (res.payload.ok) {
  //     setRequests?.((prev) => prev.filter((item) => item.id !== id));
  //   }
  //   setloading(false);
  // };

  return (
    <li className="bg-slate-300 p-1 w-full rounded-lg">
      {loading && (
        <div className="w-full flex flex-col items-center">
          <PacmanLoader
            color={color}
            loading={loading}
            size={10}
            aria-label="Loading Spinner"
            data-testid="loader"
          />

          <p className="text-xs">Please wait...</p>
        </div>
      )}

      <div className="flex">
        <img
          alt="creatorimg"
          src={image || dodoIcon}
          className="w-7 h-7 object-cover rounded-full"
        ></img>
        <div className="flex flex-col items-center ml-1 mt-1 p-1">
          <p className="bg-blue-100 text-xs">
            You requested a {`${creatortype}`} from {`${creatorname}`} on{" "}
            {`${date}`} at {`${time}`}
          </p>
          <button
            className="bg-red-600 p-1 mt-2 text-xs rounded-xl shadow-red-200 shadow-2xl"
            // onClick={(e) => deleterequests()}
          >
            Cancel request
          </button>
        </div>
      </div>
    </li>
  );
};
