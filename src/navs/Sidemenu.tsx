"use client"
import "./Navs.css";
import { useRouter } from "next/navigation";
import MenuIconImg from "@/components/MenuIcon-img";
import { useMenuContext } from "@/lib/context/MenuContext";
import Profile from "@/components/Profile";
import { FaCoins } from "react-icons/fa";
import OpenMobileMenuBtn from "@/components/OpenMobileMenuBtn";
import { FaAngleRight } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import handleLogout from "@/lib/service/logout";
import { useUserId } from "@/lib/hooks/useUserId";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

 const Sidemenu = () => {
 const [minimize, setMinimize] = useState(false);
 const userId = useUserId();

 // Debug: log userId changes in Sidemenu
 useEffect(() => {
   // eslint-disable-next-line no-console
   console.log("[Sidemenu] userId changed:", userId);
 }, [userId]);

  const router = useRouter();
  const exclusive_verify = true
  const modelID = "random_id_123" // useSelector((state) => state.profile.modelID);
  const model = true // useSelector((state) => state.profile.model);
  const firstname = useSelector((s: RootState) => s.profile.firstname) || "User";
  const upgrade = true// const [upgrade, setUpgrade] = useState(false);
  const isModel = true
  const gold_balance = 0 // const [gold_balance, setgold_balance] = useState("");
  const admin = true // useSelector((state) => state.profile.admin);
    const { open, toggleMenu: handleMenubar } = useMenuContext();
  //         <MenuIconImg
  //           src="/icons/icons8-model.png"
  //           name="Model portfolio"
  //           url={`/modelbyid/${modelID}`}
  //         />
  //       );
  //     } else {
  //       return (
  //         <MenuIconImg
  //           src="/icons/icons8-model.png"
  //           name="Model portfolio"
  //           url="/createmodel"
  //         />
  //       );
  //     }
  // const [profile_photo, setprofile_photo] = useState(profileIcon);
  // const photo = useSelector((state) => state.comprofile.profilephoto);
  // const postuserid = useSelector((state) => state.register.userID);
  // const balance = useSelector((state) => state.profile.balance);
  // const exclusive_verify = useSelector(
  //   (state) => state.profile.exclusive_verify
  // );
  // // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [live, setLive] = useState(false);
  // const formatter = new Intl.NumberFormat("en-US");
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (photo) {
  //     setprofile_photo(photo);
  //   }

  //   if (balance) {
  //     let gold_b = formatter.format(parseFloat(balance));
  //     setgold_balance(gold_b);
  //   } else {
  //     setgold_balance("0");
  //   }
  // });

  // const location = useLocation().pathname;
  // const loggedInUser = useAuth();

  // const Isnotmodel = () => {
  //   if (!model) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const Ismodel = () => {
  //   if (model) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  const verify = () => {
    if (!exclusive_verify) {
      if (model) {
        return (
          <MenuIconImg
            src="/icons/icons8-model.png"
            name="Model portfolio"
            url={`/modelbyid/${modelID}`}
          />
        );
      } else {
        return (
          <MenuIconImg
            src="/icons/icons8-model.png"
            name="Model portfolio"
            url="/createmodel"
          />
        );
      }
    } else {
      return (
        <MenuIconImg
          src="/icons/icons8-plus.png"
          name="Model Application"
          url="/be-a-model"
        />
      );
    }
  };

  return (
    <div className="fixed z-50">
      
      <div className="p-2">
        <nav
          onClick={handleMenubar}
          className={`${
            open ? "show" : "hide"
          } sm:block menu-width origin-top-right mr mt pt px-2 py-4 h-fit bg-gray-900 text-white fixed rounded-l-lg rounded-r-2xl z-[70] `}
        >
          <div className="absolute -top-3 right-0 w-fit cls-btn">
            <OpenMobileMenuBtn />
          </div>
          <div className="overflow-hidden">
            <div className={`${minimize ? "minimize" : "maximize"} mt-4 transition-all duration-500 flex flex-col items-start ml-1 mr-1 p-2 divider relative overflow-hidden`}>
              <button onClick={() => setMinimize(!minimize)} className="top-0 -right-1 text-gray-400 absolute p-2 text-lg"><p className="absolute top-0 right-0 w-full h-full mini-btn"></p>{minimize ? <FaAngleRight /> :  <FaAngleDown />}</button>
              <div className="flex justify-between w-full ">
                <div className="flex text-xs  text-blue-200 mb-3 w-full">
                  {/* <p className="font-bold">Welcome, {firstname}</p> */}
                  <Profile
                    src="/icons/icons8-profile_user.png"
                    name={firstname}
                    url={userId ? `/Profile/${userId}` : `/Profile`}
                  />
                </div>

                {/* <div className="flex p-1 "> */}
                {/* <button onClick={(e) => { */}
                {/* e.stopPropagation(); */}
                {/* setIsModalOpen(true) */}
                {/* }}> */}

                {/* <IoIosTimer /> */}
                {/* </button> */}
                {/* <img alt="onlineIcon" src={onlineIcon} className="mb-2"></img> */}
                {/* </div> */}
              </div>
              {/* time modal */}

              <div className="cstm-flex gap-4 items-start w-full mt-4">
                <button className="flex gap-2 items-center justify-center font-bold text-sm w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"><FaCoins /> <span>Get More Golds</span></button>
                <button className="cstm-boder w-full rounded-lg py-3 text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent bg-inherit flex gap-2 items-center justify-center transition-transform duration-300 hover:scale-105"> <span>Upgrade Account</span></button>
              </div>
            </div>
            {/* <hr className="w-full my-3 bg-blue-900 "></hr> */}

            <div className="grid-sys text-xs  text-blue-100">
               {/* onClick={(e) => {
                //   if (location === `/profile/${postuserid}`) { for profile reset
                //     return;
                //   }
                //   dispatch(resetprofilebyid());
                // }} */}
              <MenuIconImg 
                src="/icons/icons8-customer.gif" 
                name="Profile" 
                url={userId ? `/Profile/${userId}` : `/Profile`} />

              {verify()}

              <MenuIconImg 
                  src="/icons/icons8-users.png" 
                  name={"Following"} 
                  url="/following" />

              {/* <button
                className="flex flex-col items-center"
                onClick={(e) => router.push("/editprofile")}
              >
                <img
                  alt="editIcon"
                  src={IconsEdit}
                  className="object-cover w-7 h-7"
                ></img>
                <p className="mt-1 ml-1">Edit porfile</p>
              </button> */}

              <MenuIconImg 
                  src="/icons/icons8-collection.png" 
                  name={"Collections"} 
                  url="/collections" />
              <MenuIconImg 
                  src="/icons/icons8-gold.png" 
                  name={"Gold Stats"} 
                  url="/goldstat/history" />

              {/* <button
                className="flex flex-col items-center"
                // onClick={(e) => {
                //   e.stopPropagation();
                //   setIsModalOpen(true);
                // }}
                onClick={(e) => router.push("")}
              >
                <img
                  alt="IconsPending"
                  src={"/icons/"}
                  className="object-cover w-7 h-7"
                ></img>
                <p className="mt-1 ml-1"> </p>
              </button> */}
              <MenuIconImg 
                  src="/icons/icons8-receipts.gif" 
                  name={"Transactions"} 
                  url="/earning" />
              {!admin &&
                <MenuIconImg 
                  src="/icons/icons8-admin.png" 
                  name={"Admin"} 
                  url="/admin" />
              }

              <MenuIconImg 
                  src="/icons/icons8-gift.gif" 
                  name={"Whats New"} 
                  url="/change-log" />

              <div onClick={handleLogout} className="flex flex-col items-center group cursor-pointer">
              <img
                  alt={"Logout"}
                  src={"/icons/icons8-log-out.png"}
                  style={{
                      display: "block",
                      verticalAlign: "middle"
                  }}
                  className={`object-cover w-7 h-7 bg-slate-900`}
                  />
                  <p className="mt-1 text-center group-hover:text-gray-400">Log Out</p>
              </div>
            </div>

            {/* <hr className="w-full mt-1 bg-blue-900 ht"></hr> */}
            <div className="flex flex-col items-start ml-1 mr-1 text-xs  text-white">
              {/* <button
                className="flex flex-col items-center"
                onClick={(e) => router.push("/goldstats")}
              >
                <img
                  alt="goldIcon"
                  src={goldIcon}
                  className="object-cover w-7 h-7"
                ></img>
                <p className="mt-1 ml-1"> Gold Stats</p>
              </button> */}
            </div>

            {/* {admin && ( */}
            {/* // <div> */}
            {/* <hr className="w-full mt-1 bg-blue-900 ht"></hr> */}

            {/* <div className="flex flex-col items-start ml-1 mr-1 text-xs  text-white"> */}

            {/* <button className="flex mt-2"
                    onClick={(e) => router.push("/ad_min")}>
                    <img
                      alt="adminn"
                      src={adminn}
                      className="object-cover w-7 h-7"
                    ></img>
                    <p className="mt-1 ml-1">Admin</p>
                  </button> */}
            {/* </div> */}
            {/* </div> */}
            {/* )} */}

            {/* <hr className="w-full mt-1 bg-blue-900 ht"></hr> */}

            <div className="flex flex-col items-start mb-2 ml-1 mr-1 text-xs  text-white">
              {/* <button className="flex mt-3" onClick={(e) => logout()}>
                <img
                  alt="logoutIcon"
                  src={logoutIcon}
                  className="object-cover w-7 h-7"
                ></img>
                <p className="mt-1 ml-1">Log out</p>
              </button> */}
            </div>
          </div>
        </nav>
      </div>

      
    </div>
  );
};

export default Sidemenu