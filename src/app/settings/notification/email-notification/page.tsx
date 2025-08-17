"use client"
import React, {useState, useEffect} from 'react'
import { FaAngleLeft } from "react-icons/fa";
import Switch from "../../_components/Switch";
import Head from '../../../../components/Head';
import { useDispatch, useSelector } from "react-redux";
import { updatesetting, ProfilechangeStatus , getprofile} from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";


 const Emailnotification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const updatesettingstats = useSelector((s: RootState) => s.profile.updatesettingstats);
  const emailnote = useSelector((s: RootState) => s.profile.emailnote);
  const pushnote = useSelector((s: RootState) => s.profile.pushnote);
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);

  const [isOn, setIsOn] = useState(false); // mirrors emailnote

  // Hydrate local toggle from store
  useEffect(() => {
    setIsOn(Boolean(emailnote));
  }, [emailnote]);

  // After successful update, refresh profile and reset status
  useEffect(() => {
    if (updatesettingstats === "succeeded") {
      if (userid) dispatch(getprofile({ userid, token }));
      dispatch(ProfilechangeStatus("idle"));
    }
  }, [updatesettingstats, dispatch, userid, token]);

  const handleToggle = () => {
    if (!userid) return;
    const nextEmail = !isOn;
    // Send both flags so backend has full context
    dispatch(
      updatesetting({ userid, emailnot: nextEmail, pushnot: Boolean(pushnote) })
    );
    // Optimistic UI toggle; will be confirmed by profile refresh
    setIsOn(nextEmail);
  };

  return (
    <div className="w-screen px-3 mx-auto text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 pt-14 md:pt-6 md:px-0">
  
    <div className='flex flex-col w-full'>
    <Head heading='Email NOTIFICATION' />
    <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-white text-md">
          Receive notification on your email
          </h4>
        </div>
        <div>
          <Switch isOn={isOn} handleToggle={handleToggle} />
        </div>
      </div>
      {updatesettingstats === "loading" && (
        <p className="mt-2 text-sm text-slate-400">Saving…</p>
      )}
    </div>
   
    </div>
  )
}

export default Emailnotification

