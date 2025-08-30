"use client"
import React, { useState,useEffect, JSX } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa";
import { ToastContainer, toast } from "material-react-toastify";
// import { ChangePass, changeStatus } from "../../app/features/register/registerSlice";
import { useSelector, useDispatch } from "react-redux";
import PacmanLoader from "react-spinners/ClockLoader";
import { useRouter } from "next/navigation";


 const ChangePasswordPage = () => {

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setpassword] = useState("")
  const [newpassword, setnewpassword] = useState("")
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#d49115");
  
  // const chagepassword = useSelector(state=> state.register.chagepassword)
  // const userid = useSelector((state) => state.register.userID);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const dispatch = useDispatch()

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  const changepassword = ()=>{
    if(!newpassword || !password){
      toast.info("Fill in the two input boxes")
      return
    }

    if(newpassword.toLowerCase() !== password.toLowerCase()){
      toast.error("password mismatch")
      return
    }

    // if(chagepassword !== "loading"){
    //   setLoading(true)
    //   dispatch(ChangePass({id:userid,token,password, isuser:true}))
    // }
  }

  // useEffect(()=>{
  //   if(!userid){
  //     window.location.href = "/";
  //   }
  // },[])

  // useEffect(()=>{
  //   if(chagepassword === "succeeded"){
  //     setLoading(false)
  //     toast.success("password changed successfull")
  //     dispatch(changeStatus("idle"))
  //   }
  // },[chagepassword])

  return (
    <div className="px-3 mx-auto mt-16 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 md:px-0">
      <div className='flex flex-col w-full'>
      <ToastContainer position="top-center" theme="dark" />
      {/* Header */}
      <header className="flex items-center gap-4">
        <FaAngleLeft
          color="white"
          size={30}
          onClick={() => {
            router.push("/settings/account");
          }}
        />
        <h4 className="text-lg font-bold text-white">
          PASSWORD SECURITY AND SAFETY
        </h4>
      </header>

              {loading && (
                    <div className="relative z-10 flex flex-col items-center w-full mt-16 top-3/4">
                                <PacmanLoader
                                color={color}
                                loading={loading}
                                size={30}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                                // margin={"auto"}
                                />

                                <p className="font-bold text-yellow-500 jost ">wait a moment...</p>
                    </div>
                )}

      {/* Form */}
      <div className="w-full max-w-md mt-10 space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={false}
              className="w-full px-4 py-4 text-white bg-inherit border border-gray-600 rounded-md"
              onChange={(e)=>setpassword(e.currentTarget.value)}
            />
            <ToggleVisibilityBtn 
              toggleFn={togglePasswordVisibility} 
              isShow={showPassword} 
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={newpassword}
              disabled={false}
              className="w-full px-4 py-4 text-white bg-inherit border border-gray-600 rounded-md"
              onChange={(e)=>setnewpassword(e.currentTarget.value)}
            />
            <ToggleVisibilityBtn 
              toggleFn={toggleConfirmPasswordVisibility} 
              isShow={showConfirmPassword}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full max-w-md px-4 py-3 mt-6 font-medium text-black bg-white rounded-lg hover:bg-gray-500" onClick={changepassword}>
          Log out all devices and accounts
        </button>
      </div>
      </div>
    </div>
  );
};

function ToggleVisibilityBtn({toggleFn, isShow}: {toggleFn: () => void, isShow: boolean}): JSX.Element {
  return <button
          type="button"
          onClick={toggleFn}
          className="absolute inset-y-0 flex items-center text-gray-400 right-4 hover:text-white"
        >
          {isShow ? (
            <FaRegEyeSlash size={20} />
          ) : (
            <IoEyeOutline size={20} />
          )}
        </button>
}

export default ChangePasswordPage;