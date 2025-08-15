"use client"
import React, {useState, useEffect} from 'react'
// import { FaAngleLeft } from "react-icons/fa";
// import { Listofblockusers } from './components/Listofblockusers';
// import { getblockedUsers, ProfilechangeStatus } from '../../app/features/profile/profile';
import PacmanLoader from "react-spinners/RotateLoader";
// import { useDispatch, useSelector } from 'react-redux';
import Head from '../../../../components/Head';

 const Blockusers = () => {
    // let blockuserstats = useSelector((state) => state.profile.blockuserstats);
    // let listofblockuser = useSelector((state) => state.profile.listofblockuser);
    // const userid = useSelector((state) => state.register.userID);
    // const token = useSelector((state) => state.register.refreshtoken);
    const [loading, setloading] = useState(true);
    let [color, setColor] = useState("#d49115");
    // const dispatch = useDispatch()

    // let showcontent = ()=>{
    //    if(loading === false){
    //     if(listofblockuser.length > 0){
          
    //       return(
    //           <div className="grid grid-cols-2 gap-2 p-2 mb-3 ">
    //               {
    //                   listofblockuser.map((value,index)=>{
    //                       return <Listofblockusers id={value.id} photolink={value.photolink} location={value.location} online={value.online} name={value.name} key={index}/>
    //                   })
    //               }
  
    //           </div>
    //       )
    //   }else{
    //       return <div className='w-full'>
  
    //              <p className='w-full mt-16 text-xs text-center text-yellow-200'>No Blocked user!</p>
  
    //              </div> 
    //   }
    //    }
       
    
    // }

    // useEffect(()=>{
    //   if(blockuserstats !== "loading"){
    //     dispatch(getblockedUsers({token,userid}))
    //   }
    // },[])

    // useEffect(()=>{
    //   if(blockuserstats === "succeeded"){
    //     setloading(false)
    //     dispatch(ProfilechangeStatus("idle"))
    //   }
    // },[blockuserstats])
 
    return (
      <div className="w-screen mx-auto mt-16 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-6">
  
      <div className='flex flex-col w-full'>
      <Head heading='List Of blocked users' />
      {loading && (
                <div className="flex flex-col items-center w-full">
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

     {/* {showcontent()} */}
      </div>
      
    </div>
  )
}

export default Blockusers
