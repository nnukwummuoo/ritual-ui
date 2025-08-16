import React, { createContext, useContext, useState, ReactNode } from "react";

type CallContextValue = {
  trackopen: boolean;
  settrackOpens: (value: boolean) => void;
  closehomeopts: () => void;
  isReceivingCall: boolean;
  triggerCall: (value: boolean) => void;
  acceptCall: () => void;
  declineCall: () => void;
  setaccept: React.Dispatch<React.SetStateAction<boolean>>;
  accept: boolean;
  setcancel: React.Dispatch<React.SetStateAction<boolean>>;
  cancel: boolean;
  setcallername: React.Dispatch<React.SetStateAction<string>>;
  callarname: string;
  closeOption: () => void;
  toggleoption: () => void;
  opening: boolean;
};

const CallContext = createContext<CallContextValue | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode }) => {
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

  const triggerCall = (value: boolean) => setIsReceivingCall(value);
  const acceptCall = () => {
   setaccept(true)
  }; // Logic to accept call
  const declineCall = () => {
   setcancel(true)
  }; // Logic to decline call

  const settrackOpens = (value: boolean)=>{
    settrackopen(value)
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

export const useCall = (): CallContextValue => {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return ctx;
};
