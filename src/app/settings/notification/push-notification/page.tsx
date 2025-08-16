"use client"
import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import Switch from "../../_components/Switch";
import { useRouter } from "next/navigation";
import NavigateBack from "../../_components/NavigateBtn";
import Head from "../../../../components/Head";
    // import { useSelector, useDispatch } from "react-redux";
    // import { updatesetting, ProfilechangeStatus,getprofile } from "../../app/features/profile/profile";
    // import WebPushService from "../../api/webPush"


 const PushNotificationPage = () => {
  const router = useRouter();
  const [isOn, setIsOn] = useState(false);
  // let updatesettingstats = useSelector((state) => state.profile.updatesettingstats);
  // let pushnote = useSelector((state) => state.profile.pushnote);
  // const [notification, setnotification] = useState(false);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const userid = useSelector((state) => state.register.userID);
  // const dispatch = useDispatch()

  // useEffect(()=>{
  //   if(updatesettingstats === "succeeded"){
  //     dispatch(getprofile({ userid }));
  //     setIsOn(!isOn)
      
  //     dispatch(ProfilechangeStatus("idle"))
  //   }
  // },[updatesettingstats])
  
 
  const handleToggle = () => {
    console.log("handleToggle fn")
    // let pushsubinfo = ""
    // if(updatesettingstats !== "loading"){
    //   let isnote = !isOn
    //   try{
    //     if(isnote === false){
    //       console.log("inside false")
    //       const payload = await WebPushService.unsubscribe()
    //       dispatch(updatesetting({token, userid,emailnot:"nothing",pushnot:!isOn,subinfo:pushsubinfo}))
  
    //     }
        
    //     if(isnote === true){
    //       console.log("inside true")
    //       if(!WebPushService.hasPermission()){
    //          console.log("ontop request permissin")
    //         await WebPushService.requestPermission()
    //         console.log("inside permission")
    //       }
        
    //       let subcription = await WebPushService.getSubscription()
    //       console.log("after subcribtionget")
    //       if(!subcription){
    //         console.log("ontop subcribe")
    //         subcription = await WebPushService.subscribe()
    //         console.log("after subcribe")
    //       }


    //       dispatch(updatesetting({token, userid,emailnot:"nothing",pushnot:!isOn,subinfo:JSON.stringify(subcription)}))

          
    //     }
  

    //   }catch(e){
    //     console.log("error subcribe"+e)
    //   }
    
     
      
    // }
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