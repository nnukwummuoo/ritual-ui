"use client";

import React, { useState, useEffect, JSX } from "react";
import searchIcon from "@/icons/searchicon.svg";
import sendIcon from "@/icons/emailsendIcon.svg";
import PacmanLoader from "react-spinners/RingLoader";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { List_of_users } from "@/components/admin/user/List_of_users";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  gender: string;
  country: string;
  photolink: string;
}

let mark_user: string[] = [];

export default function Users(): JSX.Element {
  const [male_click, setmale_click] = useState(false);
  const [female_click, setfemale_click] = useState(false);
  const [showall_click, setshowall_click] = useState(false);
  const [markall, setmarkall_click] = useState(false);
  const [mark_click, setmark_click] = useState(false);
  const [alluser_list, setalluser_list] = useState<User[]>([]);
  const [user_list, setuser_list] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [color] = useState("#d49115");
  const [display, setdisplay] = useState(false);
  const [search_text, set_search_text] = useState("");

  const router = useRouter();

  // Simulated admin and token
  const token = "fake_token";
  const admin = true; // set false to test redirect

  async function getAllUsers(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch("/api/users"); // Replace with your real API endpoint
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setuser_list(data);
      setalluser_list(data);
      setdisplay(true);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkadmin();
    getAllUsers();
  }, []);

  const diplay_users = () => {
    if (!loading) {
      if (alluser_list.length > 0) {
        return (
          <div className="w-full">
            <ul className="w-full p-2">
              {alluser_list.map((value) => (
                <List_of_users
                  key={value._id}
                  mark={mark_click}
                  markall={markall}
                  firstname={value.firstname}
                  lastname={value.lastname}
                  gender={value.gender}
                  country={value.country}
                  id={value._id}
                  photolink={value.photolink}
                  mark_user={mark_user}
                />
              ))}
            </ul>
          </div>
        );
      } else {
        return (
          <div className="w-full h-16 flex justify-center mt-16">
            <p className="text-yellow-500 text-xs">No registered user yet!!!</p>
          </div>
        );
      }
    }
    return null;
  };

  const checkadmin = () => {
    if (!admin) {
      router.push("/");
    }
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto bg-gray-900">
      <div className="w-full h-full flex flex-col items-center md:w-2/4 mt-16 md:mt-0">
        <p className="text-yellow-500 font-bold border border-b-2 border-t-0 border-r-0 border-l-0 border-yellow-500">
          List Of App Users
        </p>

        {loading && (
          <div className="flex flex-col items-center mt-16 w-full">
            <PacmanLoader
              color={color}
              loading={loading}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="text-yellow-500 text-xs">fetching all user...</p>
          </div>
        )}

        <ToastContainer position="top-center" theme="dark" />

        {display && (
          <div className="w-full">
            <div className="w-full flex-col pl-2 mb-2">
              {/* Search */}
              <div className="flex mt-2">
                <label className="text-white mr-2 text-sm font-bold">
                  Name or Email
                </label>
                <input
                  type="text"
                  className="rounded-lg bg-slate-400 placeholder:text-slate-600 placeholder:text-xs mr-1 pl-1 placeholder:text-center"
                  placeholder="search by name/email"
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    if (val) {
                      set_search_text(val);
                      const filtered = user_list.filter((value) => {
                        let name = `${value.firstname} ${value.lastname}`;
                        let name1 = `${value.lastname} ${value.firstname}`;
                        return (
                          value.firstname.toLowerCase().trim() ===
                            val.toLowerCase().trim() ||
                          value.lastname.toLowerCase().trim() ===
                            val.toLowerCase().trim() ||
                          val === name ||
                          val === name1 ||
                          val.toLowerCase().trim() ===
                            value.email.toLowerCase().trim()
                        );
                      });
                      setalluser_list(filtered.length ? filtered : user_list);
                    } else {
                      setalluser_list(user_list);
                    }
                  }}
                />
                <button
                  className="bg-yellow-500 w-fit h-fit rounded-full"
                  onClick={() => {
                    if (search_text) {
                      const filtered = user_list.filter((value) => {
                        let name = `${value.firstname} ${value.lastname}`;
                        let name1 = `${value.lastname} ${value.firstname}`;
                        return (
                          value.firstname.toLowerCase().trim() ===
                            search_text.toLowerCase().trim() ||
                          value.lastname.toLowerCase().trim() ===
                            search_text.toLowerCase().trim() ||
                          search_text === name ||
                          search_text === name1 ||
                          search_text.toLowerCase().trim() ===
                            value.email.toLowerCase().trim()
                        );
                      });
                      setalluser_list(filtered.length ? filtered : user_list);
                    }
                  }}
                >
                  <img alt="searchIcon" src={searchIcon.src} />
                </button>
              </div>

              {/* Gender Filter */}
              <div className="flex ">
                <label className="text-white mr-2 text-sm font-bold">
                  Filter by Gender:
                </label>
                <div className="flex">
                  <label className="text-white text-xs mt-1 font-bold">
                    Male
                  </label>
                  <input
                    type="radio"
                    className=" mr-2 mt-1"
                    checked={male_click}
                    onClick={() => {
                      setfemale_click(false);
                      setmale_click(true);
                      setshowall_click(false);
                      const filtered = user_list.filter(
                        (v) => v.gender.toLowerCase().trim() === "male"
                      );
                      setalluser_list(filtered.length ? filtered : user_list);
                    }}
                  />
                  <label className="text-white text-xs mt-1 font-bold">
                    Female
                  </label>
                  <input
                    type="radio"
                    className="mt-1"
                    checked={female_click}
                    onClick={() => {
                      setmale_click(false);
                      setfemale_click(true);
                      setshowall_click(false);
                      const filtered = user_list.filter(
                        (v) => v.gender.toLowerCase().trim() === "female"
                      );
                      setalluser_list(filtered.length ? filtered : user_list);
                    }}
                  />
                  <label className="text-white text-xs ml-2 mt-1 font-bold">
                    Show all
                  </label>
                  <input
                    type="radio"
                    className="mt-1 "
                    checked={showall_click}
                    onClick={() => {
                      setmale_click(false);
                      setfemale_click(false);
                      setshowall_click(true);
                      setalluser_list(user_list);
                    }}
                  />
                </div>
              </div>

              {/* Mark Options */}
              <div className="text-white flex">
                <label className="text-white text-sm font-bold">Mark all</label>
                <input
                  type="radio"
                  className=" ml-1"
                  checked={markall}
                  onClick={() => {
                    setmark_click(false);
                    setmarkall_click(true);
                    mark_user = alluser_list.map((v) => v._id);
                  }}
                />
              </div>
              <div className="text-white flex">
                <label className="text-white text-sm font-bold">Mark</label>
                <input
                  type="radio"
                  className=" ml-1"
                  checked={mark_click}
                  onClick={() => {
                    setmarkall_click(false);
                    setmark_click(true);
                    mark_user = [];
                  }}
                />
              </div>

              {/* Send Notification */}
              <button
                className="text-white flex bg-blue-500 p-1 rounded-full shadow shadow-white hover:bg-blue-400 active:bg-blue-300"
                onClick={() => {
                  if (mark_user.length <= 0) {
                    toast.info("select user to continue", { autoClose: 2000 });
                  } else {
                    // console.log("Send notification to:", mark_user);
                    router.push("/messageusers");
                  }
                }}
              >
                <label className="text-white text-sm font-bold">
                  send Notification
                </label>
                <img alt="sendicon" src={sendIcon.src} />
              </button>
            </div>
            {diplay_users()}
          </div>
        )}
      </div>
    </div>
  );
}
