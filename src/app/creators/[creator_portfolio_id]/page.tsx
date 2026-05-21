/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { URL as API_BASE } from "@/api/config";
import { useRouter, useParams } from "next/navigation";
import optionicon from "@/icons/editcommenticon.svg";
import editIcon from "@/icons/edit.svg";
import deleteicon from "@/icons/deleteicon.svg";
import goldIcon from "@/icons/goldIcon.svg";
import PacmanLoader1 from "react-spinners/ClockLoader";
import { toast, ToastContainer } from "material-react-toastify";
import { Requestinfo } from "@/components/requestFrag/Requestinfo";
import { Requestsuccess } from "@/components/requestFrag/Requestsuccess";
import { Requestform } from "@/components/requestFrag/Requestform";
import { RequestDetailsForm } from "@/components/requestFrag/RequestDetailsForm";
import closeIcon from "@/icons/closeIcon.svg";
import { getViews } from "@/store/creatorSlice";
import { getAllCreatorRatings } from "@/store/profile";
import { CreatorReview } from "./_components/Creator_review";
import { IoArrowBack, IoCheckmarkCircleOutline } from "react-icons/io5";
import { BadgeCheck, ArrowLeftSquare, Coins } from "lucide-react";

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
import FollowStrip from "./_components/FollowStrip";
import { formatCreatorPrices } from "./_utils/formatCreatorPrices";

//import addcrush({inputs  : creator_portfolio_id and userid})
//userid : the current user ID that wish to add the creator to its crush list
//creator_portfolio_id : the creator ID that this user wishes to add to its crush list

//method stats and api message for redux selectors
// addcrush_stats and addcrush_message

import "material-react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import { AppDispatch } from "@/store/store";
import { useUserId } from "@/lib/hooks/useUserId";
import { useAuth } from "@/lib/context/auth-context";
import VIPBadge from "@/components/VIPBadge";
import {
  checkVipCelebration,
  markVipCelebrationViewed,
} from "@/api/vipCelebration";
import { checkVipStatus } from "@/store/vip";
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
    reviewList: Array<{
      content: string;
      name: string;
      photolink: string;
      posttime: string;
      id: string;
      userid: string;
    }>;
    addcrush_stats: string;
    remove_crush_stats: string;
    creatorbyid: {
      userid: string;
      hostid: string;
      name: string;
      username?: string;
      age: string;
      location: string;
      price: string;
      duration: string;
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

export default function Creatorbyid() {
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
  const reduxToken = useSelector(
    (state: RootState) => state.register.refreshtoken,
  );

  // Get token from Redux, session, or localStorage as fallback
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (reduxToken) {
      setToken(reduxToken);
    } else if (session?.token) {
      setToken(session.token);
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
  }, [reduxToken, session?.token]);
  const message = useSelector((state: RootState) => state.creator.message);
  const creatorbyidstatus = useSelector(
    (state: RootState) => state.creator.creatorbyidstatus,
  );
  const getreviewstats = useSelector(
    (state: RootState) => state.creator.getreviewstats,
  );
  const creatordeletestatus = useSelector(
    (state: RootState) => state.creator.creatordeletestatus,
  );
  const reviewList = useSelector(
    (state: RootState) => state.creator.reviewList || [],
  );

  // Get ratings from profile store (new 5-star rating system)
  const ratings = useSelector(
    (s: RootState) => (s.profile as any).ratings || [],
  );
  const ratings_stats = useSelector(
    (s: RootState) => (s.profile as any).ratings_stats || "idle",
  );
  const totalRatings = useSelector(
    (s: RootState) => (s.profile as any).totalRatings || 0,
  );
  const averageRating = useSelector(
    (s: RootState) => (s.profile as any).averageRating || 0,
  );
  const ratingCounts = useSelector(
    (s: RootState) => (s.profile as any).ratingCounts || {},
  );
  const addcrush_stats = useSelector(
    (state: RootState) => state.creator.addcrush_stats,
  );
  const remove_crush_stats = useSelector(
    (state: RootState) => state.creator.remove_crush_stats,
  );
  const creator = useSelector((state: RootState) => state.creator.creatorbyid);
  const profile = useSelector((state: RootState) => state.profile);

  // Get VIP status from Redux store (for the creator's userid)
  const vipStatus = useSelector((s: any) => s.vip?.vipStatus);

  // Get VIP status directly from creator data (like creators page)
  const vipStatusFromCreator = creator?.isVip
    ? {
        isVip: creator.isVip,
        vipEndDate: creator.vipEndDate,
      }
    : null;

  // State
  const [user, setUser] = useState<{ refreshtoken: string } | null>(null);
  const [showmode, setshowcreator] = useState(false);
  const [photocount, setphotocount] = useState(0);
  const [oldlink, setoldlink] = useState<string[]>([]);
  const [documentlink] = useState<string[]>([]);
  const [docCount] = useState(0);
  const [creator_portfolio_id] = useState<[string?, string?]>([
    Creator[1],
    userid,
  ]);
  const [requestclick, setrequestclick] = useState(false);
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

  // Profile image fallback state
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  // ✅ Replace navigate
  const navigate = (path: string) => {
    router.push(path);
  };

  // Helper function to get current user ID with localStorage fallback
  const getCurrentUserId = () => {
    let currentUserId = userid;

    // If userid is not available, try to get it from localStorage as fallback
    if (!currentUserId) {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          currentUserId = data?.userID || data?.userid || data?.id || "";
        }
      } catch (error) {
        console.error("Error getting userid from localStorage:", error);
      }
    }

    return currentUserId;
  };

  // Check VIP celebration status (database-based)
  const checkVipCelebrationStatus = React.useCallback(
    async (userId: string, viewerId: string) => {
      if (!userId || !viewerId || !token) return false;

      try {
        const response = await checkVipCelebration(userId, viewerId, token);
        return response.shouldShowCelebration;
      } catch (error) {
        return false;
      }
    },
    [token],
  );

  // Mark VIP celebration as viewed (database-based)
  const markVipCelebrationAsViewed = React.useCallback(
    async (userId: string, viewerId: string) => {
      if (!userId || !viewerId || !token) return;

      try {
        await markVipCelebrationViewed(userId, viewerId, token);
      } catch (error) {
        // Silent fail
      }
    },
    [token],
  );

  // Check VIP status for the creator's userid (not portfolio_id)
  useEffect(() => {
    // Get the creator's actual userid (not portfolio_id)
    const creatorUserId = creator?.userid;

    if (creatorUserId) {
      dispatch(checkVipStatus(creatorUserId) as any);
    }
  }, [creator?.userid, dispatch]);

  // Check VIP celebration status when VIP status is confirmed
  useEffect(() => {
    const checkCelebration = async () => {
      const currentUserId = getCurrentUserId();

      // Get the creator's actual userid (not portfolio_id)
      const creatorUserId = creator?.userid;

      // Check VIP status from both creator data and Redux store
      // Use creator.userid (the actual user ID) instead of Creator[0] (portfolio_id)
      const isVip = vipStatus?.isVip || vipStatusFromCreator?.isVip;

      // Only proceed if VIP status is confirmed and we have both user IDs
      if (
        isVip === true &&
        creatorbyidstatus === "succeeded" &&
        creatorUserId &&
        currentUserId &&
        !celebrationChecked
      ) {
        setCelebrationChecked(true);

        try {
          // Use creator's userid, not portfolio_id
          const shouldShow = await checkVipCelebrationStatus(
            creatorUserId,
            currentUserId,
          );

          if (shouldShow) {
            setShowVipCelebration(true);
            setVipCelebrationShown(true);

            // Mark as viewed in database - use creator's userid
            await markVipCelebrationAsViewed(creatorUserId, currentUserId);

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
  }, [
    vipStatus,
    vipStatusFromCreator,
    creatorbyidstatus,
    creator?.userid,
    userid,
    celebrationChecked,
    checkVipCelebrationStatus,
    markVipCelebrationAsViewed,
  ]);

  // Reset VIP celebration tracking when switching creators (use creator.userid instead of portfolio_id)
  useEffect(() => {
    setVipCelebrationShown(false);
    setShowVipCelebration(false);
    setCelebrationChecked(false);
  }, [creator?.userid, Creator[0]]);

  useEffect(() => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId || !Creator[0]) {
      return;
    }

    if (creatorbyidstatus !== "loading") {
      dispatch(
        getmycreatorbyid({
          hostid: Creator[0],
          token,
          userid: currentUserId,
        }),
      );
    }

    // Fetch ALL ratings using the new 5-star rating system (both fan-to-creator and creator-to-creator)
    if (ratings_stats !== "loading") {
      dispatch(
        getAllCreatorRatings({
          creatorId: Creator[0],
          token,
        }),
      );
    }
  }, [userid, Creator[0], token]);

  useEffect(() => {
    if (creatorbyidstatus === "succeeded") {
      setLoading(false);
      setshowcreator(true);
      checkcrush();

      // Prefer new shape from backend: creator.creatorfiles[].creatorfilelink
      // Fallback to legacy creator.photolink (string or string[])
      const linksimg =
        Array.isArray((creator as any).creatorfiles) &&
        (creator as any).creatorfiles.length > 0
          ? (creator as any).creatorfiles
              .map((f: any) => f?.creatorfilelink)
              .filter((url: string) => typeof url === "string" && url.trim())
          : typeof creator.photolink === "string" && creator.photolink.trim()
            ? creator.photolink.split(",").filter((url: string) => url.trim())
            : Array.isArray(creator.photolink) && creator.photolink.length > 0
              ? (creator.photolink as string[]).filter(
                  (url: string) => typeof url === "string" && url.trim(),
                )
              : [];

      try {
        console.log("[CreatorPortfolio][images] derived linksimg:", linksimg);
        console.log(
          "[CreatorPortfolio][images] from creatorfiles:",
          Array.isArray((creator as any).creatorfiles)
            ? (creator as any).creatorfiles
            : "no creatorfiles",
        );
        console.log(
          "[CreatorPortfolio][images] legacy photolink:",
          creator.photolink,
        );
      } catch {}

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
      const currentUserId = getCurrentUserId();

      if (!Creator[0] || !currentUserId) {
        return;
      }

      const data = {
        creator_portfolio_id: Creator[0],
        userId: currentUserId,
      };

      const response = await dispatch(getViews(data));

      try {
        const payload = response?.payload?.response;

        if (!payload) {
          setViews(0);
          return;
        }

        // Ensure payload is a valid JSON string
        const parsed =
          typeof payload === "string" ? JSON.parse(payload) : payload;
        setViews(parsed?.views ?? 0);
      } catch (err) {
        setViews(0);
      }
    };

    fetchViews();
  }, [Creator[0], userid, dispatch]);

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
    const currentUserId = getCurrentUserId();

    if (currentUserId) {
      if (creator.userid === currentUserId) {
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
      return "Meet and Greet with";
    } else if (normalizedHosttype == "Fan date") {
      return "Exclusive Date with";
    } else if (
      normalizedHosttype == "Fan call" ||
      normalizedHosttype == "Fan Call"
    ) {
      return "A Private Conversation with";
    } else {
      return "Engage with";
    }
  };

  const isFanDateCreator =
    String(creator?.hosttype || "")
      .trim()
      .toLowerCase() === "fan date";

  const normalizedCreatorHosttype = String(creator?.hosttype || "")
    .trim()
    .toLowerCase();
  const isFanCallCreator = normalizedCreatorHosttype === "fan call";
  const creatorServiceTitle = isFanCallCreator
    ? "Fan Call"
    : isFanDateCreator
      ? "Fan Date"
      : "Fan Meet & Greet";
  const creatorServiceNoun = isFanCallCreator
    ? "call"
    : isFanDateCreator
      ? "date"
      : "meet";
  const creatorDetailsTitle = isFanCallCreator
    ? "Call Details"
    : isFanDateCreator
      ? "Date Details"
      : "Meet Details";
  const creatorPriceValue = formatCreatorPrices(creator?.price || "") || "0";
  const creatorRateSuffix = isFanCallCreator
    ? "/min"
    : isFanDateCreator
      ? "/date"
      : "/meet";
  const creatorDurationText = isFanCallCreator
    ? "Billed per minute"
    : `${formatCreatorPrices(String(creator?.duration || "")) || "30"} minutes`;
  const availabilityDays = String(creator?.daysava || "")
    .split(/[\s,]+/)
    .map((day) => day.trim())
    .filter(Boolean);
  const availabilityHours = String(creator?.timeava || "")
    .split(/[\s,]+/)
    .map((time) =>
      time
        .trim()
        .replace(/(AM|PM)$/i, " $1")
        .toUpperCase(),
    )
    .filter(Boolean);

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
  const [imgError, setImgError] = useState(false);

  const checkimg = () => {
    if (loading === false) {
      if (imglist.length > 0) {
        return (
          <div className="pt-2 pb-4 md:pt-60">
            <div className="relative w-full h-[300px] overflow-hidden rounded-md">
              {(() => {
                const original = String(
                  imglist[currentImageIndex] || "",
                ).trim();
                const isStorj = original.startsWith(
                  "https://gateway.storjshare.io/",
                );
                const key = (() => {
                  try {
                    const parts = original.split("/");
                    return parts[parts.length - 1];
                  } catch {
                    return "";
                  }
                })();
                // For Storj gateway (403 on direct), always proxy through backend
                const src =
                  isStorj && key
                    ? (() => {
                        // Extract bucket name from the original URL
                        const urlParts = original.split("/");
                        const bucketIndex =
                          urlParts.findIndex(
                            (part) => part === "gateway.storjshare.io",
                          ) + 1;
                        const bucket = urlParts[bucketIndex] || "post"; // Default to 'post' for legacy images
                        return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=${bucket}`;
                      })()
                    : original;
                // Render image (use <img> to avoid optimizer issues)
                if (imgError || isStorj) {
                  return (
                    <img
                      height={300}
                      width={400}
                      alt="host pics"
                      src={src}
                      className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      onClick={() => openModal(src)}
                      onLoad={() => {
                        try {
                          console.log(
                            "[CreatorPortfolio][img] onLoad src:",
                            src,
                          );
                        } catch {}
                      }}
                      onError={() => {
                        try {
                          console.warn(
                            "[CreatorPortfolio][img] onError src:",
                            src,
                          );
                        } catch {}
                        setImgError(true);
                      }}
                    />
                  );
                }
                return (
                  <Image
                    height={300}
                    width={400}
                    alt="host pics"
                    src={src}
                    className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={() => openModal(src)}
                    unoptimized
                    onLoadingComplete={() => {
                      try {
                        console.log(
                          "[CreatorPortfolio][next-image] loaded src:",
                          src,
                        );
                      } catch {}
                    }}
                    onError={() => {
                      try {
                        console.warn(
                          "[CreatorPortfolio][next-image] onError src:",
                          src,
                        );
                      } catch {}
                      setImgError(true);
                    }}
                    priority
                  />
                );
              })()}

              {/* Navigation arrows */}
              {imglist.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? imglist.length - 1 : prev - 1,
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
                        prev === imglist.length - 1 ? 0 : prev + 1,
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
          photolink: Array.isArray(creator.photolink)
            ? creator.photolink
            : [creator.photolink].filter(Boolean),
          hostid: creator.hostid,
          token,
          docCount,
        }),
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
    const currentUserId = getCurrentUserId();

    if (creator.userid === currentUserId) {
      return false;
    } else {
      return true;
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = `${creator.name || "Creator"} on Mmeko`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Profile link copied", { autoClose: 2000 });
      }
    } catch (error) {
      // User cancelled native share sheet.
    }
  };

  const Check_review = () => {
    setreview_click(true);
    if (ratings_stats === "loading") {
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
      console.log("🔍 [CreatorPortfolio] Showing reviews:", {
        ratings: ratings.length,
        totalRatings,
        averageRating,
      });

      if (ratings.length > 0) {
        return ratings.map((rating: any, index: number) => {
          return (
            <CreatorReview
              key={index}
              content={rating.feedback}
              name={rating.fanName || rating.creatorName || "Unknown"}
              photolink={rating.fanPhoto || rating.creatorPhoto || ""}
              posttime={rating.createdAt}
              id={rating._id}
              userid={rating.fanId || rating.creatorId || ""}
              rating={rating.rating}
              hostType={rating.hostType}
              requestId={rating.requestId}
              ratingType={rating.ratingType}
              fanName={rating.fanName}
              fanPhoto={rating.fanPhoto}
              creatorName={rating.creatorName}
              creatorPhoto={rating.creatorPhoto}
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
    const currentUserId = getCurrentUserId();

    console.log("🔍 [addTocrush] Debug:", {
      addcrush_stats,
      removeCrush,
      userid: currentUserId,
      token: token ? "present" : "missing",
      creator_hostid: creator.hostid,
      creator_userid: creator.userid,
    });

    if (addcrush_stats !== "loading" && removeCrush === false) {
      set_dcb(true);
      set_crush_text("adding to crush list...");
      console.log("🔍 [addTocrush] Dispatching addcrush:", {
        userid: currentUserId,
        token,
        creator_portfolio_id: creator.hostid,
      });
      dispatch(
        addcrush({
          userid: currentUserId,
          token,
          creator_portfolio_id: creator.hostid,
        }),
      );
    }

    if (remove_crush_stats !== "loading" && removeCrush === true) {
      set_dcb(true);
      set_crush_text("removing crush from list...");
      console.log("🔍 [addTocrush] Dispatching remove_Crush:", {
        userid: currentUserId,
        token,
        creator_portfolio_id: creator.hostid,
      });
      dispatch(
        remove_Crush({
          userid: currentUserId,
          token,
          creator_portfolio_id: creator.hostid,
        }),
      );
    }
  };

  const handleRequestDetailsSubmit = async (details: {
    date: string;
    time: string;
    venue: string;
  }) => {
    const currentUserId = getCurrentUserId();

    console.log("Sending request with:", {
      userid: currentUserId,
      creator_portfolio_id: creator.hostid,
      creatorUserid: creator.userid,
      type: creator.hosttype,
      date: details.date,
      time: details.time,
      place: details.venue,
      price: parseFloat(creator.price) || 0,
    });

    // Check if user has enough gold balance (skip for Fan call requests)
    const userBalance = parseFloat(profile.balance) || 0;
    const requiredAmount = parseFloat(creator.price) || 0;

    // Only check balance for Fan meet and Fan date, not for Fan call
    // Allow exact matches (userBalance === requiredAmount is valid)
    if (
      creator.hosttype !== "Fan call" &&
      creator.hosttype !== "Fan Call" &&
      userBalance < requiredAmount
    ) {
      toast.error(
        `Insufficient gold! You need ${requiredAmount} gold but only have ${userBalance} gold.`,
      );
      // Redirect to buy-gold page
      setTimeout(() => {
        navigate("/buy-gold");
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`${URL}/requesthost`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: currentUserId,
          creator_portfolio_id: creator.hostid, // Use hostid for creator lookup in creatordb
          type: creator.hosttype,
          date: details.date,
          time: details.time,
          place: details.venue,
          price: parseFloat(creator.price) || 0,
        }),
      });

      if (response.ok) {
        setShowRequestDetails(false);
        setrequestclick(false);
        const serviceType = creator.hosttype || "Fan meet";
        toast.success(`${serviceType} request sent successfully!`);
        // Optionally navigate to notifications
        setTimeout(() => {
          navigate("/notifications/activity");
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Error sending request");
    }
  };

  const checkOnline = () => {
    if (creator.active) {
      return "online";
    } else {
      return "offline";
    }
  };

  if (!loading && creator?.userid && !creator?.hosttype && !creator?.price) {
    const tst = toast.loading("Curating your creator, please wait!");
    navigate("/creators/editcreatorportfolio");
    setLoading(true);
    setTimeout(() => {
      toast.dismiss(tst);
    }, 5000);
  }

  const psPrice = creator?.price?.replace(/(GOLD)(per)/, "$1 $2");
  const fmtPSPrice = psPrice?.includes("per minute")
    ? psPrice
    : `${psPrice} Gold/min`;

  const renderShowmodeSkeleton = () => (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="w-full max-w-4xl mx-auto overflow-hidden bg-[#111624] text-white shadow-2xl">
        <div className="sticky top-0 z-40 flex h-[52px] items-center justify-between px-4 py-3 bg-[#070b15]">
          <Skeleton width={22} height={22} />
          <div className="flex items-center gap-2">
            <Skeleton width={28} height={28} className="rounded-lg" />
            <Skeleton width={70} height={18} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={66} height={32} className="rounded-lg" />
            <Skeleton width={34} height={34} className="rounded-full" />
          </div>
        </div>

        <div className="relative bg-[#111624]">
          <Skeleton width="100%" height={300} />

          <div className="relative px-5 pt-12 pb-5 bg-[#111624]">
            <div className="absolute left-5 -top-10">
              <Skeleton circle width={80} height={80} />
            </div>

            <div className="ml-28 sm:ml-32 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <Skeleton width={36} height={20} />
                    <Skeleton width={54} height={12} />
                  </div>
                ))}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton width={120} height={28} />
                <Skeleton width={76} height={24} className="rounded" />
              </div>
              <Skeleton width={92} height={16} />
              <Skeleton width={210} height={18} />
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 pb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton width="100%" height={42} className="rounded-xl" />
              <Skeleton width="100%" height={42} className="rounded-xl" />
            </div>

            <div className="rounded-2xl border border-violet-500/40 bg-[#111426] p-5">
              <div className="mb-5 flex items-center justify-between">
                <Skeleton width={120} height={16} />
                <Skeleton width={108} height={26} className="rounded-md" />
              </div>
              <div className="flex items-end gap-3">
                <Skeleton width={40} height={40} className="rounded-full" />
                <Skeleton width={96} height={42} />
                <Skeleton width={48} height={18} />
              </div>
              <Skeleton width={220} height={16} className="mt-3" />
              <div className="mt-5 space-y-3">
                <Skeleton width="70%" height={18} />
                <Skeleton width="64%" height={18} />
                <Skeleton width="60%" height={18} />
              </div>
            </div>

            <Skeleton width="100%" height={56} className="rounded-xl" />

            <div className="space-y-3">
              <Skeleton width={130} height={16} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
                      key={index}
                      width="100%"
                      height={66}
                      className="rounded-lg"
                    />
                  ))}
              </div>
              <Skeleton width="100%" height={88} className="rounded-lg" />
              <Skeleton width="100%" height={88} className="rounded-lg" />
            </div>

            <div className="space-y-4">
              <Skeleton width={160} height={16} />
              <Skeleton width="100%" height={70} />
              <Skeleton width="100%" height={160} className="rounded-2xl" />
              <Skeleton width="100%" height={80} className="rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
  // Don't render if creator data is not available or still loading
  if (
    loading ||
    creatorbyidstatus === "loading" ||
    !creator ||
    Object.keys(creator).length === 0
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {renderShowmodeSkeleton()}
      </div>
    );
  }

  // Show error message if creator fetch failed
  if (creatorbyidstatus === "failed") {
    return (
      <div className="pt-5 md:pt-0">
        <div className="relative w-full pb-16 mx-auto overflow-auto md:max-w-md sm:ml-8 md:mt-5 md:mr-auto md:ml-24 xl:ml-42 2xl:ml-52">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              Creator Not Found
            </h2>
            <p className="text-gray-400 mb-4">
              The creator you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <button
              onClick={() => router.push("/creators")}
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
    <div
      className="min-h-screen bg-[#080b14] text-[#f1f5f9]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
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

      {loading && renderShowmodeSkeleton()}

      {showmode && (
        <div className="w-full max-w-4xl mx-auto overflow-hidden bg-[#080b14] text-[#f1f5f9] shadow-2xl">
          <ul className="sticky top-0 z-40 flex h-[52px] items-center justify-between px-4 py-3 bg-[#080b14] border border-gray-900">
            <li>
              <div
                onClick={() => router.back()}
                className="cursor-pointer text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                <IoArrowBack className="w-5 h-5" />
              </div>
            </li>
            <li>
              <div className="font-bold text-[#f1f5f9] flex items-center gap-2">
                <span className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white px-2 py-1 rounded-full">
                  M
                </span>
                <span>mmeko</span>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="rounded-lg border border-gray-800 bg-white/5 px-4 py-2 text-sm font-semibold text-[#94a3b8] transition-all duration-200 hover:bg-white/10 hover:text-[#f1f5f9]"
                >
                  Share
                </button>

                {checkuser() && (
                  <div className="relative bg-[#080b14]">
                    <button
                      onClick={(e) => {
                        setcloseOption(!closeOption);
                        e.stopPropagation();
                      }}
                      className="p-2 bg-[#161b2e] hover:bg-[#1e2335] rounded-full transition-colors duration-200"
                    >
                      <Image
                        className="w-5 h-5"
                        alt="options"
                        src={optionicon}
                      />
                    </button>

                    {closeOption && (
                      <div className="absolute right-0 top-12 bg-[#161b2e] rounded-lg shadow-xl border border-white/7 z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            navigate("/creators/editcreatorportfolio");
                            setcloseOption(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#f1f5f9] hover:bg-[#1e2335] rounded-t-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Image
                            src={editIcon}
                            alt="edit"
                            className="w-4 h-4"
                          />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            confirmDelete();
                            setcloseOption(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#f472b6] hover:bg-[#1e2335] rounded-b-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Image
                            src={deleteicon}
                            alt="delete"
                            className="w-4 h-4"
                          />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>
          {/* Image Gallery */}
          <div className="relative bg-[#080b14]">
            {checkimg()}

            {/* Profile summary */}
            <div className="relative px-5 pt-12 pb-5">
              <div className="absolute left-5 -top-10">
                <div className="relative rounded-full w-20 h-20 overflow-hidden">
                  {creator.photolink &&
                  creator.photolink[0] &&
                  !profileImageFailed ? (
                    <Image
                      src={creator.photolink[0]}
                      alt="Profile Picture"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      onError={() => setProfileImageFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] flex items-center justify-center">
                      <span className="text-[#f1f5f9] text-3xl font-bold">
                        {(creator.name || "M").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Online indicator on the right */}
                {checkOnline() === "online" && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-[#111624]"></div>
                )}

                {/* VIP Badge - positioned on top-left of creator image */}
                {(() => {
                  // Check VIP status from both Redux store and creator data
                  const isVip = vipStatus?.isVip || vipStatusFromCreator?.isVip;
                  const vipEndDate =
                    vipStatus?.vipEndDate || vipStatusFromCreator?.vipEndDate;
                  return (
                    isVip === true && (
                      <div className="absolute bottom-8 left-7 z-20">
                        <VIPBadge
                          size="xl"
                          isVip={isVip}
                          vipEndDate={vipEndDate}
                        />
                      </div>
                    )
                  );
                })()}
              </div>

              <div className="ml-28 sm:ml-32 grid grid-cols-3 items-end gap-2 sm:gap-4">
                <div className="text-center flex flex-col items-center">
                  <p className="text-xl font-bold text-[#f1f5f9]">{views}</p>
                  <p className="text-xs text-[#94a3b8] mt-2">Views</p>
                </div>

                <div className="text-center flex flex-col items-center">
                  <div className="text-sm mb-2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#f59e0b]">
                        {i < Math.round(averageRating || 0) ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#94a3b8]">Rating</p>
                </div>

                <div className="text-center flex flex-col items-center">
                  <p className="text-xl font-bold text-[#f1f5f9]">
                    {totalRatings}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-2">Reviews</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex flex-col-2 gap-2">
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-[#f1f5f9]">
                    {creator.name?.split(" ")[0] || "Creator"}
                    {creator.verify && (
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-950/80 px-2 py-1 text-xs font-semibold text-[#2dd4bf] ring-1 ring-cyan-500/60">
                        <IoCheckmarkCircleOutline className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </h1>
                  {isFanDateCreator && (
                    <span className="mt-2 inline-flex items-center rounded border border-[#f472b6]/70 bg-pink-950/70 px-2 py-1 text-xs font-semibold text-[#f472b6]">
                      Exclusive
                    </span>
                  )}
                </div>
                {creator.username && (
                  <p className="mt-2 text-sm font-semibold text-[#94a3b8]">
                    {creator.username}
                  </p>
                )}
                <p className="mt-3 text-sm font-semibold text-[#94a3b8]">
                  {getStatus(String(creator?.hosttype))}{" "}
                  {creator.name?.split(" ")[0] || "creator"}
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 pt-3 pb-8">
            <div className="space-y-6">
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
                  <div className="bg-[#111624] p-6 rounded-lg text-white w-11/12 max-w-md">
                    <h2 className="text-lg font-bold mb-4">⚠ Warning</h2>
                    <p className="mb-4">
                      Deleting your portfolio will permanently remove all your
                      views, and you may lose pending fan requests and unclaimed
                      gold. Your visibility will also drop if you create a new
                      portfolio.
                      <br />
                      <br />
                      Are you certain you want to proceed?
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
              {Cantchat() && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="rounded-xl border border-white/7 bg-[#111827] px-3 py-2 lg:px-6 lg:py-3 text-xs lg:text-sm font-bold text-[#f1f5f9] transition-all duration-200 hover:border-white/20 hover:bg-[#151d2e]"
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
                    className="rounded-xl border border-[#f472b6]/40 bg-[#f472b6]/10 px-3 py-2 lg:px-6 lg:py-3 text-xs lg:text-sm font-bold text-[#f472b6] transition-all duration-200 hover:border-[#f472b6]/70 hover:bg-[#f472b6]/20 disabled:opacity-50"
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
                    {dcb ? "⏳ Processing..." : `🎯 ${crush_text}`}
                  </button>
                </div>
              )}
              {/* Meet Card */}
              <div className="rounded-2xl border  border-[#6c63ff]/60 bg-[#111426] p-5 shadow-2xl ring-1 ring-[#2dd4bf]/20">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#a89cff]">
                    {creatorServiceTitle}
                  </p>
                  <span
                    className={`rounded-md border px-3 py-1 text-xs font-bold ${
                      checkOnline() === "online"
                        ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
                        : "border-0"
                    }`}
                  >
                    {checkOnline() === "online" ? "🟢 Online Now" : ""}
                  </span>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <Coins className="h-10 w-10 text-[#f59e0b]" />
                  <span className="text-4xl font-black leading-none text-[#f1f5f9]">
                    {creatorPriceValue}
                  </span>
                  <span className="pb-1 text-base font-semibold text-[#94a3b8]">
                    {creatorRateSuffix}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#94a3b8]">
                  Fan pays {isFanCallCreator ? "per minute" : "upfront"} - you keep 100%
                </p>

                <div className="mt-5 space-y-3 text-sm text-[#94a3b8]">
                  <p className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#6c63ff]/50 bg-[#6c63ff]/10 text-xs text-[#a89cff]">
                      ✓
                    </span>
                    {creatorDurationText}
                    {!isFanCallCreator && ", public venue only"}
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#6c63ff]/50 bg-[#6c63ff]/10 text-xs text-[#a89cff]">
                      ✓
                    </span>
                    Payment secured before the {creatorServiceNoun}
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#6c63ff]/50 bg-[#6c63ff]/10 text-xs text-[#a89cff]">
                      ✓
                    </span>
                    All communication on-platform
                  </p>
                </div>
              </div>

              {Cantchat() && (
                <button
                  className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] px-6 py-4 text-base font-black text-[#f1f5f9] shadow-lg transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
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
                  🎯 Request {creatorServiceTitle}
                </button>
              )}
              {/* Follow Strip */}
              {!checkuser() && (
                <FollowStrip
                  creatorName={creator.name || "Creator"}
                  creatorId={creator.hostid || ""}
                  creatorUserId={creator.userid || ""}
                  followingUser={creator.followingUser || false}
                  checkuser={checkuser()}
                />
              )}
              {/* Meet Details */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#f1f5f9]">
                  <span className="h-0.5 w-3 bg-[#6c63ff]"></span>
                  {creatorDetailsTitle}
                </h2>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                    <p className="text-xs font-bold uppercase text-[#94a3b8]">
                      👤 Creator
                    </p>
                    <p className="mt-1 font-bold text-[#f1f5f9] text-[12px] lg:text-xs">
                      {creator.name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                    <p className="text-xs font-bold uppercase text-[#94a3b8]">
                      📍 Location
                    </p>
                    <p className="mt-1 font-bold text-[#f1f5f9] text-[12px] lg:text-xs">
                      {creator.location || "Not specified"}
                    </p>
                  </div>

                  {!isFanCallCreator && (
                    <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                      <p className="text-xs font-bold uppercase text-[#94a3b8]">
                        ⏱ Duration
                      </p>
                      <p className="mt-1 font-bold text-[#f1f5f9] text-[12px] lg:text-xs">
                        {creatorDurationText}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                    <p className="text-xs font-bold uppercase text-[#94a3b8]">
                      ✅ Status
                    </p>
                    <p
                      className={`mt-1 font-bold text-[12px] lg:text-xs ${creator.verify ? "text-[#2dd4bf]" : "text-[#f59e0b]"}`}
                    >
                      {creator.verify ? "✓ Verified Creator" : "Not verified"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                  <p className="text-xs font-bold uppercase text-[#94a3b8]">
                    📅 Available Days
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availabilityDays.length > 0 ? (
                      availabilityDays.map((day) => (
                        <span
                          key={day}
                          className="rounded-md border border-[#22c55e] px-4 py-2 text-xs font-bold uppercase text-[#22c55e]"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs lg:text-sm text-[#94a3b8]">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                  <p className="text-xs font-bold uppercase text-[#94a3b8]">
                    🕘 Available Hours
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availabilityHours.length > 0 ? (
                      availabilityHours.map((time) => (
                        <span
                          key={time}
                          className="rounded-md bg-[#0e1220] px-3 py-1 text-xs lg:text-sm font-semibold text-[#94a3b8] ring-1 ring-gray-800"
                        >
                          {time}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#94a3b8]">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section className="space-y-6">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#f1f5f9]">
                    <span className="h-0.5 w-3 bg-[#6c63ff]"></span>
                    About {creator.name?.split(" ")[0] || "Creator"}
                  </h2>
                  <p className="text-sm leading-7 text-[#94a3b8]">
                    {creator.description || "No description yet."}
                  </p>
                </div>

                {!isFanCallCreator && (
                  <div className="overflow-hidden rounded-2xl border border-[#f59e0b]/30 bg-[#171d30]">
                    <div className="border-b border-[#f59e0b]/20 px-5 py-4">
                      <h3 className="font-bold text-[#f59e0b]">
                        ⚠ Safety Rules - Important
                      </h3>
                    </div>
                    <div className="space-y-4 p-5 text-sm text-[#94a3b8]">
                      <p className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/60 text-xs text-[#f59e0b]">
                          1
                        </span>
                        All {creatorServiceTitle.toLowerCase()} sessions are
                        limited to{" "}
                        <strong className="text-[#f1f5f9]">30 minutes.</strong>
                      </p>
                      <p className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/60 text-xs text-[#f59e0b]">
                          2
                        </span>
                        {creatorServiceTitle} must happen in a{" "}
                        <strong className="text-[#f1f5f9]">
                          public place only
                        </strong>{" "}
                        - cafes, restaurants, or similar venues.
                      </p>
                      <p className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/60 text-xs text-[#f59e0b]">
                          3
                        </span>
                        What happens after 30 minutes is{" "}
                        <strong className="text-[#f1f5f9]">
                          outside the platform&apos;s responsibility.
                        </strong>
                      </p>
                      <p className="border-t border-white/4 pt-4 text-xs text-[#94a3b8]">
                        By sending a request, you agree to follow these rules.
                      </p>
                    </div>
                  </div>
                )}

                {
                  //show reviews button regardless of whether the creator is a Fan Call creator or not.
                  <button
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-800 bg-[#111827] p-5 text-left transition-colors duration-200 hover:border-[#6c63ff]/40"
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
                    <div className="flex items-center gap-4">
                      <span className="text-4xl text-[#f59e0b]">★</span>
                      <div>
                        <p className="text-xl font-black text-[#f1f5f9]">
                          {totalRatings} Reviews
                        </p>
                        <p className="text-sm text-[#94a3b8]">
                          {totalRatings > 0
                            ? "See what fans are saying"
                            : "No reviews yet - be the first"}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl text-[#94a3b8]">›</span>
                  </button>
                }
              </section>

              {review_click && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-black">Reviews</h2>
                      <button
                        onClick={(e) => {
                          setreview_click(false);
                        }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
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
                          <p className="text-black mt-4">Loading reviews...</p>
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
              {requestclick && (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full"
                  onClick={() => setrequestclick(false)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Requestinfo
                      setrequestclick={setrequestclick}
                      amount={creator.price}
                      setsuccess={setsuccess}
                      type={creator.hosttype}
                    />
                  </div>
                </div>
              )}

              {success && (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full"
                  onClick={() => setsuccess(false)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full"
                  onClick={() => setrequested(false)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Requestsuccess setrequested={setrequested} />
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
        </div>
      )}
    </div>
  );
}
