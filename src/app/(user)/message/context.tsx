import { set } from "date-fns";
import React, { createContext, useContext, useState } from "react";
import { set_calling } from "../../app/features/message/messageSlice";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [cancel, setcancel] = useState(false);
  const [accept, setaccept] = useState(false);
  const [callarname, setcallername] = useState("");
  const [opening, setopening] = useState(false);
  const [trackopen, settrackopen] = useState(false);
  const closeOption = () => {

    if(opening === true){
      setopening(false)
    }
   
  }; // Logic to accept call

  const toggleoption = () => {
    setopening(!opening)
   }; 

  const triggerCall = (value) => setIsReceivingCall(value);
  const acceptCall = () => {
   setaccept(true)
  }; // Logic to accept call
  const declineCall = () => {
   setcancel(true)
  }; // Logic to decline call

  const settrackOpens = (set)=>{
    settrackopen(set)
  }

  const closehomeopts = ()=>{
    if(trackopen === true){
      settrackopen(false)
    }
    
  }

  return (
    <CallContext.Provider
      value={{ trackopen,settrackOpens,closehomeopts,isReceivingCall, triggerCall, acceptCall, declineCall, setaccept, accept, setcancel, cancel,setcallername,callarname,closeOption, toggleoption,opening}}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
