import React, { useState, useEffect } from "react";
import profileIcon from "../icons/icons8-profile_Icon.png";
import onlineIcon from "../icons/onlineIcon.svg";
import personsidebar from "../icons/personsidebar.svg";
import addIcon from "../icons/addIcon.svg";
import folowIcon from "../icons/icons8-footprintIcon.png";
import editIcon from "../icons/edit.svg";
import goldIcon from "../icons/icons8.png";
import reportIcon from "../icons/reportIcon.svg";
import feedback from "../icons/feedback.png";
import settings from "../icons/settings.png";
import question from "../icons/question.png";
import globeearth from "../icons/globeearth.png";
import video from "../icons/video.png";
import star from "../icons/star.svg";
import verificationIcon from "../icons/verificationIcon.svg";
import withdrawIcon from "../icons/icons8-withdrawIcon.png";
import adminn from "../icons/adminn.png";
import usersIcon from "../icons/usersIcon.svg";
import logoutIcon from "../icons/logoutIcon.svg";
import { useSelector, useDispatch } from "react-redux";
import "./Navs.css";
import maleIcon from "../icons/man.png";
import femaleIcon from "../icons/woman.png";
import features from "../icons/features.svg";
import transIcon from "../icons/transIcon.svg";
import CoupleIcon from "../icons/usersIcon.svg";
import { MdOutlineCollectionsBookmark } from "react-icons/md";
import { IoIosTimer } from "react-icons/io";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/store/store";


// ✅ Type for props
interface ModelSideMenuProps {
  open: boolean;
  handleMenubar: () => void;
  handleGenderSearchQuery: (gender: string | null) => void;
}


export const ModelSideMenu: React.FC<ModelSideMenuProps> = ({
  open,
  handleMenubar,
  handleGenderSearchQuery,
}) => {
  const dispatch = useDispatch<AppDispatch>();


  const photo = useSelector((state : any) => state.comprofile.profilephoto);
  const firstname = useSelector((state : any

  ) => state.profile.firstname);
  const [profile_photo, setprofile_photo] = useState(profileIcon);
  const postuserid = useSelector((state : any) => state.register.userID);
  const balance = useSelector((state : any) => state.profile.balance);
  const modelID = useSelector((state : any) => state.profile.modelID);
  const model = useSelector((state : any) => state.profile.model);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upgrade, setUpgrade] = useState(false)
  const router = useRouter();
  const pathname = usePathname();
  
  const [gold_balance, setgold_balance] = useState("");
  const formatter = new Intl.NumberFormat("en-US");
  const admin = useSelector((state: any) => state.profile.admin);

  useEffect(() => {
    if (photo) {
      setprofile_photo(photo);
    }

    if (balance) {
      let gold_b = formatter.format(parseFloat(balance));
      setgold_balance(gold_b);
    } else {
      setgold_balance("0");
    }
  });

  const Isnotmodel = () => {
    if (!model) {
      return true;
    } else {
      return false;
    }
  };

  const Ismodel = () => {
    if (model) {
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("login");
    window.location.href = "/";
  };

  return (
    <div className="bg-red-300">
      <div>
        <nav
       
          onClick={handleMenubar}
          className={`${
            open ? "hidden" : "block"
          } sm:block sm:h-[80%] sm:w-[34.5rem] w-[80%] h-full bg-gray-900 text-white fixed 
         transform origin-top-right sm:rounded-l-lg z-40`}
        >
          <div className="overflow-auto">
            <div className="flex flex-col items-start ml-1 mr-1">
              <div className="flex justify-between w-full">
                <div className="flex text-xs font-bold text-blue-200 ">
                  <Image
                    alt="profileIcon"
                    src={profile_photo}
                    className="object-cover rounded-full w-7 h-7"
                  />
                  <p className="mt-1 ml-1">{firstname}</p>
                </div>

                <div className="flex p-1">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true)
                  }}>


                <IoIosTimer />
                  </button>
                </div>
              </div>

              {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-5 text-center bg-gray-300 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-gray-800">You have 0 golds pending</p>
            <button
              className="px-4 py-2 mt-4 text-white bg-orange-600 rounded font-semigold"
              onClick={() =>  setIsModalOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

              <div className="flex justify-between w-full text-xs font-bold text-blue-200">
                <div className="flex ">
                  <p className="mt-1 ml-1">status:</p>
                  <p className="mt-1 ml-3">Basic Member</p>
                </div>

                <button onClick={(e) => {e.stopPropagation(); setUpgrade(true)}}>
                <p className="mt-1 ml-3 hover:text-blue-400 active:text-blue-100">
                  (Upgrade)
                </p>
                </button>
              </div>
              {upgrade && (   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-5 px-10 text-center bg-gray-300 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-gray-800">Coming Soon</p>
            <button
              className="px-4 py-2 mt-4 text-white bg-orange-600 rounded font-semigold"
              onClick={() =>  setUpgrade(false)}
            >
              OK
            </button>
          </div>
        </div>)}

              <div className="flex justify-between w-full text-xs font-bold text-blue-200">
                <div className="flex ">
                  <p className="mt-1 ml-1">You have:</p>
                  <p className="mt-1 ml-3">{gold_balance} Golds</p>
                </div>

                <p
                  className="mt-1 ml-3 hover:text-blue-400 active:text-blue-100 bt"
                  onClick={(e) => router.push("/topup")}
                >
                  (Get More)
                </p>
              </div>
            </div>
            <hr className="w-full mt-1 bg-blue-900 ht"></hr>

            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button
                className="flex mt-3"
                onClick={() => handleGenderSearchQuery(null)}
              >
                <Image
                  alt="featuresImage"
                  src={features}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Featured</p>
              </button>

              <button
                className="flex mt-3"
                onClick={() => handleGenderSearchQuery("Woman")}
              >
                <Image
                  alt="femaleIcon"
                  src={femaleIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Women</p>
              </button>

              <button
                className="flex mt-3"
                onClick={() => handleGenderSearchQuery("Man")}
              >
                <Image
                  alt="maleIcon"
                  src={maleIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Men</p>
              </button>

              <button
                className="flex mt-3"
                onClick={() => handleGenderSearchQuery("Trans")}
              >
                <Image
                  alt="transIcon"
                  src={transIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Trans</p>
              </button>

              <button
                className="flex mt-3"
                onClick={() => handleGenderSearchQuery("Couple")}
              >
                <Image
                  alt="transIcon"
                  src={CoupleIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Couple</p>
              </button>
            </div>
            <hr className="w-full mt-1 bg-blue-900 ht"></hr>
            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button
                className="flex mt-3"
                onClick={(e) => router.push("/collections")}
              >
               <MdOutlineCollectionsBookmark className="w-6 h-6"/>
                <p className="mt-1 ml-1">My Collections</p>
              </button>
            </div>

            {admin && (
              <div>
                <hr className="w-full mt-1 bg-blue-900 ht"></hr>

                <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
                  <button className="flex mt-3">
                    <Image
                      alt="reportIcon"
                      src={reportIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Reports</p>
                  </button>

                  <button
                    className="flex mt-2"
                    onClick={(e) => {
                      router.push("/verifymodel");
                    }}
                  >
                    <Image
                      alt="verificationIcon"
                      src={verificationIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Model verification</p>
                  </button>

                  <button className="flex mt-2">
                    <Image
                      alt="withdrawIcon"
                      src={withdrawIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Withdrawal request</p>
                  </button>

                  <button
                    className="flex mt-2"
                    onClick={(e) => router.push("/viewusers")}
                  >
                    <Image
                      alt="usersIcon"
                      src={usersIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Users</p>
                  </button>

                  <button className="flex mt-2">
                    <Image
                      alt="adminn"
                      src={adminn}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Admin</p>
                  </button>
                </div>
              </div>
            )}

            <hr className="w-full mt-1 bg-blue-900 ht"></hr>
            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button className="flex mt-2">
                <Image
                  alt="feedback"
                  src={feedback}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Give feedback</p>
              </button>

              <button
                className="flex mt-2"
                onClick={(e) => router.push("/setting")}
              >
                <Image
                  alt="settings"
                  src={settings}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Settings</p>
              </button>

              <button className="flex mt-2" onClick={(e) => router.push("/help")}>
                <Image
                  alt="question"
                  src={question}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Help and support</p>
              </button>

              <button className="flex mt-2" onClick={(e) => router.push("/community")}>
                <Image
                  alt="globeearth"
                  src={globeearth}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Community guildelines</p>
              </button>
            </div>

            <hr className="w-full mt-1 bg-blue-900 ht"></hr>

            <div className="flex flex-col items-start mb-10 ml-1 mr-1 text-xs font-bold text-white">
              <button className="flex mt-3" onClick={(e) => logout()}>
                <Image
                  alt="logoutIcon"
                  src={logoutIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Log out</p>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div>
        <nav className="z-50 sm:hidden sm:h-svh sm:pb-10 sm:mt-0 sm:pt-0 lg:hidden">
          <div className="overflow-auto">
            <div className="flex flex-col items-start ml-1 mr-1">
              <div className="flex justify-between w-full">
                <div className="flex text-xs font-bold text-blue-200 ">
                  <Image
                    alt="profileIcon"
                    src={profile_photo}
                    className="object-cover rounded-full w-7 h-7"
                  />
                  <p className="mt-1 ml-1">{firstname}</p>
                </div>

                <div className="flex">
                  <Image alt="onlineIcon" src={onlineIcon} className="mb-2"/>
                </div>
              </div>

              <div className="flex justify-between w-full text-xs font-bold text-blue-200">
                <div className="flex ">
                  <p className="mt-1 ml-1">status:</p>
                  <p className="mt-1 ml-3">Basic Member</p>
                </div>

                <p className="mt-1 ml-3 hover:text-blue-400 active:text-blue-100">
                  (Upgrade)
                </p>
              </div>

              <div className="flex justify-between w-full text-xs font-bold text-blue-200">
                <div className="flex ">
                  <p className="mt-1 ml-1">You have:</p>
                  <p className="mt-1 ml-3">{gold_balance} Golds</p>
                </div>

                <p
                  className="mt-1 ml-3 hover:text-blue-400 active:text-blue-100 bt"
                  onClick={(e) => router.push("/topup")}
                >
                  (Get More)
                </p>
              </div>
            </div>
            <hr className="w-full mt-1 bg-blue-900 ht"></hr>

            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button className="flex mt-3">
                <Image
                  alt="featuresImage"
                  src={features}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Featured</p>
              </button>

              <button className="flex mt-3">
                <Image
                  alt="femaleIcon"
                  src={femaleIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Women</p>
              </button>

              <button className="flex mt-3">
                <Image
                  alt="maleIcon"
                  src={maleIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Men</p>
              </button>

              <button className="flex mt-3">
                <Image
                  alt="transIcon"
                  src={transIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Trans</p>
              </button>

              <button className="flex mt-3">
                <Image
                  alt="transIcon"
                  src={transIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Couple</p>
              </button>
            </div>
            <hr className="w-full mt-1 bg-blue-900 ht"></hr>
            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button
                className="flex mt-3"
                onClick={(e) => router.push("/history")}
              >
                <Image
                  alt="goldIcon"
                  src={goldIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">My Collection</p>
              </button>
            </div>

            {admin && (
              <div>
                <hr className="w-full mt-1 bg-blue-900 ht"></hr>

                <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
                  <button className="flex mt-3">
                    <Image
                      alt="reportIcon"
                      src={reportIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Reports</p>
                  </button>

                  <button
                    className="flex mt-2"
                    onClick={(e) => {
                      router.push("/verifymodel");
                    }}
                  >
                    <Image
                      alt="verificationIcon"
                      src={verificationIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Model verification</p>
                  </button>

                  <button className="flex mt-2">
                    <Image
                      alt="withdrawIcon"
                      src={withdrawIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Withdrawal request</p>
                  </button>

                  <button
                    className="flex mt-2"
                    onClick={(e) => router.push("/viewusers")}
                  >
                    <Image
                      alt="usersIcon"
                      src={usersIcon}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Users</p>
                  </button>

                  <button className="flex mt-2">
                    <Image
                      alt="adminn"
                      src={adminn}
                      className="object-cover w-7 h-7"
                    />
                    <p className="mt-1 ml-1">Admin</p>
                  </button>
                </div>
              </div>
            )}

            <hr className="w-full mt-1 bg-blue-900 ht"></hr>
            <div className="flex flex-col items-start ml-1 mr-1 text-xs font-bold text-white">
              <button className="flex mt-2">
                <Image
                  alt="feedback"
                  src={feedback}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Give feedback</p>
              </button>

              <button
                className="flex mt-2"
                onClick={(e) => router.push("/setting")}
              >
                <Image
                  alt="settings"
                  src={settings}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Settings</p>
              </button>

              <button className="flex mt-2">
                <Image
                  alt="question"
                  src={question}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Help and support</p>
              </button>

              <button className="flex mt-2">
                <Image
                  alt="globeearth"
                  src={globeearth}
                  className="object-cover w-6 h-6"
                />
                <p className="mt-1 ml-1">Community guildelines</p>
              </button>
            </div>

            <hr className="w-full mt-1 bg-blue-900 ht"></hr>

            <div className="flex flex-col items-start mb-10 ml-1 mr-1 text-xs font-bold text-white">
              <button className="flex mt-3" onClick={(e) => logout()}>
                <Image
                  alt="logoutIcon"
                  src={logoutIcon}
                  className="object-cover w-7 h-7"
                />
                <p className="mt-1 ml-1">Log out</p>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
