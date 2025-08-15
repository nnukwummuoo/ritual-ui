import React from "react";
import { useCall } from "./context";
import { useSelector } from "react-redux";
import { set_calling } from "../../app/features/message/messageSlice";

const GlobalCallModal = () => {
  const { isReceivingCall, acceptCall, declineCall, callarname } = useCall();

  let data = callarname.split(" ")

  let title = `${data[0]} ${data[1]}`
  let caller = `${data[2]}`

  // const dispatch = useDispatch()
  // const accept = () => {
  //   dispatch(set_calling(false))
  // }; // Logic to accept call


  // const decline = () => {
  //   dispatch(set_calling(false))
  
  // };

  if (!isReceivingCall) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-xl font-bold mb-2"> {title}</p>
        <p className="text-xl  mb-4"> {caller}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={acceptCall}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Accept
          </button>
          <button
            onClick={declineCall}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalCallModal;
