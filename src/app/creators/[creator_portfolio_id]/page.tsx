/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import optionicon from "@/icons/editcommenticon.svg";
import editIcon from "@/icons/edit.svg";
import deleteicon from "@/icons/deleteicon.svg";
import PacmanLoader1 from "react-spinners/ClockLoader";
import { toast, ToastContainer } from "material-react-toastify";
import { Bookinginfo } from "@/components/bookingFrag/Bookinginfo";
import { Bookingsuccess } from "@/components/bookingFrag/Bookingsuccess";
import { Requestform } from "@/components/bookingFrag/Requestform";
import { RequestDetailsForm } from "@/components/bookingFrag/RequestDetailsForm";
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
import { addcrush, remove_Crush } from "@/store/creatorSlice";
import "material-react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import CreatorByIdNav from "./_components/CreatorByIdNav";
import { formatCreatorPrices } from "./_utils/formatCreatorPrices";

//import addcrush({inputs  : creator_portfoliio_Id and userid})
//userid : the current user ID that wish to add the creator to its crush list
//creator_portfoliio_Id : the creator ID that this user wishes to add to its crush list

//method stats and api message for redux selectors
// addcrush_stats and addcrush_message

import "material-react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import { AppDispatch } from "@/store/store";
import { useUserId } from "@/lib/hooks/useUserId";
import { useAuth } from "@/lib/context/auth-context";
import VIPBadge from "@/components/VIPBadge";
import { checkVipCelebration, markVipCelebrationViewed } from "@/api/vipCelebration";
import { URL } from "@/api/config";


// Types
interface RootState {
    register: {
      userID: string;
      logedin: boolean;
      refreshtoken: string;
    };
    profile: {
      creator_portfolio_id: string;
      balance: string;
    };
    creator: {
      userid: string;
      hostid: string;
      name: string;
      age: string;
      location: string;
      price: string;
      duration: string;
      bodytype: string;
      smoke: string;
      drink: string;
      interestedin: string;
      height: string;
      weight: string;
      description: string;
      gender: string;
      timeava: string;
      daysava: string;
      hosttype: string;
      photolink: string | string[];
      verify: boolean;
      active: boolean;
      add: boolean;
      followingUser: boolean;
      message: string;
      creatorbyidstatus: string;
      getreviewstats: string;
      creatordeletestatus: string;
      reviewList: Array<{ content: string; name: string; photolink: string; posttime: string; id: string; userid: string }>;
      addcrush_stats: string;
      remove_crush_stats: string;
      creatorbyid: {
        userid: string;
        hostid: string;
        name: string;
        age: string;
        location: string;
        price: string;
        duration: string;
        bodytype: string;
        smoke: string;
        drink: string;
        interestedin: string;
        height: string;
        weight: string;
        description: string;
        gender: string;
        timeava: string;
        daysava: string;
        hosttype: string;
        photolink: string | string[];
        verify: boolean;
        active: boolean;
        add: boolean;
        followingUser: boolean;
        isVip?: boolean;
        vipEndDate?: string;
      };
    };
}


export default function Creatorbyid () {
    const params = useParams<{ creator_portfolio_id: string }>();
    const Creator = params?.creator_portfolio_id?.split(",") || [];

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
  const useridFromHook = useUserId();
  const { session } = useAuth();
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  
  // Get userid from multiple sources
  const [userid, setUserid] = useState<string>("");
  
  useEffect(() => {
    if (useridFromHook) {
      setUserid(useridFromHook);
    } else if (session?._id) {
      setUserid(session._id);
    } else if (reduxUserid) {
      setUserid(reduxUserid);
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setUserid(data?.userID || data?.userid || data?.id || "");
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [useridFromHook, session?._id, reduxUserid]);
  const reduxToken = useSelector((state: RootState) => state.register.refreshtoken);
  
  // Get token from Redux or localStorage as fallback
  const [token, setToken] = useState<string>("");
  
  useEffect(() => {
    if (reduxToken) {
      setToken(reduxToken);
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setToken(data?.refreshtoken || data?.accesstoken || "");
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [reduxToken]);
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
  const remove_crush_stats = useSelector(
    (state: RootState) => state.creator.remove_crush_stats
  );
  const creator = useSelector((state: RootState) => state.creator.creatorbyid);
  const profile = useSelector((state: RootState) => state.profile);

  // Get VIP status directly from creator data (like creators page)
  const vipStatusFromCreator = creator?.isVip ? {
    isVip: creator.isVip,
    vipEndDate: creator.vipEndDate
  } : null;
  

  // State
  const [user, setUser] = useState<{ refreshtoken: string } | null>(null);
  const [showmode, setshowcreator] = useState(false);
  const [photocount, setphotocount] = useState(0);
  const [oldlink, setoldlink] = useState<string[]>([]);
  const [documentlink] = useState<string[]>([]);
  const [docCount] = useState(0);
  const [creator_portfoliio_Id] = useState<[string?, string?]>([
    Creator[1],
    userid,
  ]);
  const [bookingclick, setbookingclick] = useState(false);
  const [success, setsuccess] = useState(false);
  const [requested, setrequested] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [review_click, setreview_click] = useState(false);
  const [dcb, set_dcb] = useState(false);
  const [removeCrush, set_removeCrush] = useState(false);
  const [crush_text, set_crush_text] = useState("Add to Crush");
  const [closeOption, setcloseOption] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [color1, setColor1] = useState("#d49115");
  const [imglist, setimglist] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [views, setViews] = useState(0);
  
  // VIP celebration state
  const [showVipCelebration, setShowVipCelebration] = useState(false);
  const [vipCelebrationShown, setVipCelebrationShown] = useState(false);
  const [celebrationChecked, setCelebrationChecked] = useState(false);

  // ✅ Replace navigate
  const navigate = (path: string) => {
    router.push(path);
  };

  // Check VIP celebration status (database-based)
  const checkVipCelebrationStatus = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return false;
    
    try {
      const response = await checkVipCelebration(userId, viewerId, token);
      return response.shouldShowCelebration;
    } catch (error) {
      return false;
    }
  }, [token]);

  // Mark VIP celebration as viewed (database-based)
  const markVipCelebrationAsViewed = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return;
    
    try {
      await markVipCelebrationViewed(userId, viewerId, token);
    } catch (error) {
      // Silent fail
    }
  }, [token]);


  // VIP status is now included directly from backend, no need for separate API call

  // Check VIP celebration status when VIP status is confirmed
  useEffect(() => {
    const checkCelebration = async () => {
      // Only proceed if VIP status is confirmed from creator data
      if (vipStatusFromCreator?.isVip === true && creatorbyidstatus === "succeeded" && Creator[0] && userid && !celebrationChecked) {
        setCelebrationChecked(true);
        
        try {
          const shouldShow = await checkVipCelebrationStatus(Creator[0], userid);
          
          if (shouldShow) {
            setShowVipCelebration(true);
            setVipCelebrationShown(true);
            
            // Mark as viewed in database
            await markVipCelebrationAsViewed(Creator[0], userid);
            
            // Hide the celebration after 5 seconds
            setTimeout(() => {
              setShowVipCelebration(false);
            }, 5000);
          }
        } catch (error) {
          // Silent fail
        }
      }
    };

    checkCelebration();
  }, [vipStatusFromCreator, creatorbyidstatus, Creator[0], userid, celebrationChecked, checkVipCelebrationStatus, markVipCelebrationAsViewed]);

  // Reset VIP celebration tracking when switching creators
  useEffect(() => {
    setVipCelebrationShown(false);
    setShowVipCelebration(false);
    setCelebrationChecked(false);
  }, [Creator[0]]);

  useEffect(() => {

    if (!userid || !Creator[0]) {
      return;
    }

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
          creator_portfoliio_Id: Creator[0],
          token,
        })
      );
    }
  }, [userid, Creator[0]]);

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

      // Reset and set images properly
      setimglist(linksimg);
      setoldlink(linksimg);
      setCurrentImageIndex(0); // Reset to first image

      dispatch(changecreatorstatus("idle"));
    }

    if (creatorbyidstatus === "failed") {
      setLoading(false);
      dispatch(changecreatorstatus("idle"));
    }
  }, [creatorbyidstatus, creator.photolink]);

  useEffect(() => {
    const stored = localStorage.getItem("login");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      const data = {
        creator_portfoliio_Id: Creator[0],
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
        setViews(0);
      }
    };
    
    fetchViews();
  }, [user]);

  useEffect(() => {
    if (creatordeletestatus === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      setLoading(false);
      navigate("/");
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
      toast.success("Added to your crush list! 💜", { autoClose: 2000 });
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
      toast.success("Removed from your crush list", { autoClose: 2000 });
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
    if (creatordeletestatus === "succeeded") {
      dispatch(changecreatorstatus("idle"));
      setLoading(false);
      navigate("/");
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

  const getStatus = (type: string) => {
    const normalizedHosttype = type;
    if (normalizedHosttype == "Fan meet") {
      return ("Meet and Greet with");
    } else if (normalizedHosttype == "Fan date") {
      return ("A Date with");
    } else if (normalizedHosttype == "Fan call" || normalizedHosttype == "Fan Call") {
      return ("A Private Conversation with");
    } else {
      return ("Engage with");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
    document.body.style.overflow = "unset";
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const checkimg = () => {
    if (loading === false) {
      if (imglist.length > 0) {
        return (
          <div className="pt-2 pb-4 md:pt-60">
            <div className="relative w-full h-[300px] overflow-hidden rounded-md">
              <Image
                height={300}
                width={400}
                alt="host pics"
                src={imglist[currentImageIndex]}
                className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onClick={() => openModal(imglist[currentImageIndex])}
              />
              
              {/* Navigation arrows */}
              {imglist.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? imglist.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === imglist.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    →
                  </button>
                </>
              )}
              
              {/* Image counter */}
              {imglist.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {imglist.length}
                </div>
              )}
            </div>
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
          photolink: Array.isArray(creator.photolink) ? creator.photolink : [creator.photolink].filter(Boolean),
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
        return reviewList.map((value: { content: string; name: string; photolink: string; posttime: string; id: string; userid: string }, index: number) => {
          return (
            <CreatorReview
              key={index}
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
      dispatch(addcrush({ userid, token, creator_portfoliio_Id: creator.hostid }));
    }

    if (remove_crush_stats !== "loading" && removeCrush === true) {
      set_dcb(true);
      set_crush_text("removing crush from list...");
      dispatch(remove_Crush({ userid, token, creator_portfoliio_Id: creator.hostid }));
    }
  };

  const handleRequestDetailsSubmit = async (details: { date: string; time: string; venue: string }) => {
    console.log('Sending request with:', {
      userid,
      creator_portfolio_id: creator.hostid,
      creatorUserid: creator.userid,
      type: creator.hosttype,
      date: details.date,
      time: details.time,
      place: details.venue,
      price: parseFloat(creator.price) || 0
    });
    
    // Check if user has enough gold balance
    const userBalance = parseFloat(profile.balance) || 0;
    const requiredAmount = parseFloat(creator.price) || 0;
    
    if (userBalance < requiredAmount) {
      toast.error(`Insufficient gold! You need ${requiredAmount} gold but only have ${userBalance} gold.`);
      // Redirect to buy-gold page
      setTimeout(() => {
        navigate('/buy-gold');
      }, 2000);
      return;
    }
    
    try {
      const response = await fetch(`${URL}/bookhost`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid,
          creator_portfolio_id: creator.hostid, // Use hostid for creator lookup in creatordb
          type: creator.hosttype,
          date: details.date,
          time: details.time,
          place: details.venue,
          price: parseFloat(creator.price) || 0
        })
      });

      if (response.ok) {
        setShowRequestDetails(false);
        setbookingclick(false);
        const serviceType = creator.hosttype || "Fan meet";
        toast.success(`${serviceType} request sent successfully!`);
        // Optionally navigate to notifications
        setTimeout(() => {
          navigate('/notifications/activity');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Error sending request');
    }
  };

  const checkOnline = () => {
    if (creator.active) {
      return "online";
    } else {
      return "offline";
    }
  };


  if (!loading && creator?.userid && !creator?.hosttype && !creator?.price){
      const tst=toast.loading("Curating your creator, please wait!")
        navigate("/creators/editcreatorportfolio")
      setLoading(true)
      setTimeout(()=>{
        toast.dismiss(tst)
      },5000)
  }

  const psPrice = creator?.price?.replace(/(GOLD)(per)/, "$1 $2");
  const fmtPSPrice = psPrice?.includes("per minute")
    ? psPrice
    : `${psPrice} Gold/per minute`;
  // Don't render if creator data is not available or still loading
  if (loading || creatorbyidstatus === "loading" || !creator || Object.keys(creator).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Header Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton circle width={40} height={40} />
                      <div className="space-y-2">
                        <Skeleton width={120} height={20} />
                        <Skeleton width={80} height={16} />
                      </div>
                    </div>
                  </div>
                  <Skeleton width={40} height={40} className="rounded-full" />
                </div>
                
                <div className="text-center">
                  <Skeleton width={200} height={24} className="mx-auto mb-2" />
                  <Skeleton width={150} height={20} className="mx-auto" />
                </div>
              </div>

              {/* Image Gallery Skeleton - Fixed size to match actual image */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="pt-2 pb-4 md:pt-60">
                  <div className="relative w-full h-[300px] overflow-hidden rounded-md">
                    <Skeleton 
                      width="100%" 
                      height={300} 
                      className="rounded-md" 
                      style={{ maxWidth: '400px', margin: '0 auto' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton width="100%" height={48} className="rounded-xl" />
                  <Skeleton width="100%" height={48} className="rounded-xl" />
                </div>
                <Skeleton width="100%" height={56} className="rounded-xl mt-4" />
              </div>

              {/* Profile Information Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={200} height={32} className="mx-auto mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={100} height={20} />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={100} height={20} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests Skeleton */}
                <div className="mt-6">
                  <Skeleton width={120} height={24} className="mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {Array(4).fill(0).map((_, index) => (
                      <Skeleton key={index} width={60} height={32} className="rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Availability Skeleton */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton width={120} height={24} className="mb-3" />
                    <Skeleton width="100%" height={60} className="rounded-lg" />
                  </div>
                  <div>
                    <Skeleton width={120} height={24} className="mb-3" />
                    <Skeleton width="100%" height={60} className="rounded-lg" />
                  </div>
                </div>
              </div>

              {/* About Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={120} height={32} className="mx-auto mb-4" />
                <Skeleton width="100%" height={80} className="rounded-lg" />
              </div>

              {/* Safety Rules Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={200} height={32} className="mx-auto mb-4" />
                <div className="space-y-3">
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="100%" height={40} className="rounded-lg" />
                </div>
              </div>

              {/* Reviews Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width="100%" height={56} className="rounded-xl" />
              </div>
            </div>
          </div>
        </SkeletonTheme>
      </div>
    );
  }

  // Show error message if creator fetch failed
  if (creatorbyidstatus === "failed") {
    return (
      <div className="pt-5 md:pt-0">
        <div className="relative w-full pb-16 mx-auto overflow-auto md:max-w-md sm:ml-8 md:mt-5 md:mr-auto md:ml-24 xl:ml-42 2xl:ml-52">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Creator Not Found</h2>
            <p className="text-gray-400 mb-4">The creator you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <button 
              onClick={() => router.push('/creators')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Creators
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ToastContainer position="top-center" theme="dark" />
      
      {/* VIP Celebration Animation */}
      {showVipCelebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <Image
              src="/lion.gif"
              alt="VIP Celebration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
      
      {loading && (
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Header Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton circle width={40} height={40} />
                      <div className="space-y-2">
                        <Skeleton width={120} height={20} />
                        <Skeleton width={80} height={16} />
                      </div>
                    </div>
                  </div>
                  <Skeleton width={40} height={40} className="rounded-full" />
                </div>
                
                <div className="text-center">
                  <Skeleton width={200} height={24} className="mx-auto mb-2" />
                  <Skeleton width={150} height={20} className="mx-auto" />
                </div>
              </div>

              {/* Image Gallery Skeleton - Fixed size to match actual image */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="pt-2 pb-4 md:pt-60">
                  <div className="relative w-full h-[300px] overflow-hidden rounded-md">
                    <Skeleton 
                      width="100%" 
                      height={300} 
                      className="rounded-md" 
                      style={{ maxWidth: '400px', margin: '0 auto' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton width="100%" height={48} className="rounded-xl" />
                  <Skeleton width="100%" height={48} className="rounded-xl" />
                </div>
                <Skeleton width="100%" height={56} className="rounded-xl mt-4" />
              </div>

              {/* Profile Information Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={200} height={32} className="mx-auto mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={100} height={20} />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={100} height={20} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests Skeleton */}
                <div className="mt-6">
                  <Skeleton width={120} height={24} className="mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {Array(4).fill(0).map((_, index) => (
                      <Skeleton key={index} width={60} height={32} className="rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Availability Skeleton */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton width={120} height={24} className="mb-3" />
                    <Skeleton width="100%" height={60} className="rounded-lg" />
                  </div>
                  <div>
                    <Skeleton width={120} height={24} className="mb-3" />
                    <Skeleton width="100%" height={60} className="rounded-lg" />
                  </div>
                </div>
              </div>

              {/* About Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={120} height={32} className="mx-auto mb-4" />
                <Skeleton width="100%" height={80} className="rounded-lg" />
              </div>

              {/* Safety Rules Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width={200} height={32} className="mx-auto mb-4" />
                <div className="space-y-3">
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="100%" height={40} className="rounded-lg" />
                </div>
              </div>

              {/* Reviews Section Skeleton */}
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <Skeleton width="100%" height={56} className="rounded-xl" />
              </div>
            </div>
          </div>
        </SkeletonTheme>
      )}

      {showmode && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="relative bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <CreatorByIdNav
                    views={views}
                    creatorName={(creator?.name||" ").split(" ")[0]}
                    followingUser={creator.followingUser}
                    id={creator.userid}
                    creator_portfoliio_Id={creator.hostid}
                    checkuser={checkuser()}
                  />
                </div>
                
                {checkuser() && (
                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        setcloseOption(!closeOption);
                        e.stopPropagation();
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
                    >
                      <Image
                        className="w-5 h-5"
                        alt="options"
                        src={optionicon}
                      />
                    </button>
                    
                    {closeOption && (
                      <div className="absolute right-0 top-12 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            navigate("/creators/editcreatorportfolio");
                            setcloseOption(false);
                          }}
                          className="w-full px-4 py-3 text-left text-white hover:bg-gray-600 rounded-t-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Image src={editIcon} alt="edit" className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            confirmDelete();
                            setcloseOption(false);
                          }}
                          className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-600 rounded-b-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Image src={deleteicon} alt="delete" className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge - Only show when online */}
              {checkOnline() === 'online' && (
                <div className="flex items-center justify-center w-full gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-300 capitalize">online</span>
                  {creator.verify && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Verified</span>
                  )}
                </div>
              )}
              
              {/* Verified badge only - show when offline but verified */}
              {checkOnline() !== 'online' && creator.verify && (
                <div className="flex items-center justify-center w-full gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Verified</span>
                </div>
              )}

              {/* Main Content */}
              <div className="text-center">
                <h1 className="text-xl font-bold text-white mb-2">
                  {getStatus(String(creator?.hosttype))} {creator.name.split(" ")[0]}
                </h1>
                <p className="text-gray-300 text-1xl">{creator.name} </p>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl relative">
              {checkimg()}
              
              {/* VIP Badge - positioned on top-left of creator image */}
              {(() => {
                const shouldShowVip = vipStatusFromCreator?.isVip === true;
                return shouldShowVip && (
                  <div className="absolute top-2 left-20">
                    <VIPBadge size="xxl" isVip={vipStatusFromCreator.isVip} vipEndDate={vipStatusFromCreator.vipEndDate} />
                  </div>
                );
              })()}
            </div>

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
                <Image
                  src={selectedImage}
                  alt="Fullscreen view"
                  width={800}
                  height={600}
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
                  will lower your visibility if you create a new portfolio page. Are
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

            {/* Action Buttons */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                {Cantchat() && (
                  <>
                    <button
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={(e) => {
                        if (!userid) {
                          toast.info("login to access this operation", {
                            autoClose: 2000,
                          });
                          return;
                        }
                        navigate(`/message/${creator.userid}`);
                      }}
                    >
                      💬 Message
                    </button>

                    <button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      onClick={(e) => {
                        if (!userid) {
                          toast.info("login to access this operation", {
                            autoClose: 2000,
                          });
                          return;
                        }
                        if (removeCrush) {
                          // If already in crush list, remove it
                          addTocrush();
                        } else {
                          // If not in crush list, add it and navigate to collections
                          addTocrush();
                          setTimeout(() => {
                            navigate("/collections");
                          }, 1000); // Small delay to show the success state
                        }
                      }}
                      disabled={dcb}
                    >
                      {dcb ? "⏳ Processing..." : crush_text}
                    </button>
                  </>
                )}
              </div>

              {Cantchat() && (
                <button
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={(e) => {
                    if (!userid) {
                      toast.info("login to access this operation", {
                        autoClose: 2000,
                      });
                      return;
                    }
                    setShowRequestDetails(true);
                  }}
                >
                  🎯 Request {creator.hosttype}
                </button>
              )}
            </div>
            {/* Profile Information */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">👤 Name</span>
                    <span className="text-white font-semibold">{creator.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">🎂 Age</span>
                    <span className="text-white font-semibold">{creator.age} years</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">📍 Location</span>
                    <span className="text-white font-semibold">{creator.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">⚖️ Gender</span>
                    <span className="text-white font-semibold">{creator.gender}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">📏 Height</span>
                    <span className="text-white font-semibold">{creator.height}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">⚖️ Weight</span>
                    <span className="text-white font-semibold">{creator.weight}</span>
                  </div>
                </div>

                {/* Service Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">
                      {creator.hosttype === "Fan call" || creator.hosttype === "Fan Call" ? "📞 Call Rate" : "🚗 Transport Fare"}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      {creator.hosttype === "Fan call" || creator.hosttype === "Fan Call"
                        ? fmtPSPrice
                        : `${formatCreatorPrices(creator.price)} GOLD`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">⏱️ Duration</span>
                    <span className="text-white font-semibold">{creator.duration} min</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">🏃 Body Type</span>
                    <span className="text-white font-semibold">{creator.bodytype}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">🚭 Smoke</span>
                    <span className={`font-semibold ${creator.smoke === 'Yes' ? 'text-red-400' : 'text-green-400'}`}>
                      {creator.smoke}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">🍷 Drink</span>
                    <span className={`font-semibold ${creator.drink === 'Yes' ? 'text-red-400' : 'text-green-400'}`}>
                      {creator.drink}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 font-medium">✅ Status</span>
                    <span className={`font-semibold ${creator.verify ? 'text-green-400' : 'text-yellow-400'}`}>
                      {creator.verify ? "Verified" : "Not verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">💕 Interested In</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.interestedin?.split(" ").map((interest: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">🕐 Available Hours</h3>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">
                      {creator.timeava?.split(" ").join(", ") || "Not specified"}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">📅 Available Days</h3>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">
                      {creator.daysava?.split(" ").join(", ") || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">About Me</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed text-center">
                  {creator.description}
                </p>
              </div>
            </div>

            {/* Safety Rules Section */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Safety Rules (Important!)</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">•</span>
                    <span>All meets are limited to 30 minutes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">•</span>
                    <span>Meets must happen in a public place only.</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-yellow-300 text-sm text-center">
                    <strong>What happens after 30 minutes is outside the platform&apos;s responsibility.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                <div className="flex items-center justify-center gap-2">
                  <span>⭐</span>
                  <span>View Reviews</span>
                  <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-bold">
                    {reviewList.length}
                  </span>
                </div>
              </button>
            </div>

          {review_click && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">Reviews</h2>
                  <button
                    onClick={(e) => {
                      setreview_click(false);
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
                  >
                    <Image
                      alt="closeIcon"
                      src={closeIcon}
                      className="w-5 h-5"
                    />
                  </button>
                </div>

                <div className="p-6">
                  {loading1 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <PacmanLoader1
                        color={color1}
                        loading={loading1}
                        size={25}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                      <p className="text-gray-300 mt-4">Loading reviews...</p>
                    </div>
                  )}

                  {display_review() && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {show_review()}
                    </div>
                  )}
                </div>
              </div>
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
                  price={Number(creator.price) || 0}
                  toast={toast}
                  creator_portfolio_id={creator.hostid}
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

          {showRequestDetails && (
            <RequestDetailsForm
              onDone={handleRequestDetailsSubmit}
              onCancel={() => setShowRequestDetails(false)}
              creatorName={creator.name}
              creatorType={creator.hosttype}
              price={parseFloat(creator.price) || 0}
            />
          )}
          </div>
        </div>
      )}
    </div>
  );
};
