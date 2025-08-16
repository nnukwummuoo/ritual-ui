"use client"
import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import Switch from "../../_components/Switch";
import { useRouter } from "next/navigation";
import NavigateBack from "../../_components/NavigateBtn";
import Head from "../../../../components/Head";
import { useDispatch, useSelector } from "react-redux";
import { updatesetting, ProfilechangeStatus, getprofile } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";
// import WebPushService from "../../api/webPush"


 const PushNotificationPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const updatesettingstats = useSelector((s: RootState) => s.profile.updatesettingstats);
  const emailnote = useSelector((s: RootState) => s.profile.emailnote);
  const pushnote = useSelector((s: RootState) => s.profile.pushnote);
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const [isOn, setIsOn] = useState(false);

  // Hydrate local toggle from store
  useEffect(() => {
    setIsOn(Boolean(pushnote));
  }, [pushnote]);

  // After successful update, refresh profile and reset status
  useEffect(() => {
    if (updatesettingstats === "succeeded") {
      if (userid) dispatch(getprofile({ userid, token }));
      dispatch(ProfilechangeStatus("idle"));
    }
  }, [updatesettingstats, dispatch, userid, token]);
  
 
  const handleToggle = () => {
    if (!userid) return;
    const nextPush = !isOn;
    dispatch(
      updatesetting({ userid, emailnot: Boolean(emailnote), pushnot: nextPush })
    );
    setIsOn(nextPush);
  }

  return (
    <div className="px-3 mx-auto text-white pt-14 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:pt-6 md:px-0" >

    <div className='flex flex-col w-full'>
    <Head heading="PUSH NOTIFICATION" />
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-white text-md">
            Enable push notification on this device
          </h4>
        </div>
        <div>
          <Switch isOn={isOn} handleToggle={handleToggle} />
        </div>
      </div>
      {updatesettingstats === "loading" && (
        <p className="mt-2 text-sm text-slate-400">Saving…</p>
      )}
      <p className="py-2 mb-4 text-sm text-slate-400">
        Get push notification from your fans when you are not on
      </p>

      <div className="pt-4 border-t-2 border-slate-400">
        <div className="flex items-center justify-between mb-6 ">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-white">Promotion</h4>
          </div>
          <div>
            <Switch isOn={isOn} handleToggle={handleToggle} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 ">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-white">Message</h4>
        </div>
        <div>
          <Switch isOn={isOn} handleToggle={handleToggle} />
        </div>
      </div>
    </div>
     
    </div>
  );
};

export default PushNotificationPage