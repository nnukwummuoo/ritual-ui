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
import { getreview, getViews } from "@/store/modelSlice";
import { ModelReview } from "./_components/Model_review";

import { useSelector, useDispatch } from "react-redux";
import {
  getmymodelbyid,
  changemodelstatus,
  deletemodel,
} from "@/store/modelSlice";
// import { downloadImage } from "../../api/sendImage";
import AwesomeSlider from "react-awesome-slider";
import { addcrush, remove_Crush } from "@/store/modelSlice";
import { useToast } from "@/components/toast/index";
import "material-react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import ModelByIdNav from "./_components/ModelByIdNav";
import { formatModelPrices } from "./_utils/formatModelPrices";

//import addcrush({inputs  : modelid and userid})
//userid : the current user ID that wish to add the model to its crush list
//modelid : the model ID that this user wishes to add to its crush list

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
      modelID: string;
    };
    model: any; // 🔥 replace with proper Model type if available
}


var taken = true;
let bookinfo = "";
export default function Modelbyid () {
    const params = useParams<{ modelID: string }>();
    const Model = params?.modelID?.split(",") || [];

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
  const userid = useUserId();
  const Mymodel = useSelector((state: RootState) => state.profile.modelID);
  const login = useSelector((state: RootState) => state.register.logedin);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const message = useSelector((state: RootState) => state.model.message);
  const modelbyidstatus = useSelector(
    (state: RootState) => state.model.modelbyidstatus
  );
  const getreviewstats = useSelector(
    (state: RootState) => state.model.getreviewstats
  );
  const modeldeletestatus = useSelector(
    (state: RootState) => state.model.modeldeletestatus
  );
  const reviewList = useSelector(
    (state: RootState) => state.model.reviewList || []
  );
  const addcrush_stats = useSelector(
    (state: RootState) => state.model.addcrush_stats
  );
  const addcrush_message = useSelector(
    (state: RootState) => state.model.addcrush_message
  );
  const remove_crush_stats = useSelector(
    (state: RootState) => state.model.remove_crush_stats
  );
  const remove_crush_message = useSelector(
    (state: RootState) => state.model.remove_crush_message
  );
  const model = useSelector((state: RootState) => state.model.modelbyid);
  // Toast hook
  const { successalert, dismissalert } = useToast();

  // State
  const [user, setUser] = useState<any>(null);
  const [showmode, setshowmodel] = useState(false);
  const [photocount, setphotocount] = useState(0);
  const [oldlink, setoldlink] = useState<string[]>([]);
  const [documentlink, setdocumentlink] = useState<string[]>([]);
  const [docCount, setdocCount] = useState(0);
  const [modelid, setmodelid] = useState<[string?, string?]>([
    Model[1],
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
  const [modelmeet, setmodlemeet] = useState("");
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

    if (modelbyidstatus !== "loading") {
      dispatch(
        getmymodelbyid({
          hostid: Model[0],
          token,
          userid,
        })
      );
    }

    if (getreviewstats !== "loading") {
      dispatch(
        getreview({
          modelid: Model[0],
          token,
        })
      );
    }
  }, [userid]);

  useEffect(() => {
    if (modelbyidstatus === "succeeded") {
      setLoading(false);
      setshowmodel(true);
      checkcrush();

      const linksimg =
        typeof model.photolink === "string" && model.photolink.trim()
          ? model.photolink.split(",").filter((url: string) => url.trim())
          : Array.isArray(model.photolink) && model.photolink.length > 0
          ? model.photolink.filter((url: string) => url.trim())
          : [];

      setphotocount(linksimg.length);

      linksimg.forEach((index: any) => {
        let img = index;
        setimglist((value) => [...value, img]);
        setoldlink((value) => [...value, index]);
      });

      dispatch(changemodelstatus("idle"));
    }

    if (modelbyidstatus === "failed") {
      dispatch(changemodelstatus("idle"));
    }
  }, [modelbyidstatus]);

  useEffect(() => {
    const stored = localStorage.getItem("login");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      const data = {
        modelId: Model[0],
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
    if (modeldeletestatus === "succeeded") {
      dispatch(changemodelstatus("idle"));
      setLoading(false);
      navigate("/model");
    }

    if (modeldeletestatus === "failed") {
      dispatch(changemodelstatus("idle"));
      setLoading(false);
    }
  }, [modeldeletestatus]);

  useEffect(() => {
    if (addcrush_stats === "succeeded") {
      dispatch(changemodelstatus("idle"));
      set_dcb(false);
      set_removeCrush(true);
      set_crush_text("Remove crush");
    }

    if (addcrush_stats === "failed") {
      dispatch(changemodelstatus("idle"));
      set_crush_text("Add to crush");
      set_dcb(false);
    }

    if (remove_crush_stats === "succeeded") {
      dispatch(changemodelstatus("idle"));
      set_dcb(false);
      set_removeCrush(false);
      set_crush_text("Add to crush");
    }

    if (addcrush_stats === "failed") {
      dispatch(changemodelstatus("idle"));
      set_crush_text("Remove crush");
      set_dcb(false);
      set_removeCrush(true);
    }
  }, [addcrush_stats, remove_crush_stats]);

  const checkcrush = () => {
    if (model.add) {
      set_dcb(false);
      set_crush_text("Remove crush");
      set_removeCrush(true);
    }
  };

  useEffect(() => {
    if (modelbyidstatus === "succeeded") {
      setLoading(false);
      setshowmodel(true);

      const linksimg =
        typeof model.photolink === "string"
          ? model.photolink.split(",")
          : Array.isArray(model.photolink)
          ? model.photolink
          : [];

      setphotocount(linksimg.length);

      linksimg.forEach((index: any) => {
        setimglist((value) => [...value, index]);
        setoldlink((value) => [...value, index]);
      });

      dispatch(changemodelstatus("idle"));
    }

    if (modelbyidstatus === "failed") {
      toast.error(`${message}`, { autoClose: 2000 });
      dispatch(changemodelstatus("idle"));
    }
  }, [modelbyidstatus]);

  useEffect(() => {
    if (modeldeletestatus === "succeeded") {
      dispatch(changemodelstatus("idle"));
      setLoading(false);
      navigate("/model");
    }

    if (modeldeletestatus === "failed") {
      toast.error(`${message}`, { autoClose: 2000 });

      dispatch(changemodelstatus("idle"));
      setLoading(false);
    }
  }, [modeldeletestatus]);

  const checkuser = () => {
    if (userid) {
      if (model.userid === userid) {
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

  const deleteModel = () => {
    if (modeldeletestatus !== "loading") {
      setLoading(true);
      dispatch(
        deletemodel({
          oldlink,
          documentlink,
          photocount,
          photolink: model.photolink,
          hostid: model.hostid,
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
      deleteModel();
    }
  };

  const Cantchat = () => {
    if (model.userid === userid) {
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
            <ModelReview
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
            <p className="text-sm text-slate-300">This model got 0 reviews</p>
          </div>
        );
      }
    }
  };

  const addTocrush = () => {
    if (addcrush_stats !== "loading" && removeCrush === false) {
      set_dcb(true);
      set_crush_text("adding to crush list...");
      dispatch(addcrush({ userid, token, modelid: model.hostid }));
    }

    if (remove_crush_stats !== "loading" && removeCrush === true) {
      set_dcb(true);
      set_crush_text("removing crush from list...");
      dispatch(remove_Crush({ userid, token, modelid: model.hostid }));
    }
  };

  const checkOnline = () => {
    if (model.active) {
      return "online";
    } else {
      return "offline";
    }
  };


  if (!loading&&model.userid&&!model.hosttype&&!model.price){
      const tst=toast.loading("Curating your model, please wait!")
      navigate("/models/edit-model")
      setLoading(true)
      setTimeout(()=>{
        toast.dismiss(tst)
      },5000)
  }

  const psPrice = model.price?.replace(/(GOLD)(per)/, "$1 $2");
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
              <ModelByIdNav
                views={views}
                modelName={(model?.name||" ").split(" ")[0]}
                followingUser={model.followingUser}
                id={model.userid}
                modelid={model.hostid}
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
                        navigate("/models/edit-model");
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
                  will lower your visibility if you create a new model page. Are
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
                  navigate(`/message/${modelid.toString()}`);
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
              Request {model.hosttype}
            </button>
          )}
          <div className="mx-auto my-2 font-semibold text-center text-slate-300">
            <p>
              {" "}
              { getStatus(String(model?.hosttype)) } {model.name.split(" ")[0]}
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Name :</span> <span> {model.name}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Age :</span> <span>{model.age}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Location :</span> <span>{model.location}</span>
            </p>

            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>
                {model.hosttype === "Private show" ? "Tip " : "Transport fare"}{" "}
                :
              </span>{" "}
              <span>
                {model.hosttype === "Private show"
                  ? fmtPSPrice
                  : `${formatModelPrices(model.price)} GOLD`}
              </span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Duration :</span> <span>{model.duration}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Bodytype :</span> <span>{model.bodytype}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Smoke :</span> <span>{model.smoke}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Drink :</span> <span>{model.drink}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Interested in :</span>
              <span>{model.interestedin?.split(" ").join(", ")}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Height :</span> <span>{model.height}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Weight :</span> <span>{model.weight}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>Gender :</span> <span>{model.gender}</span>
            </p>
            <p
              className="flex justify-between w-full text-slate-300 sm:block"
              style={{ flexWrap: "wrap" }}
            >
              <span>status :</span>{" "}
              <span>
                {model.verify ? "Verified" : "Not verified"}
              </span>
            </p>
            <p className="flex justify-between w-full mr-2 break-all text-slate-300 text-wrap sm:block">
              <span className="whitespace-nowrap">Available Hours :</span>{" "}
              <span className=" max-w-[200px] overflow-x-auto whitespace-nowrap">
                {model.timeava?.split(" ").join(", ")}
              </span>
            </p>
            <p className="flex justify-between w-full mr-2 break-all text-slate-300 text-wrap sm:block">
              <span className="whitespace-nowrap">Available Days :</span>{" "}
              <span className=" max-w-[200px] overflow-x-auto whitespace-nowrap">
                {model.daysava?.split(" ").join(", ")}
              </span>
            </p>
          </div>
          <div className="mt-1 text-center text-slate-300">
            <p className="font-semibold text-slate-300">About me</p>
            <p className="text-sm leading-relaxed text-gray-400 break-all text-wrap">
              {model.description}
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
                  amount={model.price}
                  setsuccess={setsuccess}
                  type={model.hosttype}
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
                  price={model.price}
                  toast={toast}
                  modelid={model.hostid}
                  type={model.hosttype}
                  setrequested={setrequested}
                  model={model}
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
