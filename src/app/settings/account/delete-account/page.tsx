"use client";
import React, { useEffect, useState } from "react";
import { CiWarning } from "react-icons/ci";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Head from "../../../../components/Head";
import { useDispatch, useSelector } from "react-redux";
import { deleteprofile, ProfilechangeStatus } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";

const DeleteaccountPage = () => {
  const [buttonstop, set_buttonstop] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const useridFromStore = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const deleteaccstats = useSelector((s: RootState) => s.profile.deleteaccstats);
  const testmsg = useSelector((s: RootState) => s.profile.testmsg);

  // Fallback userid if not in store (from prompt)
  const fallbackUserId = "689ef5dca5f754cf0de07e62";
  const userid = useridFromStore || fallbackUserId;

  const deleteClick = () => {
    if (deleteaccstats === "loading") return;
    set_buttonstop(true);
    dispatch(deleteprofile({ userid, token }))
      .unwrap()
      .then(() => {
        // handled in effect
      })
      .catch((err: any) => {
        // will also be handled in effect, but keep UX responsive
        toast.error(typeof err === "string" ? err : "Failed to delete account");
        set_buttonstop(false);
      });
  };

  useEffect(() => {
    if (deleteaccstats === "succeeded") {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("login");
        }
      } catch {}
      dispatch(ProfilechangeStatus("idle"));
      router.push("/");
    }

    if (deleteaccstats === "failed") {
      toast.error(testmsg || "Unable to delete account. Check internet connection.");
      dispatch(ProfilechangeStatus("idle"));
      set_buttonstop(false);
    }
  }, [deleteaccstats, dispatch, router, testmsg]);

  return (
    <div className="mx-auto mt-10 text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-4 ">
  
    <div className='flex flex-col w-full'>
    <div className="flex flex-col min-h-screen p-4 text-white">
        <Head heading="DELETE MY ACCOUNT" />       
        <div className="mt-5">
        <ToastContainer position="top-center" theme="dark" />
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
          <button
            className="w-full max-w-md px-4 py-2 mt-6 font-medium text-black bg-white rounded-lg hover:bg-gray-500 disabled:opacity-60"
            disabled={buttonstop || deleteaccstats === "loading"}
            onClick={deleteClick}
          >
            {deleteaccstats === "loading" ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div></div>  
    </div>
  );
};

export default DeleteaccountPage;