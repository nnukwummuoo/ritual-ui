"use client";
import React, { useState } from "react";
import "@/styles/Navs.css";
import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "../hooks/useAuth";
// import { useDispatch, useSelector } from "react-redux";
// import Search from "@public/icons/icons8-search-2.png";
// import Home from "@public/icons/icons8-home.png";
// import NotificationIcon from "@public/icons/icons8-notification-1.png";
// import Message from "@public/icons/icons8-message.png";
// import {
//   setlastnote,
//   setmessagelastnote,
// } from "../app/features/profile/profile";
// import { useLocation } from "react-router-dom";
// import homeicon from "../icons/homeIcon.svg";
// import searchIcon from "../icons/searchIcon1.svg";
// import notificationIcon from "../icons/notificationIcon.svg";
// import postIcon from "../icons/postIcon.svg";
// import messageIcon from "../icons/messageIcon.png";
// import notifymeIcon from "../icons/notifymeIcon.svg";
// import Menu from "../icons/icons8-menu.png"

export const BottomNav = () => {
  const router = useRouter();
  const notificationsCount: number = 5; // This should be replaced with actual state management logic to get the count of notifications
  const open = true; // This should be replaced with actual state management logic to determine if the nav is open
  // const login = useSelector((state) => state.register.logedin);
  // const msgnitocations = useSelector((state) => state.message.msgnitocations);
  // const lastmessage = useSelector((state) => state.message.lastmessage);
  // const bookingnote = useSelector((state) => state.booking.bookingnote);
  // let pushnote = useSelector((state) => state.profile.pushnote);
  // let lastmessagenote = useSelector((state) => state.profile.lastmessagenote);
  // let lastnote = useSelector((state) => state.profile.lastnote);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
    // const notificationCount = notCount();
  // const user = useAuth();
  // const Allrequest = useSelector((state) => state.booking.Allrequest);
  // const req = [...Allrequest];
  // const notificationsCount = user?.creator_listing
  //   ? req.filter((item) => item.status === "accepted" || item?.admindb === true)
  //       .length
  //   : req.length;

  //#4287f5
  const [homecolor, sethomecolor] = useState("#c2d0e1");
  const [creatorcolor, setcreatorcolor] = useState("");
  const [notificationcolor, setnotificationcolor] = useState("");
  const [messagecolor, setmessagecolor] = useState("");
  const [viewed, setViewed] = useState(false);
  const pathname: string = usePathname()

  // const [activeTab, setActiveTab] = useState("home");
  // const location = useLocation();

  // const allowedMobileRoutes = [
  //   "/",
  //   "/search",
  //   "/notifications/allview/",
  //   "/messages/recentmessage",
  // ];
  // const isAllowedMobileRoute = allowedMobileRoutes.includes(location.pathname);
  const getActiveTab = () => {
    if (pathname.includes("/messages")) return "message";
    if (pathname.includes("/notifications")) return "notify";
    if (pathname.includes("/search")) return "search";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleNavigation = (tab: "home" | "search" | "notify" | "message", path: string) => {
    // setActiveTab(tab);
    router.push(path);

    if (tab === "notify") {
      setViewed(true);
    }
  };

  // const checknotification = () => {
  //   if (msgnitocations.length > 0) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const messagecount = () => {
  //   const count = msgnitocations.length;
  //   if (count > 99) {
  //     return "99+";
  //   }
  //   return `${count}`;
  // };

  // useEffect(() => {
  //   if (pushnote === true) {
  //     console.log("will run notification");
  //     Notification.requestPermission().then((result) => {
  //       if (result === "granted") {
  //       }
  //     });
  //   }
  // }, [pushnote, bookingnote, msgnitocations]);

  // const notCount = () => {
  //   //   if ( viewed || !bookingnote) return 0;
  //   // const total = bookingnote.creator.length + bookingnote.notify.length;
  //   // return total > 99 ? "99+" : total;
  //   if (bookingnote) {
  //     return bookingnote.creator.length + bookingnote.notify.length;
  //   } else {
  //     return 0;
  //   }
  // };


  return (
    <div>
      {open && (
        <div style={{ flex: 4 }}>
          <div className="bottom-navs">
            <div className="bottom-nav">
              <button
                className="flex flex-col items-center"
                onClick={() => handleNavigation("home", "/")}
              >
                <img
                  src="/icons/icons8-home.png"
                  alt="Home"
                  className={`w-8 h-8 ${
                    activeTab === "home"
                      ? "filter brightness-100"
                      : "filter grayscale"
                  }`}
                />
              </button>
              <p
                className={`text-xs ${
                  activeTab === "home" ? "text-white" : "text-gray-500"
                }`}
              >
                Home
              </p>
            </div>

            <div className="bottom-nav">
              <button
                className="flex flex-col items-center"
                onClick={() => handleNavigation("search", "/search")}
              >
                <img
                  src="/icons/icons8-search-2.png"
                  alt="Search"
                  className={`w-8 h-8 ${
                    activeTab === "search"
                      ? "filter brightness-100"
                      : "filter grayscale"
                  }`}
                />
              </button>
              <p
                className={`text-xs ${
                  activeTab === "search" ? "text-white" : "text-gray-500"
                }`}
              >
                Search
              </p>
            </div>

            <div className="bottom-nav">
              <button
                className="relative flex flex-col items-center"
                onClick={() => handleNavigation("notify", "/notifications")}
              >
                <img
                  src="/icons/icons8-notification-1.png"
                  alt="Notifications"
                  className={`w-8 h-8 ${
                    activeTab === "notify"
                      ? "filter brightness-100"
                      : "filter grayscale"
                  }`}
                />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-500 text-black text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center border border-slate-800 px-1.5 py-0.5 shadow-md   ">
                    {notificationsCount}
                  </span>
                )}
              </button>
              <p
                className={`text-xs ${
                  activeTab === "notify" ? "text-white" : "text-gray-500"
                }`}
              >
                Notifications
              </p>
            </div>

            <div className="bottom-nav">
              <button
                className="relative flex flex-col items-center"
                onClick={() =>
                  handleNavigation("message", "/messages/recentmessage")
                }
              >
                <img
                  src="/icons/icons8-message.png"
                  alt="Messages"
                  className={`w-8 h-8 ${
                    activeTab === "message"
                      ? "filter brightness-100"
                      : "filter grayscale"
                  }`}
                />
                {/* {checknotification() && (
                  <span className="absolute -top-1 -right-1 bg-gray-500 text-black text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 py-1.5  shadow-md border border-slate-800">
                    {messagecount()}
                  </span>
                )} */}
              </button>
              <p
                className={`text-xs ${
                  activeTab === "message" ? "text-white" : "text-gray-500"
                }`}
              >
                Messages
              </p>
            </div>

            {/* <div className="bottom-nav">
          <button
                className="flex flex-col items-center"
                
            onClick={() => handleNavigation("home", "/")}
          >
            <AiFillHome
              className={`w-8 h-8 ${
                activeTab === "home" ? "text-white" : "text-gray-500"
              }`}
            />
          </button>
          <p className={` text-xs ${activeTab === "home" ? "text-white" : "text-gray-500" }` }>Home</p>
        </div>
          
        <div className="bottom-nav">
          <button
            className="flex flex-col items-center"
            onClick={() => handleNavigation("search", "/search")}
          >
            <AiOutlineSearch
              className={`w-8 h-8 ${
                activeTab === "search" ? "text-white" : "text-gray-500"
              }`}
            />
          </button>
          <p className={` text-xs ${activeTab === "search" ? "text-white" : "text-gray-500" }` }>Search</p>
        </div>
         
        <div className="bottom-nav">
          <button
            className="flex flex-col items-center"
            onClick={() => handleNavigation("notify", "/notifications")}
          >
            <AiOutlineBell
              className={`w-8 h-8 ${
                activeTab === "notify" ? "text-white" : "text-gray-500"
              }`}
            />
            {notCount() > 0 && (
              <span className="absolute -top-1 right-4  bg-gray-500 text-black text-xs font-bold rounded-full border border-slate-800 px-1.5 py-0.5 shadow">
                {notCount()}
              </span>
            )}
          </button>
          <p className={` text-xs ${activeTab === "notify" ? "text-white" : "text-gray-500" }` }>Notifications</p>
        </div>
        <div className="bottom-nav">
          <button
            className="flex flex-col items-center"
            onClick={() => handleNavigation("message", "/messages/recentmessage")}
          >
            <IoChatbubblesSharp
              className={`w-8 h-8 ${
                activeTab === "message" ? "text-white" : "text-gray-500"
              }`}
            />
            {checknotification() && (
              <p className="absolute w-5 h-5  bg-gray-500 text-black text-xs font-bold rounded-full border border-slate-800 px-1.5 py-0.5 shadow transform translate-x-3 -translate-y-3 m-auto">
                {messagecount()}
              </p>
            )}
          </button>
          <p className={` text-xs ${activeTab === "message" ? "text-white" : "text-gray-500" }` }>Messages</p>
        </div> */}
          </div>
        </div>
      )}
    </div>
  );
};
