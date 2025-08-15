"use client";
import React,{useState} from "react";
import { FaAngleLeft } from "react-icons/fa";
import { CiWarning } from "react-icons/ci";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import Head from "../../../../components/Head";
// import { deleteprofile, ProfilechangeStatus } from "../../app/features/profile/profile";
// import { useSelector, useDispatch } from "react-redux";
// import PacmanLoader from "react-spinners/RotateLoader";


 const DeleteaccountPage = () => {
   let [color, setColor] = useState("#d49115");
   let [buttonstop, set_buttonstop] = useState(false)
   const router = useRouter();
// const userid = useSelector((state) => state.register.userID);
// const token = useSelector((state) => state.register.refreshtoken);
// const deleteaccstats = useSelector((state) => state.profile.deleteaccstats);
// const testmsg = useSelector((state) => state.profile.testmsg);
// const [loading, setloading] = useState(false);
// const dispatch = useDispatch()

// const deleteClick = ()=>{
//   if(deleteaccstats !== "loading"){
//     setloading(true)
//     set_buttonstop(true)
//     dispatch(deleteprofile({userid,token}))
//   }
  
// }

// useEffect(()=>{
//   if(deleteaccstats === "succeeded"){
//     localStorage.removeItem('login')
//     dispatch(ProfilechangeStatus("idle"))
//     router("/")
//   }

//   if(deleteaccstats === "failed"){
//     toast.error(`${testmsg}`)
//     dispatch(ProfilechangeStatus("idle"))
    
//   }

// },[deleteaccstats])

  return (
    <div className="mx-auto mt-10 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 ">
  
    <div className='flex flex-col w-full'>
    <div className="flex flex-col min-h-screen p-4 text-white">
        <Head heading="DELETE MY ACCOUNT" />       
        <div className="mt-5">
        <ToastContainer position="top-center" theme="dark" />
        {/* {loading && (
                <div className="flex flex-col items-center w-full">
                    <PacmanLoader
                    color={color}
                    loading={loading}
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    />

                    <p className="text-xs">Deleting Please wait...</p>
                </div>
                )} */}
          <h4 className="mb-4">
            <span className="font-bold text-md ">PERMANENTILY DELETE</span> your
            account with all the data? All the data associated with your mmeko
            account will be permanently deleted
          </h4>
          <div className="w-full px-4 py-2 text-white bg-red-600 bg-opacity-25 border border-gray-600 rounded-md opacity-75 opacity-red-300">
            <div className="flex items-center w-full gap-4">
              <CiWarning />
              <h4>Warning! This cannnot be undone </h4>
            </div>
          </div>
          <button className="w-full max-w-md px-4 py-2 mt-6 font-medium text-black bg-white rounded-lg hover:bg-gray-500" disabled={buttonstop}> 
            {/*onClick={deleteClick}*/}
            Delete Account
          </button>
        </div>
      </div></div>  
    </div>
  );
};

export default DeleteaccountPage;