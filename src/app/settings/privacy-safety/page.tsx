"use client"
import React from "react";
import { LiaUserSlashSolid } from "react-icons/lia";
import Head from "../../../components/Head";
import { useRouter } from "next/navigation";
import { FaAngleRight } from "react-icons/fa";


const PrivacySafetyPage = () => {
  const router = useRouter()

  return (
    <div className="w-screen mx-auto text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
    
    <div className='flex flex-col w-full px-4 md:px-0 '>
    <Head heading="PRIVACY & SAFETY" />
      <p className="py-4 text-sm text-slate-400">
        See information about your account, change Password or learn more about
        your account deactivation
      </p>
      <div className="pt-4" onClick={()=>router.push("/settings/privacy-safety/blocked-users")}>
        <div className="flex items-center justify-between mb-6 ">
          <div className="flex items-center gap-2">
            <LiaUserSlashSolid color="white" size={30} />
            <h4 className="text-lg font-semibold text-white">Blocked users</h4>
          </div>
          <div>
            <FaAngleRight color="white" />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};


export default PrivacySafetyPage