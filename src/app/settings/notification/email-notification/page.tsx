"use client"
import React, {useState, useEffect} from 'react'
import { FaAngleLeft } from "react-icons/fa";
import Switch from "../../_components/Switch";
import Head from '../../../../components/Head';
// import { useSelector, useDispatch } from "react-redux";
// import { updatesetting, ProfilechangeStatus , getprofile} from "../../app/features/profile/profile";


 const Emailnotification = () => {
  const [isOn, setIsOn] = useState(false); //emailnote
  const [notification, setnotification] = useState(false);

  // const router = useNavigate();
  // let updatesettingstats = useSelector((state) => state.profile.updatesettingstats);
  // let emailnote = useSelector((state) => state.profile.emailnote);
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
    console.log("toggle")
    // if(updatesettingstats !== "loading"){
     
    //   dispatch(updatesetting({token, userid,pushnot:"nothing",emailnot:!isOn}))
    // }
  }

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
    </div>
   
    </div>
  )
}

export default Emailnotification
