import React, { createContext, useContext, useState } from "react";
// import { set } from "date-fns";
// import { set_calling } from "../../app/features/message/messageSlice";

interface CallContextType {
  isReceivingCall: boolean;
  triggerCall: (value: boolean) => void;
  acceptCall: () => void;
  declineCall: () => void;
  setaccept: (value: boolean) => void;
  accept: boolean;
  setcancel: (value: boolean) => void;
  cancel: boolean;
  setcallername: (value: string) => void;
  callarname: string;
  closeOption: () => void;
  toggleoption: () => void;
  opening: boolean;
  settrackOpens: (set: boolean) => void;
  trackopen: boolean;
  closehomeopts: () => void;
}
const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: {children: React.ReactNode}) => {
  const [isReceivingCall, setIsReceivingCall] = useState<boolean>(false);
  const [cancel, setcancel] = useState<boolean>(false);
  const [accept, setaccept] = useState<boolean>(false);
  const [callarname, setcallername] = useState<string>("");
  const [opening, setopening] = useState<boolean>(false);
  const [trackopen, settrackopen] = useState<boolean>(false);
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

  const settrackOpens = (set: boolean) => {
    settrackopen(set)
  }

  const closehomeopts = () => {
    if (trackopen === true) {
      settrackopen(false)
    }
    
  }

  return (
    <CallContext.Provider
      value={{ 
        trackopen, 
        settrackOpens, 
        closehomeopts, 
        isReceivingCall, 
        triggerCall, 
        acceptCall, 
        declineCall, 
        setaccept, 
        accept, 
        setcancel, 
        cancel, 
        setcallername, 
        callarname, 
        closeOption, 
        toggleoption, 
        opening }}
    >
      {children}
    </CallContext.Provider>
  );
};

// export const useCall = () => useContext(CallContext);
export function useCallContext() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
