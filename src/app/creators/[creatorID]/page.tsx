"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import optionicon from "@/icons/editcommenticon.svg";
import editIcon from "../../icons/edit.svg";
import deleteicon from "../../icons/deleteicon.svg";
import PacmanLoader from "react-spinners/PacmanLoader";
import PacmanLoader1 from "react-spinners/ClockLoader";
import { toast, ToastContainer } from "material-react-toastify";
import { Bookinginfo } from "@/components/bookingFrag/Bookinginfo";
import { Bookingsuccess } from "@/components/bookingFrag/Bookingsuccess";
import { Requestform } from "@/components/bookingFrag/Requestform";
import closeIcon from "@/icons/closeIcon.svg";
import { getreview, getViews } from "@/store/creatorSlice";
import { CreatorReview } from "./_components/Creator_review";

import { useSelector, useDispatch } from "react-redux";
import {
  getmycreatorbyid,
  changecreatorstatus,
  deletecreator,
} from "@/store/creatorSlice";
// import { downloadImage } from "../../api/sendImage";
import AwesomeSlider from "react-awesome-slider";
import { addcrush, remove_Crush } from "@/store/creatorSlice";
import { useToast } from "@/components/toast/index";
import "material-react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import CreatorByIdNav from "./_components/CreatorByIdNav";
import { formatCreatorPrices } from "./_utils/formatCreatorPrices";

//import addcrush({inputs  : creatorid and userid})
//userid : the current user ID that wish to add the creator to its crush list
//creatorid : the creator ID that this user wishes to add to its crush list

//method stats and api message for redux selectors
// addcrush_stats and addcrush_message

import "material-react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-awesome-slider/dist/styles.css";
import { AppDispatch } from "@/store/store";
import { useUserId } from "@/lib/hooks/useUserId";


// Types
interface RootState {
    register: {
      userID: string;
      logedin: boolean;
      refreshtoken: string;
    };
    profile: {
      creatorID: string;
    };
    creator: any; // 🔥 replace with proper Creator type if available
}


var taken = true;
let bookinfo = "";
export default function Creatorbyid () {
    const params = useParams<{ creatorID: string }>();
    const Creator = params?.creatorID?.split(",") || [];

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
  const userid = useUserId();
  const Mycreator = useSelector((state: RootState) => state.profile.creatorID);
  const login = useSelector((state: RootState) => state.register.logedin);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const message = useSelector((state: RootState) => state.creator.message);
  const creatorbyidstatus = useSelector(
    (state: RootState) => state.creator.creatorbyidstatus
  );
  const getreviewstats = useSelector(
    (state: RootState) => state.creator.getreviewstats
  );
  const creatordeletestatus = useSelector(
    (state: RootState) => state.creator.creatordeletestatus
  );
  const reviewList = useSelector(
    (state: RootState) => state.creator.reviewList || []
  );
  const addcrush_stats = useSelector(
    (state: RootState) => state.creator.addcrush_stats
  );
  const addcrush_message = useSelector(
    (state: RootState) => state.creator.addcrush_message
  );
  const remove_crush_stats = useSelector(
    (state: RootState) => state.creator.remove_crush_stats
  );
  const remove_crush_message = useSelector(
    (state: RootState) => state.creator.remove_crush_message
  );
  const creator = useSelector((state: RootState) => state.creator.creatorbyid);
  // Toast hook
  const { successalert, dismissalert } = useToast();

  // State
  const [user, setUser] = useState<any>(null);
  const [showmode, setshowcreator] = useState(false);
  const [photocount, setphotocount] = useState(0);
  const [oldlink, setoldlink] = useState<string[]>([]);
  const [documentlink, setdocumentlink] = useState<string[]>([]);
  const [docCount, setdocCount] = useState(0);
  const [creatorid, setcreatorid] = useState<[string?, string?]>([
    Creator[1],
    userid,
  ]);
  const [bookingclick, setbookingclick] = useState(false);
  const [success, setsuccess] = useState(false);
  const [requested, setrequested] = useState(false);
  const [review_click, setreview_click] = useState(false);
  const [dcb, set_dcb] = useState(false);
  const [removeCrush, set_removeCrush] = useState(false);
  const [crush_text, set_crush_text] = useState("Add to Crush");
  const [hosttype, sethosttype] = useState("");
  const [closeOption, setcloseOption] = useState(false);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#d49115");
  const [creatormeet, setmodlemeet] = useState("");
  const [bookinfo, setbookinfo] = useState("");
  const [loading1, setLoading1] = useState(true);
  const [color1, setColor1] = useState("#d49115");
  const [click, setclick] = useState(true);
  const [imglist, setimglist] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [views, setViews] = useState(0);

  // ✅ Replace navigate
  const navigate = (path: string) => {
    router.push(path);
  };


  useEffect(() => {
    // if (!login) {
    //   window.location.href = "/";
    // }
    if (!userid) return;

    if (creatorbyidstatus !== "loading") {
      dispatch(
        getmycreatorbyid({
          hostid: Creator[0],
          token,
          userid,
        })
      );
    }

    if (getreviewstats !== "loading") {
      dispatch(
        getreview({
          creatorid: Creator[0],
          token,
        })
      );
    }
  }, [userid]);

  useEffect(() => {
    if (creatorbyidstatus === "succeeded") {
      setLoading(false);
      setshowcreator(true);
      checkcrush();

      const linksimg =
        typeof creator.photolink === "string" && creator.photolink.trim()
          ? creator.photolink.split(",").filter((url: string) => url.trim())
          : Array.isArray(creator.photolink) && creator.photolink.length > 0
          ? creator.photolink.filter((url: string) => url.trim())
          : [];

      setphotocount(linksimg.length);

      linksimg.forEach((index: any) => {
        let img = index;
        setimglist((value) => [...value, img]);
        setoldlink((value) => [...value, index]);
      });

      dispatch(changecreatorstatus("idle"));
    }

    if (creatorbyidstatus === "failed") {
      dispatch(changecreatorstatus("idle"));
    }
  }, [creatorbyidstatus]);

  useEffect(() => {
    const stored = localStorage.getItem("login");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      const data = {
        creatorId: Creator[0],
        userId: userid || "",
        token: user?.refreshtoken || "",
      };
      const response = await dispatch(getViews(data));

      try {
        const payload = response?.payload?.response;
        if (!payload) {
          setViews(0);
          return;
        }
  
        // Ensure payload is a valid JSON string
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  
        setViews(parsed?.views ?? 0);
      } catch (err) {
        console.error("Failed to parse views response:", err);
        setViews(0);
      }
    };
    
    fetchViews();
  }, [user]);

  useEffect(() => {
    if (creatordeletestatus === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      setLoading(false);
      navigate("/creator");
    }

    if (creatordeletestatus === "failed") {
      dispatch(changecreatorstatus("idle"));
      setLoading(false);
    }
  }, [creatordeletestatus]);

  useEffect(() => {
    if (addcrush_stats === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      set_dcb(false);
      set_removeCrush(true);
      set_crush_text("Remove crush");
    }

    if (addcrush_stats === "failed") {
      dispatch(changecreatorstatus("idle"));
      set_crush_text("Add to crush");
      set_dcb(false);
    }

    if (remove_crush_stats === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      set_dcb(false);
      set_removeCrush(false);
      set_crush_text("Add to crush");
    }

    if (addcrush_stats === "failed") {
      dispatch(changecreatorstatus("idle"));
      set_crush_text("Remove crush");
      set_dcb(false);
      set_removeCrush(true);
    }
  }, [addcrush_stats, remove_crush_stats]);

  const checkcrush = () => {
    if (creator.add) {
      set_dcb(false);
      set_crush_text("Remove crush");
      set_removeCrush(true);
    }
  };

  useEffect(() => {
    if (creatorbyidstatus === "succeeded") {
      setLoading(false);
      setshowcreator(true);

      const linksimg =
        typeof creator.photolink === "string"
          ? creator.photolink.split(",")
          : Array.isArray(creator.photolink)
          ? creator.photolink
          : [];

      setphotocount(linksimg.length);

      linksimg.forEach((index: any) => {
        setimglist((value) => [...value, index]);
        setoldlink((value) => [...value, index]);
      });

      dispatch(changecreatorstatus("idle"));
    }

    if (creatorbyidstatus === "failed") {
      toast.error(`${message}`, { autoClose: 2000 });
      dispatch(changecreatorstatus("idle"));
    }
  }, [creatorbyidstatus]);

  useEffect(() => {
    if (creatordeletestatus === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      setLoading(false);
      navigate("/creator");
    }

    if (creatordeletestatus === "failed") {
      toast.error(`${message}`, { autoClose: 2000 });

      dispatch(changecreatorstatus("idle"));
      setLoading(false);
    }
  }, [creatordeletestatus]);

  const checkuser = () => {
    if (userid) {
      if (creator.userid === userid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const getStatus = (type:String) => {
    const normalizedHosttype = type;
    if (normalizedHosttype == "Fan meet") {
      return ("Meet and Greet with");
    } else if (normalizedHosttype == "Fan date") {
      return ("A Date with");
    } else if (normalizedHosttype == "Fan call") {
      return ("A Private Conversation with");
    } else {
      return ("Engage with");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const openModal = (imageSrc : any) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
    document.body.style.overflow = "unset";
  };

  const handleModalClick = (e: any) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const checkimg = () => {
    if (loading === false) {
      if (imglist.length > 0) {
        return (
          <div className="pt-2 pb-4 md:pt-60 ">
            <AwesomeSlider
              fillParent={false}
              bullets={false}
              animation="foldOutAnimation"
            >
              {imglist.map((value) => {
                return (
                  <div className=" w-full h-[300px] overflow-hidden">
                    <Image
                      height={100}
                      width={100}
                      alt="host pics"
                      src={value}
                      className="object-cover w-full h-full rounded-md cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      onClick={() => openModal(value)}
                    />
                  </div>
                );
              })}
            </AwesomeSlider>
          </div>
        );
      }
    }
  };

  const deleteCreator = () => {
    if (creatordeletestatus !== "loading") {
      setLoading(true);
      dispatch(
        deletecreator({
          oldlink,
          documentlink,
          photocount,
          photolink: creator.photolink,
          hostid: creator.hostid,
          token,
          docCount,
        })
      );
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (confirm: boolean) => {
    setShowDeleteModal(false);
    if (confirm) {
      deleteCreator();
    }
  };

  const Cantchat = () => {
    if (creator.userid === userid) {
      return false;
    } else {
      return true;
    }
  };

  const Check_review = () => {
    setreview_click(true);
    if (getreviewstats === "loading") {
      setLoading1(true);
    } else {
      setLoading1(false);
    }
  };

  const display_review = () => {
    if (loading1 === true) {
      return false;
    } else {
      return true;
    }
  };

  const show_review = () => {
    if (loading1 === false) {
      if (reviewList.length > 0) {
        return reviewList.map((value: any) => {
          return (
            <CreatorReview
              content={value.content}
              name={value.name}
              photolink={value.photolink}
              posttime={value.posttime}
              id={value.id}
              userid={value.userid}
            />
          );
        });
      } else {
        return (
          <div className="flex justify-center w-full">
            <p className="text-sm text-slate-300">This creator got 0 reviews</p>
          </div>
        );
      }
    }
  };

  const addTocrush = () => {
    if (addcrush_stats !== "loading" && removeCrush === false) {
      set_dcb(true);
      set_crush_text("adding to crush list...");
      dispatch(addcrush({ userid, token, creatorid: creator.hostid }));
    }

    if (remove_crush_stats !== "loading" && removeCrush === true) {
      set_dcb(true);
      set_crush_text("removing crush from list...");
      dispatch(remove_Crush({ userid, token, creatorid: creator.hostid }));
    }
  };

  const checkOnline = () => {
    if (creator.active) {
      return "online";
    } else {
      return "offline";
    }
  };


  if (!loading&&creator.userid&&!creator.hosttype&&!creator.price){
      const tst=toast.loading("Curating your creator, please wait!")
      navigate("/creators/editcreatorportfolio")
      setLoading(true)
      setTimeout(()=>{
        toast.dismiss(tst)
      },5000)
  }

  const psPrice = creator.price?.replace(/(GOLD)(per)/, "$1 $2");
  const fmtPSPrice = psPrice?.includes("per minute")
    ? psPrice
    : `${psPrice} per minute`;
  return (
    <div className="pt-5 md:pt-0">
      {loading && (
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <div className="relative w-full pb-16 mx-auto overflow-auto md:max-w-md sm:ml-8 md:mt-5 md:mr-auto md:ml-24 xl:ml-42 2xl:ml-52">
            <div className="w-full space-y-4">
              <div className="flex justify-center">
                <Skeleton width={300} height={300} className="rounded-lg" />
              </div>

              <div className="flex justify-between px-2">
                <Skeleton width={170} height={30} className="rounded-md" />
                <Skeleton width={170} height={30} className="rounded-md" />
              </div>

              <div className="flex justify-center">
                <Skeleton width={380} height={30} className="rounded-md" />
              </div>

              <div className="px-4 space-y-2">
                {Array(12)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex justify-between w-full">
                      <Skeleton width={100} height={20} />
                      <Skeleton width={140} height={20} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </SkeletonTheme>
      )}

      {showmode && (
        <div
          className="w-full p-2 pb-16 overflow-auto md:max-w-md sm:ml-8 md:mt-5 md:mr-auto md:ml-24 xl:ml-42 2xl:ml-52"
          onClick={(e) => setclick(true)}
        >
          <div className="w-full">
            <div className="z-10 w-full top-16 ">
              <CreatorByIdNav
                views={views}
                creatorName={(creator?.name||" ").split(" ")[0]}
                followingUser={creator.followingUser}
                id={creator.userid}
                creatorid={creator.hostid}
              />
            </div>

            <ToastContainer position="top-center" theme="dark" />
            {checkuser() && (
              <button>
                <Image
                className="z-50 absolute w-6 h-6 top-10 left-16 md:top-24 md:left-24"
                  alt="optionicon"
                  src={optionicon}
                  onClick={(e) => {
                    setcloseOption(!closeOption);
                  }}
                />
                {closeOption && (
                  <div className="z-[100] absolute  bg-[#0e0a1f] flex flex-col text-left">
                    <button
                      onClick={(e) => {
                        navigate("/creators/editcreatorportfolio");
                      }}
                      className="text-white"
                    >
                      Edit
                    </button>
                    <button onClick={confirmDelete} className="text-white ">
                      Delete
                    </button>
                  </div>
                )}
              </button>
            )}
          </div>

          <div className="visible md:-mt-56 ">{checkimg()}</div>

          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10 p-4"
              onClick={handleModalClick}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors duration-200 z-10"
                aria-label="Close modal"
              >
                ×
              </button>

              <div className="relative max-w-full max-h-full">
                <img
                  src={selectedImage}
                  alt="Fullscreen view"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {showDeleteModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-800 p-6 rounded-lg text-white w-11/12 max-w-md">
                <h2 className="text-lg font-bold mb-4">Warning</h2>
                <p className="mb-4">
                  Deleting this page will erase all your views permanently. This
                  will lower your visibility if you create a new creator page. Are
                  you absolutely sure?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {Cantchat() && (
              <button
                className="w-2/3 mr-1 bg-red-700 btn text-slate-100"
                onClick={(e) => {
                  if (!userid) {
                    toast.info("login to access this operation", {
                      autoClose: 2000,
                    });
                    return;
                  }
                  navigate(`/message/${creatorid.toString()}`);
                }}
              >
                Message
              </button>
            )}

            {Cantchat() && (
              <button
                className="w-2/3 ml-1 bg-red-700 btn text-slate-100"
                onClick={(e) => {
                  if (!userid) {
                    toast.info("login to access this operation", {
                      autoClose: 2000,
                    });
                    return;
                  }
                  addTocrush();
                }}
                disabled={dcb}
              >
                {crush_text}
              </button>
            )}
          </div>

          {Cantchat() && (
            <button
              className="w-full mt-2 btn bg-[#da5e16]"
              onClick={(e) => {
                if (!userid) {
                  toast.info("login to access this operation", {
                    autoClose: 2000,
                  });
                  return;
                }
                setbookingclick(true);
              }}
            >
              Request {creator.hosttype}
            </button>
          )}
          <div className="mx-auto my-2 font-semibold text-center text-slate-300">
            <p>
              {" "}
              { getStatus(String(creator?.hosttype)) } {creator.name.split(" ")[0]}
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Name :</span> <span> {creator.name}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Age :</span> <span>{creator.age}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Location :</span> <span>{creator.location}</span>
            </p>

            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>
                {creator.hosttype === "Private show" ? "Tip " : "Transport fare"}{" "}
                :
              </span>{" "}
              <span>
                {creator.hosttype === "Private show"
                  ? fmtPSPrice
                  : `${formatCreatorPrices(creator.price)} GOLD`}
              </span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Duration :</span> <span>{creator.duration}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Bodytype :</span> <span>{creator.bodytype}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Smoke :</span> <span>{creator.smoke}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Drink :</span> <span>{creator.drink}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Interested in :</span>
              <span>{creator.interestedin?.split(" ").join(", ")}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Height :</span> <span>{creator.height}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Weight :</span> <span>{creator.weight}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Gender :</span> <span>{creator.gender}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>status :</span>{" "}
              <span>
                {creator.verify ? "Verified" : "Not verified"}
              </span>
            </p>
            <p className="flex justify-between w-full mr-2 break-all text-slate-300 text-wrap sm:block">
              <span className="whitespace-nowrap">Available Hours :</span>{" "}
              <span className=" max-w-[200px] overflow-x-auto whitespace-nowrap">
                {creator.timeava?.split(" ").join(", ")}
              </span>
            </p>
            <p className="flex justify-between w-full mr-2 break-all text-slate-300 text-wrap sm:block">
              <span className="whitespace-nowrap">Available Days :</span>{" "}
              <span className=" max-w-[200px] overflow-x-auto whitespace-nowrap">
                {creator.daysava?.split(" ").join(", ")}
              </span>
            </p>
          </div>
          <div className="mt-1 text-center text-slate-300">
            <p className="font-semibold text-slate-300">About me</p>
            <p className="text-sm leading-relaxed text-gray-400 break-all text-wrap">
              {creator.description}
            </p>
          </div>

          <button
            className="flex flex-col p-2 mx-auto mb-16 text-sm text-gray-900 rounded-md bg-slate-300"
            onClick={(e) => {
              if (!userid) {
                toast.info("login to access this operation", {
                  autoClose: 2000,
                });
                return;
              }
              Check_review();
            }}
          >
            <p>view reviews</p>
            <p className="mx-auto text-center">{`${reviewList.length} review`}</p>
          </button>

          {review_click && (
            <div className="absolute z-10 w-5/6 rounded-md shadow h-1/6 bg-slate-300 bottom-1/4 shadow-slate-500">
              <div className="flex justify-end w-full">
                <button
                  onClick={(e) => {
                    setreview_click(false);
                  }}
                >
                  <Image
                    alt="closeIcon"
                    src={closeIcon}
                    className="object-cover w-5 h-5"
                  />
                </button>
              </div>

              {loading1 && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <PacmanLoader1
                    color={color1}
                    loading={loading1}
                    size={25}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                  <p className="text-sm text-slate-300">Please wait...</p>
                </div>
              )}

              {display_review() && (
                <div className="flex flex-col w-full h-full pl-3 pr-3 overflow-auto">
                  {show_review()}
                </div>
              )}
            </div>
          )}
          {bookingclick && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-52"
              onClick={() => setbookingclick(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Bookinginfo
                  setbookclick={setbookingclick}
                  amount={creator.price}
                  setsuccess={setsuccess}
                  type={creator.hosttype}
                />
              </div>
            </div>
          )}

          {success && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-52"
              onClick={() => setsuccess(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Requestform
                  setsuccess={setsuccess}
                  price={creator.price}
                  toast={toast}
                  creatorid={creator.hostid}
                  type={creator.hosttype}
                  setrequested={setrequested}
                  creator={creator}
                />
              </div>
            </div>
          )}

          {requested && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-52"
              onClick={() => setrequested(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Bookingsuccess setrequested={setrequested} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
