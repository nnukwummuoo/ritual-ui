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
import { CreatorReview } from "../_components/Creator_review";
import { IoArrowBack, IoCheckmarkCircleOutline } from "react-icons/io5";
import { BadgeCheck, ArrowLeftSquare, Coins } from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import {
  getmycreatorbyid,
  changecreatorstatus,
  deletecreator,
} from "@/store/creatorSlice";
import { addcrush, remove_Crush } from "@/store/creatorSlice";
// @ts-ignore: side-effect import of CSS without type declarations
import "material-react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
// @ts-ignore: side-effect import of CSS without type declarations
import "react-loading-skeleton/dist/skeleton.css";

import CreatorByIdNav from "../_components/CreatorByIdNav";
import FollowStrip from "../_components/FollowStrip";
import { formatCreatorPrices } from "../_utils/formatCreatorPrices";
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
import LoginPromptBanner from "@/components/LoginPromptBanner";

// Types
interface RootState {
  register: { userID: string; logedin: boolean; refreshtoken: string };
  profile: { creator_portfolio_id: string; balance: string; photolink?: string };
  creator: {
    userid: string; hostid: string; name: string; age: string;
    location: string; price: string; duration: string; description: string;
    gender: string; timeava: string; daysava: string; hosttype: string;
    photolink: string | string[]; verify: boolean; active: boolean;
    add: boolean; followingUser: boolean; message: string;
    creatorbyidstatus: string; getreviewstats: string;
    creatordeletestatus: string;
    reviewList: Array<{ content: string; name: string; photolink: string; posttime: string; id: string; userid: string }>;
    addcrush_stats: string; remove_crush_stats: string;
    creatorbyid: {
      userid: string; hostid: string; name: string; username?: string;
      age: string; location: string; price: string; duration: string;
      description: string; gender: string; timeava: string; daysava: string;
      hosttype: string; photolink: string | string[]; verify: boolean;
      active: boolean; add: boolean; followingUser: boolean;
      isVip?: boolean; vipEndDate?: string;
      userPhotolink?: string | null; 
    };
  };
}

export default function Creatorbyid() {
  const params = useParams<{ username: string }>();
  const Creator = params?.username?.split(",") || [];
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  

  const useridFromHook = useUserId();
  const { session } = useAuth();
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
const isAuthenticated = !!session?._id;

  const [userid, setUserid] = useState<string>("");
  const [showSharePopup, setShowSharePopup] = useState(false);
const [urlCopied, setUrlCopied] = useState(false);
  const [userResolved, setUserResolved] = useState(false);

  useEffect(() => {
    if (useridFromHook) setUserid(useridFromHook);
    else if (session?._id) setUserid(session._id);
    else if (reduxUserid) setUserid(reduxUserid);
    else {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setUserid(data?.userID || data?.userid || data?.id || "");
        }
      } catch {}
    }
  }, [useridFromHook, session?._id, reduxUserid]);



  const reduxToken = useSelector((state: RootState) => state.register.refreshtoken);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (reduxToken) setToken(reduxToken);
    else if (session?.token) setToken(session.token);
    else {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setToken(data?.refreshtoken || data?.accesstoken || "");
        }
      } catch {}
    }
  }, [reduxToken, session?.token]);

  const message = useSelector((state: RootState) => state.creator.message);
  const creatorbyidstatus = useSelector((state: RootState) => state.creator.creatorbyidstatus);
  const getreviewstats = useSelector((state: RootState) => state.creator.getreviewstats);
  const creatordeletestatus = useSelector((state: RootState) => state.creator.creatordeletestatus);
  const reviewList = useSelector((state: RootState) => state.creator.reviewList || []);
  const ratings = useSelector((s: RootState) => (s.profile as any).ratings || []);
  const ratings_stats = useSelector((s: RootState) => (s.profile as any).ratings_stats || "idle");
  const totalRatings = useSelector((s: RootState) => (s.profile as any).totalRatings || 0);
  const averageRating = useSelector((s: RootState) => (s.profile as any).averageRating || 0);
  const ratingCounts = useSelector((s: RootState) => (s.profile as any).ratingCounts || {});
  const addcrush_stats = useSelector((state: RootState) => state.creator.addcrush_stats);
  const remove_crush_stats = useSelector((state: RootState) => state.creator.remove_crush_stats);
  const creator = useSelector((state: RootState) => state.creator.creatorbyid);
  const profile = useSelector((state: RootState) => state.profile);
  const vipStatus = useSelector((s: any) => s.vip?.vipStatus);
  const vipStatusFromCreator = creator?.isVip ? { isVip: creator.isVip, vipEndDate: creator.vipEndDate } : null;

  const [user, setUser] = useState<{ refreshtoken: string } | null>(null);
  const [showmode, setshowcreator] = useState(false);
  const [photocount, setphotocount] = useState(0);
  const [oldlink, setoldlink] = useState<string[]>([]);
  const [documentlink] = useState<string[]>([]);
  const [docCount] = useState(0);
  const [creator_portfolio_id] = useState<[string?, string?]>([Creator[1], userid]);
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
  const [color1] = useState("#d49115");
  const [imglist, setimglist] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [views, setViews] = useState(0);
  const [showVipCelebration, setShowVipCelebration] = useState(false);
  const [vipCelebrationShown, setVipCelebrationShown] = useState(false);
  const [celebrationChecked, setCelebrationChecked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const navigate = (path: string) => router.push(path);
  

  const getCurrentUserId = () => {
    let currentUserId = userid;
    if (!currentUserId) {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          currentUserId = data?.userID || data?.userid || data?.id || "";
        }
      } catch {}
    }
    return currentUserId;
  };

  const checkVipCelebrationStatus = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return false;
    try {
      const response = await checkVipCelebration(userId, viewerId, token);
      return response.shouldShowCelebration;
    } catch { return false; }
  }, [token]);

  const markVipCelebrationAsViewed = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return;
    try { await markVipCelebrationViewed(userId, viewerId, token); } catch {}
  }, [token]);

  useEffect(() => {
    const creatorUserId = creator?.userid;
    if (creatorUserId) dispatch(checkVipStatus(creatorUserId) as any);
  }, [creator?.userid, dispatch]);

    useEffect(() => {
  // Only auto-show to the owner of this portfolio
  if (!checkuser()) return;

  // Check if they've already dismissed it permanently
  const dismissedKey = `share_popup_dismissed_${creator.hostid}`;
  const alreadyDismissed = localStorage.getItem(dismissedKey);
  if (alreadyDismissed) return;

  // Auto-open on ?new=1 (redirect here after portfolio creation)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("new") === "1") {
    setTimeout(() => setShowSharePopup(true), 600);
  }
}, [creator.hostid, userid]); // re-run once userid resolves

  useEffect(() => {
    const checkCelebration = async () => {
      const currentUserId = getCurrentUserId();
      const creatorUserId = creator?.userid;
      const isVip = vipStatus?.isVip || vipStatusFromCreator?.isVip;
      if (isVip === true && creatorbyidstatus === "succeeded" && creatorUserId && currentUserId && !celebrationChecked) {
        setCelebrationChecked(true);
        try {
          const shouldShow = await checkVipCelebrationStatus(creatorUserId, currentUserId);
          if (shouldShow) {
            setShowVipCelebration(true);
            setVipCelebrationShown(true);
            await markVipCelebrationAsViewed(creatorUserId, currentUserId);
            setTimeout(() => setShowVipCelebration(false), 5000);
          }
        } catch {}
      }
    };
    checkCelebration();
  }, [vipStatus, vipStatusFromCreator, creatorbyidstatus, creator?.userid, userid, celebrationChecked, checkVipCelebrationStatus, markVipCelebrationAsViewed]);

  useEffect(() => {
    setVipCelebrationShown(false);
    setShowVipCelebration(false);
    setCelebrationChecked(false);
  }, [creator?.userid, Creator[0]]);

  useEffect(() => {
  if (userid) setUserResolved(true);
}, [userid]);

useEffect(() => {
  if (!checkuser()) return;

  const dismissedKey = `share_popup_dismissed_${creator.hostid}`;
  const alreadyDismissed = localStorage.getItem(dismissedKey);
  if (alreadyDismissed) return;

  // Auto-show once on first visit
  const shownKey = `share_popup_shown_${creator.hostid}`;
  const alreadyShown = localStorage.getItem(shownKey);
  if (alreadyShown) return;

  if (creator.hostid) {
    setTimeout(() => {
      localStorage.setItem(shownKey, "true");
      setShowSharePopup(true);
    }, 600);
  }
}, [creator.hostid, userid]);

  useEffect(() => {
  const currentUserId = getCurrentUserId();
  if (!Creator[0]) return;
  dispatch(getmycreatorbyid({ hostid: null, token: token || undefined, userid: currentUserId || undefined, username: Creator[0] }));
  dispatch(getAllCreatorRatings({ creatorId: Creator[0], token: token || undefined }));
}, [userid, Creator[0], token]);

  useEffect(() => {
    if (creatorbyidstatus === "succeeded") {
        console.log("creator data:", creator); // 👈 add here
      setLoading(false);
      setshowcreator(true);
      checkcrush();
      const linksimg =
        Array.isArray((creator as any).creatorfiles) && (creator as any).creatorfiles.length > 0
          ? (creator as any).creatorfiles.map((f: any) => f?.creatorfilelink).filter((url: string) => typeof url === "string" && url.trim())
          : typeof creator.photolink === "string" && creator.photolink.trim()
          ? creator.photolink.split(",").filter((url: string) => url.trim())
          : Array.isArray(creator.photolink) && creator.photolink.length > 0
          ? (creator.photolink as string[]).filter((url: string) => typeof url === "string" && url.trim())
          : [];
      setphotocount(linksimg.length);
      setimglist(linksimg);
      setoldlink(linksimg);
      setCurrentImageIndex(0);
      dispatch(changecreatorstatus("idle"));
    }
    if (creatorbyidstatus === "failed") {
      setLoading(false);
      dispatch(changecreatorstatus("idle"));
    }
  }, [creatorbyidstatus, creator.photolink]);

  useEffect(() => { 
    const stored = localStorage.getItem("login");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
  const fetchViews = async () => {
    const currentUserId = getCurrentUserId();
    if (!Creator[0]) return;
    const data = { creator_portfolio_id: null, userId: currentUserId || "", username: Creator[0] };
    const response = await dispatch(getViews(data));
    try {
      const payload = response?.payload;
      setViews(payload?.views ?? 0);
    } catch { setViews(0); }
  };
  fetchViews();
}, [Creator[0], userid, dispatch]);

  useEffect(() => {
    if (creatordeletestatus === "succeeded") { dispatch(changecreatorstatus("idle")); setLoading(false); navigate("/"); }
    if (creatordeletestatus === "failed") { dispatch(changecreatorstatus("idle")); setLoading(false); }
  }, [creatordeletestatus]);

  useEffect(() => {
    if (addcrush_stats === "succeeded") { dispatch(changecreatorstatus("idle")); set_dcb(false); set_removeCrush(true); set_crush_text("Remove crush"); toast.success("Added to your crush list! 💜", { autoClose: 2000 }); }
    if (addcrush_stats === "failed") { dispatch(changecreatorstatus("idle")); set_crush_text("Add to crush"); set_dcb(false); }
    if (remove_crush_stats === "succeeded") { dispatch(changecreatorstatus("idle")); set_dcb(false); set_removeCrush(false); set_crush_text("Add to crush"); toast.success("Removed from your crush list", { autoClose: 2000 }); }
  }, [addcrush_stats, remove_crush_stats]);

  const checkcrush = () => {
    if (creator.add) { set_dcb(false); set_crush_text("Remove crush"); set_removeCrush(true); }
  };

  useEffect(() => {
    if (creatordeletestatus === "succeeded") { dispatch(changecreatorstatus("idle")); setLoading(false); navigate("/"); }
    if (creatordeletestatus === "failed") { toast.error(`${message}`, { autoClose: 2000 }); dispatch(changecreatorstatus("idle")); setLoading(false); }
  }, [creatordeletestatus]);

  const checkuser = () => {
    const currentUserId = getCurrentUserId();
    return currentUserId ? creator.userid === currentUserId : false;
  };

  const getStatus = (type: string) => {
    if (type === "Fan meet") return "Meet and Greet with";
    if (type === "Fan date") return "Exclusive Date with";
    if (type === "Fan call" || type === "Fan Call") return "A Private Conversation with";
    return "Engage with";
  };

  const isFanDateCreator = String(creator?.hosttype || "").trim().toLowerCase() === "fan date";
  const normalizedCreatorHosttype = String(creator?.hosttype || "").trim().toLowerCase();
  const isFanCallCreator = normalizedCreatorHosttype === "fan call";
  const creatorServiceTitle = isFanCallCreator ? "Fan Call" : isFanDateCreator ? "Fan Date" : "Fan Meet & Greet";
  const creatorServiceNoun = isFanCallCreator ? "call" : isFanDateCreator ? "date" : "meet";
  const creatorDetailsTitle = isFanCallCreator ? "Call Details" : isFanDateCreator ? "Date Details" : "Meet Details";
  const creatorPriceValue = formatCreatorPrices(creator?.price || "") || "0";
  const creatorRateSuffix = isFanCallCreator ? "/min" : isFanDateCreator ? "/date" : "/meet";
  const creatorDurationText = isFanCallCreator ? "Billed per minute" : `${formatCreatorPrices(String(creator?.duration || "")) || "30"} minutes`;
  const availabilityDays = String(creator?.daysava || "").split(/[\s,]+/).map((d) => d.trim()).filter(Boolean);
  const availabilityHours = String(creator?.timeava || "").split(/[\s,]+/).map((t) => t.trim().replace(/(AM|PM)$/i, " $1").toUpperCase()).filter(Boolean);

  const openModal = (imageSrc: string) => { setSelectedImage(imageSrc); setIsModalOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setIsModalOpen(false); setSelectedImage(""); document.body.style.overflow = "unset"; };
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) closeModal(); };

  const checkimg = () => {
    if (!loading && imglist.length > 0) {
      return imglist.map((imgUrl, i) => {
        const original = String(imgUrl || "").trim();
        const isStorj = original.startsWith("https://gateway.storjshare.io/");
        const key = (() => { try { const parts = original.split("/"); return parts[parts.length - 1]; } catch { return ""; } })();
        const src = isStorj && key
          ? (() => { const urlParts = original.split("/"); const bucketIndex = urlParts.findIndex((part) => part === "gateway.storjshare.io") + 1; const bucket = urlParts[bucketIndex] || "post"; return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=${bucket}`; })()
          : original;
        return (
          <div key={i} className="mcp-carousel-slide" style={{ background: ["linear-gradient(160deg,#0e1525,#1a1035)", "linear-gradient(160deg,#0e1525,#0d2030)", "linear-gradient(160deg,#160e25,#1a0d30)", "linear-gradient(160deg,#0e1a25,#0d1e30)"][i % 4] }}>
            {imgError || isStorj ? (
              <img src={src} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} onClick={() => openModal(src)} onError={() => setImgError(true)} />
            ) : (
              <Image src={src} alt={`Photo ${i + 1}`} fill style={{ objectFit: "cover", cursor: "pointer" }} onClick={() => openModal(src)} unoptimized onError={() => setImgError(true)} priority={i === 0} />
            )}
          </div>
        );
      });
    }
    // Placeholder slides when no images
    return [0, 1, 2, 3].map((i) => (
      <div key={i} className="mcp-carousel-slide" style={{ background: ["linear-gradient(160deg,#0e1525,#1a1035)", "linear-gradient(160deg,#0e1525,#0d2030)", "linear-gradient(160deg,#160e25,#1a0d30)", "linear-gradient(160deg,#0e1a25,#0d1e30)"][i] }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--mcp-text3)" }}>
          <div style={{ fontSize: 42, opacity: 0.25 }}>📸</div>
          <div style={{ fontSize: 12, opacity: 0.35, fontWeight: 500 }}>Photo {i + 1} of 4</div>
        </div>
      </div>
    ));
  };

  const totalSlides = imglist.length > 0 ? imglist.length : 4;

  const deleteCreator = () => {
    if (creatordeletestatus !== "loading") {
      setLoading(true);
      dispatch(deletecreator({ oldlink, documentlink, photocount, photolink: Array.isArray(creator.photolink) ? creator.photolink : [creator.photolink].filter(Boolean), hostid: creator.hostid, token, docCount }));
    }
  };

  const confirmDelete = () => setShowDeleteModal(true);
  const handleDeleteConfirm = (confirm: boolean) => { setShowDeleteModal(false); if (confirm) deleteCreator(); };

  const Cantchat = () => {
    const currentUserId = getCurrentUserId();
    return creator.userid !== currentUserId;
  };

  const handleShare = () => setShowSharePopup(true);

  const Check_review = () => {
    setreview_click(true);
    setLoading1(ratings_stats === "loading");
  };

  const show_review = () => {
    if (!loading1) {
      if (ratings.length > 0) {
        return ratings.map((rating: any, index: number) => (
          <CreatorReview key={index} content={rating.feedback} name={rating.fanName || rating.creatorName || "Unknown"} photolink={rating.fanPhoto || rating.creatorPhoto || ""} posttime={rating.createdAt} id={rating._id} userid={rating.fanId || rating.creatorId || ""} rating={rating.rating} hostType={rating.hostType} requestId={rating.requestId} ratingType={rating.ratingType} fanName={rating.fanName} fanPhoto={rating.fanPhoto} creatorName={rating.creatorName} creatorPhoto={rating.creatorPhoto} />
        ));
      }
      return <div className="flex justify-center w-full"><p className="text-sm text-slate-300">This creator got 0 reviews</p></div>;
    }
  };

  const addTocrush = () => {
    const currentUserId = getCurrentUserId();
    if (addcrush_stats !== "loading" && removeCrush === false) { set_dcb(true); set_crush_text("adding to crush list..."); dispatch(addcrush({ userid: currentUserId, token, creator_portfolio_id: creator.hostid })); }
    if (remove_crush_stats !== "loading" && removeCrush === true) { set_dcb(true); set_crush_text("removing crush from list..."); dispatch(remove_Crush({ userid: currentUserId, token, creator_portfolio_id: creator.hostid })); }
  };

  const handleRequestDetailsSubmit = async (details: { date: string; time: string; venue: string }) => {
    const currentUserId = getCurrentUserId();
    const userBalance = parseFloat(profile.balance) || 0;
    const requiredAmount = parseFloat(creator.price) || 0;
    if (creator.hosttype !== "Fan call" && creator.hosttype !== "Fan Call" && userBalance < requiredAmount) {
      toast.error(`Insufficient gold! You need ${requiredAmount} gold but only have ${userBalance} gold.`);
      setTimeout(() => navigate("/buy-gold"), 2000);
      return;
    }
    try {
      const response = await fetch(`${URL}/requesthost`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userid: currentUserId, creator_portfolio_id: creator.hostid, type: creator.hosttype, date: details.date, time: details.time, place: details.venue, price: parseFloat(creator.price) || 0 }) });
      if (response.ok) {
        setShowRequestDetails(false); setrequestclick(false);
        toast.success(`${creator.hosttype || "Fan meet"} request sent successfully!`);
        setTimeout(() => navigate("/notifications/activity"), 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send request");
      }
    } catch { toast.error("Error sending request"); }
  };

  const checkOnline = () => creator.active ? "online" : "offline";

  if (!loading && creator?.userid && !creator?.hosttype && !creator?.price) {
    const tst = toast.loading("Curating your creator, please wait!");
    navigate("/creators/editcreatorportfolio");
    setLoading(true);
    setTimeout(() => toast.dismiss(tst), 5000);
  }

  const renderShowmodeSkeleton = () => (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="w-full max-w-4xl mx-auto overflow-hidden bg-[#111624] text-white shadow-2xl">
        <div className="sticky top-0 z-40 flex h-[52px] items-center justify-between px-4 py-3 bg-[#070b15]">
          <Skeleton width={22} height={22} /><div className="flex items-center gap-2"><Skeleton width={28} height={28} className="rounded-lg" /><Skeleton width={70} height={18} /></div>
          <div className="flex items-center gap-2"><Skeleton width={66} height={32} className="rounded-lg" /><Skeleton width={34} height={34} className="rounded-full" /></div>
        </div>
        <div className="relative bg-[#111624]">
          <Skeleton width="100%" height={300} />
          <div className="relative px-5 pt-12 pb-5 bg-[#111624]">
            <div className="absolute left-5 -top-10"><Skeleton circle width={80} height={80} /></div>
            <div className="ml-28 sm:ml-32 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {Array(3).fill(0).map((_, i) => (<div key={i} className="flex flex-col items-center gap-2"><Skeleton width={36} height={20} /><Skeleton width={54} height={12} /></div>))}
            </div>
            <div className="mt-5 space-y-3"><div className="flex items-center gap-2"><Skeleton width={120} height={28} /><Skeleton width={76} height={24} className="rounded" /></div><Skeleton width={92} height={16} /><Skeleton width={210} height={18} /></div>
          </div>
        </div>
        <div className="px-4 pt-3 pb-8"><div className="space-y-6"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Skeleton width="100%" height={42} className="rounded-xl" /><Skeleton width="100%" height={42} className="rounded-xl" /></div><Skeleton width="100%" height={160} className="rounded-2xl" /><Skeleton width="100%" height={56} className="rounded-xl" /></div></div>
      </div>
    </SkeletonTheme>
  );

  if (loading || creatorbyidstatus === "loading" || !creator || Object.keys(creator).length === 0) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">{renderShowmodeSkeleton()}</div>;
  }

  if (creatorbyidstatus === "failed") {
    return (
      <div className="pt-5 md:pt-0">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Creator Not Found</h2>
          <p className="text-gray-400 mb-4">The creator you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push("/creators")} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Back to Creators</button>
        </div>
      </div>
    );
  }

  // ─── AVATAR initials ──────────────────────────────────────────────────────
  const avatarInitials = (() => {
    const source = String(creator.name || creator.username || "M").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    return source.charAt(0).toUpperCase();
  })();

  return (
    <>
      {/* ── Google Font ── */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Scoped styles ── */}
      <style>{`
        .mcp-root{--mcp-bg:#080b14;--mcp-bg2:#0b0f1c;--mcp-bg3:#0e1220;--mcp-card:#111624;--mcp-card2:#161b2e;--mcp-border:rgba(255,255,255,0.07);--mcp-border2:rgba(255,255,255,0.04);--mcp-accent:#6c63ff;--mcp-teal:#2dd4bf;--mcp-rose:#f472b6;--mcp-success:#22c55e;--mcp-gold:#f59e0b;--mcp-text:#f1f5f9;--mcp-text2:#94a3b8;--mcp-text3:#475569;background:var(--mcp-bg);color:var(--mcp-text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
        .mcp-nav{position:sticky;top:0;z-index:50;overflow:visible;background:rgba(8,11,20,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--mcp-border);padding:0 16px;height:54px;display:flex;align-items:center;justify-content:space-between;gap:8px;}
.mcp-nav-logo{display:flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0;}
.mcp-nav-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:auto;}
        
        .mcp-nav-logo-icon{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;}
        .mcp-nav-logo-name{font-size:15px;font-weight:700;color:var(--mcp-text);}
        .mcp-nav-back{background:none;border:none;color:var(--mcp-text2);font-size:22px;cursor:pointer;padding:4px 8px;border-radius:8px;transition:color .2s;line-height:1;}
        .mcp-nav-back:hover{color:var(--mcp-text);}

        .mcp-nav-share{background:rgba(255,255,255,.06);border:1px solid var(--mcp-border);color:var(--mcp-text2);font-size:13px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;font-family:inherit;transition:all .2s;}
        .mcp-nav-share:hover{color:var(--mcp-text);}
        .mcp-carousel-wrap{position:relative;width:100%;height:340px;background:var(--mcp-bg3);overflow:hidden;}
        .mcp-carousel-track{display:flex;height:100%;transition:transform .4s cubic-bezier(.25,.8,.25,1);}
        .mcp-carousel-slide{min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;overflow:hidden;}
        .mcp-carousel-wrap::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(to bottom,rgba(8,11,20,.35) 0%,transparent 25%,transparent 55%,rgba(8,11,20,.97) 100%);}
        .mcp-c-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);color:white;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:all .2s;user-select:none;line-height:1;}
        .mcp-c-arrow:hover{background:rgba(108,99,255,.5);border-color:rgba(108,99,255,.6);}
        .mcp-c-prev{left:12px;}.mcp-c-next{right:12px;}
        .mcp-c-dots{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:5px;align-items:center;}
        .mcp-c-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.3);transition:all .3s;cursor:pointer;}
        .mcp-c-dot.active{background:white;width:18px;border-radius:3px;}
        .mcp-c-counter{position:absolute;top:12px;right:12px;z-index:10;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:rgba(255,255,255,.8);}
        .mcp-profile-header{padding:0 18px 20px;margin-top:-36px;position:relative;z-index:10;}
        .mcp-profile-top{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}
        .mcp-profile-av{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#6c63ff,#9b59f5);border:3px solid var(--mcp-bg);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:white;position:relative;flex-shrink:0;}
        .mcp-av-online{position:absolute;bottom:4px;right:4px;width:14px;height:14px;border-radius:50%;background:var(--mcp-success);border:2px solid var(--mcp-bg);}
        .mcp-profile-stats{display:flex;gap:18px;align-items:center;padding-bottom:6px;}
        .mcp-pstat{text-align:center;}
        .mcp-pstat-n{font-size:17px;font-weight:800;letter-spacing:-.02em;}
        .mcp-pstat-l{font-size:10px;color:var(--mcp-text3);font-weight:500;margin-top:1px;}
        .mcp-profile-name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;}
        .mcp-profile-name{font-size:22px;font-weight:800;letter-spacing:-.02em;}
        .mcp-badge-v{display:inline-flex;align-items:center;gap:4px;background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.25);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;color:var(--mcp-teal);}
        .mcp-badge-e{display:inline-flex;align-items:center;gap:4px;background:rgba(244,114,182,.1);border:1px solid rgba(244,114,182,.25);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;color:var(--mcp-rose);}
        .mcp-profile-handle{font-size:13px;color:var(--mcp-text3);margin-bottom:7px;font-weight:500;}
        .mcp-profile-tagline{font-size:13.5px;color:var(--mcp-text2);font-weight:600;}
        .mcp-action-btns{display:flex;gap:10px;padding:0 18px 14px;}
        .mcp-btn-msg{flex:1;padding:12px;border-radius:11px;background:var(--mcp-card);border:1px solid var(--mcp-border);color:var(--mcp-text);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .mcp-btn-msg:hover{border-color:rgba(108,99,255,.3);background:var(--mcp-card2);}
        .mcp-btn-crush{flex:1;padding:12px;border-radius:11px;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.2);color:var(--mcp-rose);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .mcp-btn-crush:hover{background:rgba(244,114,182,.15);}
        .mcp-btn-crush.active{background:rgba(244,114,182,.2);border-color:rgba(244,114,182,.4);}
        .mcp-btn-crush:disabled{opacity:.5;cursor:not-allowed;}
        .mcp-price-card{margin:0 18px 16px;background:linear-gradient(135deg,rgba(108,99,255,.1),rgba(155,89,245,.07));border:1px solid rgba(108,99,255,.2);border-radius:16px;padding:20px;position:relative;overflow:hidden;}
        .mcp-price-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf);}
        .mcp-price-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .mcp-price-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a89cff;}
        .mcp-price-badge-online{display:flex;align-items:center;gap:5px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:6px;padding:3px 9px;font-size:10px;font-weight:700;color:var(--mcp-success);}
        .mcp-price-amount{font-size:32px;font-weight:800;letter-spacing:-.03em;color:var(--mcp-text);margin-bottom:4px;display:flex;align-items:center;gap:8px;}
        .mcp-price-amount-suffix{font-size:15px;font-weight:600;color:var(--mcp-text2);}
        .mcp-price-sub{font-size:12px;color:var(--mcp-text3);margin-bottom:18px;}
        .mcp-price-perks{display:flex;flex-direction:column;gap:8px;}
        .mcp-perk{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--mcp-text2);}
        .mcp-perk-dot{width:18px;height:18px;border-radius:50%;background:rgba(108,99,255,.12);border:1px solid rgba(108,99,255,.2);display:flex;align-items:center;justify-content:center;font-size:8px;color:#a89cff;flex-shrink:0;}
        .mcp-btn-rq-wrap{padding:0 18px 20px;}
        .mcp-btn-rq{width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,#6c63ff,#9b59f5);border:none;color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 28px rgba(108,99,255,.4);transition:all .25s;}
        .mcp-btn-rq:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(108,99,255,.55);}
        .mcp-section{padding:0 18px;margin-bottom:24px;}
        .mcp-sec-title{font-size:11px;font-weight:700;color:var(--mcp-text);margin-bottom:14px;display:flex;align-items:center;gap:8px;letter-spacing:.08em;text-transform:uppercase;}
        .mcp-sec-title::before{content:'';display:block;width:14px;height:2px;background:var(--mcp-accent);border-radius:2px;}
        .mcp-details-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .mcp-di{background:var(--mcp-card);border:1px solid var(--mcp-border);border-radius:12px;padding:14px 15px;transition:border-color .2s;}
        .mcp-di:hover{border-color:rgba(108,99,255,.2);}
        .mcp-di.full{grid-column:span 2;}
        .mcp-dk{font-size:10px;font-weight:600;color:var(--mcp-text3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;}
        .mcp-dv{font-size:13.5px;font-weight:700;color:var(--mcp-text);line-height:1.4;}
        .mcp-days-wrap{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
        .mcp-day{height:38px;padding:0 12px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:.03em;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);color:var(--mcp-success);}
        .mcp-hours-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .mcp-hour{padding:7px 12px;border-radius:8px;font-size:11.5px;font-weight:600;background:var(--mcp-bg3);border:1px solid var(--mcp-border2);color:var(--mcp-text2);font-family:inherit;}
        .mcp-about-text{font-size:13.5px;color:var(--mcp-text2);line-height:1.8;}
        .mcp-safety-card{margin:0 18px 24px;background:var(--mcp-card2);border:1px solid rgba(245,158,11,.15);border-radius:14px;overflow:hidden;}
        .mcp-safety-top{padding:14px 18px;border-bottom:1px solid rgba(245,158,11,.1);display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#f59e0b;}
        .mcp-safety-body{padding:16px 18px;}
        .mcp-srule{display:flex;align-items:flex-start;gap:10px;margin-bottom:11px;font-size:12.5px;color:var(--mcp-text2);line-height:1.6;}
        .mcp-sbullet{width:20px;height:20px;border-radius:50%;flex-shrink:0;margin-top:1px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center;font-size:8px;color:#f59e0b;font-weight:700;}
        .mcp-sagree{margin-top:14px;padding-top:14px;border-top:1px solid var(--mcp-border2);font-size:11.5px;color:var(--mcp-text3);line-height:1.6;}
        .mcp-reviews-card{margin:0 18px 32px;background:var(--mcp-card);border:1px solid var(--mcp-border);border-radius:14px;padding:18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:border-color .2s;width:calc(100% - 36px);}
        .mcp-reviews-card:hover{border-color:rgba(108,99,255,.25);}
        .mcp-rev-left{display:flex;align-items:center;gap:14px;}
        .mcp-rev-star{font-size:30px;}
        .mcp-rev-n{font-size:20px;font-weight:800;letter-spacing:-.02em;}
        .mcp-rev-l{font-size:12px;color:var(--mcp-text3);font-weight:500;margin-top:2px;}
        .mcp-rev-arr{font-size:18px;color:var(--mcp-text3);}
        .mcp-follow-wrap{padding:0 18px 24px;}
        .mcp-spacer{height:48px;}
      `}</style>

      <div className="mcp-root">
        <ToastContainer position="top-center" theme="dark" />

        {/* VIP Celebration */}
        {showVipCelebration && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <Image src="/lion.gif" alt="VIP Celebration" fill className="object-contain" priority />
            </div>
          </div>
        )}

        {/* ── NAV ── */}
       <nav className="mcp-nav">
  <button className="mcp-nav-back" onClick={() => router.back()}>←</button>
  <a href="#" className="mcp-nav-logo">
    <div className="mcp-nav-logo-icon">M</div>
    <span className="mcp-nav-logo-name">mmeko</span>
  </a>
  <div className="mcp-nav-actions">
    <button className="mcp-nav-share" onClick={handleShare}>Share</button>
    {checkuser() && (
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => { e.stopPropagation(); setcloseOption(prev => !prev); }}
          style={{ padding: "8px", background: "var(--mcp-card2)", borderRadius: "50%", border: "none", cursor: "pointer" }}
        >
          <Image className="w-5 h-5" alt="options" src={optionicon} />
        </button>
        {closeOption && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setcloseOption(false)} />
            <div style={{ position: "fixed", right: 16, top: 60, background: "var(--mcp-card2)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,0.15)", zIndex: 99999, minWidth: 140 }}>
              <button onClick={() => { navigate("/creators/editcreatorportfolio"); setcloseOption(false); }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", color: "var(--mcp-text)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Image src={editIcon} alt="edit" className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { confirmDelete(); setcloseOption(false); }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", color: "var(--mcp-rose)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Image src={deleteicon} alt="delete" className="w-4 h-4" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    )}
  </div>
</nav>
        {/* ── CAROUSEL ── */}
        <div className="mcp-carousel-wrap">
          <div className="mcp-carousel-track" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
            {checkimg()}
          </div>
          {totalSlides > 1 && (
            <>
              <button className="mcp-c-arrow mcp-c-prev" onClick={() => setCurrentImageIndex((p) => (p === 0 ? totalSlides - 1 : p - 1))}>‹</button>
              <button className="mcp-c-arrow mcp-c-next" onClick={() => setCurrentImageIndex((p) => (p === totalSlides - 1 ? 0 : p + 1))}>›</button>
            </>
          )}
          <div className="mcp-c-counter">{currentImageIndex + 1} / {totalSlides}</div>
          <div className="mcp-c-dots">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div key={i} className={`mcp-c-dot${i === currentImageIndex ? " active" : ""}`} onClick={() => setCurrentImageIndex(i)} />
            ))}
          </div>
        </div>

        {/* ── PROFILE HEADER ── */}
        <div className="mcp-profile-header">
          <div className="mcp-profile-top">

       <div className="mcp-profile-av">
  {creator.userPhotolink ? (
    <img
      src={(() => {
        const original = String(creator.userPhotolink || "").trim();
        const isStorj = original.startsWith("https://gateway.storjshare.io/");
        if (isStorj) {
          const parts = original.split("/");
          const key = parts[parts.length - 1].split("?")[0];
          return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=profile`;
        }
        return original;
      })()}
      alt={creator.name}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
      }}
    />
  ) : null}
  <span style={{ display: creator.userPhotolink ? "none" : "flex" }}>{avatarInitials}</span>
  {checkOnline() === "online" && <div className="mcp-av-online" />}
  {(() => {
    const isVip = vipStatus?.isVip || vipStatusFromCreator?.isVip;
    const vipEndDate = vipStatus?.vipEndDate || vipStatusFromCreator?.vipEndDate;
    return isVip === true && (
      <div style={{ position: "absolute", bottom: 30, left: 28 }}>
        <VIPBadge size="xl" isVip={isVip} vipEndDate={vipEndDate} />
      </div>
    );
  })()}
</div>
            <div className="mcp-profile-stats">
              <div className="mcp-pstat"><div className="mcp-pstat-n">{views}</div><div className="mcp-pstat-l">Views</div></div>
              <div className="mcp-pstat">
                <div style={{ display: "flex", gap: 2 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 12, color: "#f59e0b" }}>{i < Math.round(averageRating || 0) ? "★" : "☆"}</span>)}</div>
                <div className="mcp-pstat-l">Rating</div>
              </div>
              <div className="mcp-pstat"><div className="mcp-pstat-n">{totalRatings}</div><div className="mcp-pstat-l">Reviews</div></div>
            </div>
          </div>

          <div className="mcp-profile-name-row">
            <div className="mcp-profile-name">{creator.name?.split(" ")[0] || "Creator"}</div>
            {creator.verify && <div className="mcp-badge-v">✓ Verified</div>}
            {isFanDateCreator && <div className="mcp-badge-e">✦ Exclusive</div>}
          </div>
          {creator.username && (
  <div className="mcp-profile-handle">
    {String(creator.username).replace(/^@/, "")}
  </div>
)}


          <div className="mcp-profile-tagline">{getStatus(String(creator?.hosttype))} {creator.name?.split(" ")[0] || "creator"}</div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        {Cantchat() && (
          <div className="mcp-action-btns">
            <button className="mcp-btn-msg" onClick={() => { if (!userid) { toast.info("login to access this operation", { autoClose: 2000 }); return; } navigate(`/message/${creator.userid}`); }}>
              💬 Message
            </button>
            <button
              className={`mcp-btn-crush${removeCrush ? " active" : ""}`}
              disabled={dcb}
              onClick={() => {
                if (!userid) { toast.info("login to access this operation", { autoClose: 2000 }); return; }
                addTocrush();
                if (!removeCrush) setTimeout(() => navigate("/collections"), 1000);
              }}
            >
              {dcb ? "⏳ Processing..." : removeCrush ? "💖 Crushing" : `🎯 ${crush_text}`}
            </button>
          </div>
        )}

        {/* ── PRICE CARD ── */}
        <div className="mcp-price-card">
          <div className="mcp-price-top">
            <div className="mcp-price-label">{creatorServiceTitle}</div>
            {checkOnline() === "online" && <div className="mcp-price-badge-online">🟢 Online Now</div>}
          </div>
          <div className="mcp-price-amount">
            <Coins style={{ width: 32, height: 32, color: "#f59e0b" }} />
            {creatorPriceValue}
            <span className="mcp-price-amount-suffix">{creatorRateSuffix}</span>
          </div>
          <div className="mcp-price-sub">Fan pays {isFanCallCreator ? "per minute" : "upfront"} — you keep 100%</div>
          <div className="mcp-price-perks">
            <div className="mcp-perk"><div className="mcp-perk-dot">✓</div>{creatorDurationText}{!isFanCallCreator && ", public venue only"}</div>
            <div className="mcp-perk">
  <div className="mcp-perk-dot">✓</div>
  {isFanCallCreator ? "No surprise calls — you choose who to accept" : `Payment secured before the ${creatorServiceNoun}`}
</div>
            <div className="mcp-perk"><div className="mcp-perk-dot">✓</div>All communication on-platform</div>
          </div>
        </div>

        {/* ── REQUEST BUTTON ── */}
        {Cantchat() && (
          <div className="mcp-btn-rq-wrap">
            <button className="mcp-btn-rq" onClick={() => { console.log("creator.userPhotolink:", creator.userPhotolink); if (!userid) { toast.info("login to access this operation", { autoClose: 2000 }); return; } setShowRequestDetails(true); }}>
              🎯 Request {creatorServiceTitle}
            </button>
          </div>
        )}

        {/* ── FOLLOW STRIP ── */}
        {!checkuser() && (
          <div className="mcp-follow-wrap">
            <FollowStrip creatorName={creator.name || "Creator"} creatorId={creator.hostid || ""} creatorUserId={creator.userid || ""} followingUser={creator.followingUser || false} checkuser={checkuser()} />
          </div>
        )}

        {/* ── MEET DETAILS ── */}
        <div className="mcp-section">
          <div className="mcp-sec-title">{creatorDetailsTitle}</div>
          <div className="mcp-details-grid">
            <div className="mcp-di"><div className="mcp-dk">👤 Creator</div><div className="mcp-dv">{creator.name}</div></div>
            <div className="mcp-di">
  <div className="mcp-dk">📍 Country</div>
  <div className="mcp-dv">{creator.location?.split(",")[0]?.trim() || "Not specified"}</div>
</div>
<div className="mcp-di">
  <div className="mcp-dk">🏙️ State</div>
  <div className="mcp-dv">{creator.location?.split(",")[1]?.trim() || "Not specified"}</div>
</div>
            {!isFanCallCreator && <div className="mcp-di"><div className="mcp-dk">⏱️ Duration</div><div className="mcp-dv">{creatorDurationText}</div></div>}
            <div className="mcp-di"><div className="mcp-dk">✅ Status</div><div className="mcp-dv" style={{ color: creator.verify ? "var(--mcp-teal)" : "#f59e0b" }}>{creator.verify ? "✓ Verified Creator" : "Not verified"}</div></div>
            <div className="mcp-di full">
              <div className="mcp-dk">📅 Available Days</div>
              <div className="mcp-days-wrap">
                {availabilityDays.length > 0 ? availabilityDays.map((day) => <div key={day} className="mcp-day">{day}</div>) : <span style={{ fontSize: 13, color: "var(--mcp-text2)" }}>Not specified</span>}
              </div>
            </div>
            <div className="mcp-di full">
              <div className="mcp-dk">🕐 Available Hours</div>
              <div className="mcp-hours-wrap">
                {availabilityHours.length > 0 ? availabilityHours.map((time) => <span key={time} className="mcp-hour">{time}</span>) : <span style={{ fontSize: 13, color: "var(--mcp-text2)" }}>Not specified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="mcp-section">
          <div className="mcp-sec-title">About {creator.name?.split(" ")[0] || "Creator"}</div>
          <div className="mcp-about-text">{creator.description || "No description yet."}</div>
        </div>

        {/* ── SAFETY ── */}
        {!isFanCallCreator && (
          <div className="mcp-safety-card">
            <div className="mcp-safety-top">⚠️ Safety Rules — Important</div>
            <div className="mcp-safety-body">
              <div className="mcp-srule"><div className="mcp-sbullet">1</div>All {creatorServiceTitle.toLowerCase()} sessions are limited to <strong style={{ color: "var(--mcp-text)" }}>30 minutes.</strong></div>
              <div className="mcp-srule"><div className="mcp-sbullet">2</div>{creatorServiceTitle} must happen in a <strong style={{ color: "var(--mcp-text)" }}>public place only</strong> — cafés, restaurants, or similar venues.</div>
              <div className="mcp-srule"><div className="mcp-sbullet">3</div>What happens after 30 minutes is <strong style={{ color: "var(--mcp-text)" }}>outside the platform&apos;s responsibility.</strong></div>
              <div className="mcp-sagree">{checkuser() ? "By creating this portfolio you agree to follow these rules." : "By sending a request, you agree to follow these rules."}</div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <button
          className="mcp-reviews-card"
          onClick={() => { if (!userid) { toast.info("login to access this operation", { autoClose: 2000 }); return; } Check_review(); }}
        >
          <div className="mcp-rev-left">
            <div className="mcp-rev-star">⭐</div>
            <div>
              <div className="mcp-rev-n">{totalRatings} Reviews</div>
              <div className="mcp-rev-l">{totalRatings > 0 ? "See what fans are saying" : "No reviews yet — be the first"}</div>
            </div>
          </div>
          <div className="mcp-rev-arr">›</div>
        </button>

        <div className="mcp-spacer" />

        {/* ── MODALS (unchanged logic) ── */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={handleModalClick}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10">×</button>
            <Image src={selectedImage} alt="Fullscreen view" width={800} height={600} className="max-w-full max-h-full object-contain rounded-lg cursor-pointer" onClick={closeModal} />
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#111624] p-6 rounded-lg text-white w-11/12 max-w-md">
              <h2 className="text-lg font-bold mb-4">⚠ Warning</h2>
              <p className="mb-4">Deleting your portfolio will permanently remove all your views, and you may lose pending fan requests and unclaimed gold. Are you certain you want to proceed?</p>
              <div className="flex justify-end gap-4">
                <button onClick={() => handleDeleteConfirm(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">No</button>
                <button onClick={() => handleDeleteConfirm(true)} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Yes</button>
              </div>
            </div>
          </div>
        )}

        {review_click && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                <button onClick={() => setreview_click(false)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                  <Image alt="closeIcon" src={closeIcon} className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {loading1 && <div className="flex flex-col items-center justify-center py-12"><PacmanLoader1 color={color1} loading={loading1} size={25} /><p className="text-white mt-4">Loading reviews...</p></div>}
                {!loading1 && <div className="space-y-4 max-h-96 overflow-y-auto">{show_review()}</div>}
              </div>
            </div>
          </div>
        )}

        {requestclick && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full" onClick={() => setrequestclick(false)}>
            <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <Requestinfo setrequestclick={setrequestclick} amount={creator.price} setsuccess={setsuccess} type={creator.hosttype} />
            </div>
          </div>
        )}

        {success && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full" onClick={() => setsuccess(false)}>
            <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <Requestform setsuccess={setsuccess} price={Number(creator.price) || 0} toast={toast} creator_portfolio_id={creator.hostid} type={creator.hosttype} setrequested={setrequested} creator={creator} />
            </div>
          </div>
        )}

        {requested && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full" onClick={() => setrequested(false)}>
            <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <Requestsuccess setrequested={setrequested} />
            </div>
          </div>
        )}

        {showRequestDetails && (
          <RequestDetailsForm onDone={handleRequestDetailsSubmit} onCancel={() => setShowRequestDetails(false)} creatorName={creator.name} creatorType={creator.hosttype} price={parseFloat(creator.price) || 0} creatorPhoto={creator.userPhotolink || ""} />
        )}

        {showSharePopup && (
  <div
    className="fixed inset-0 z-[300] flex items-end justify-center"
    style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)" }}
    onClick={() => setShowSharePopup(false)}
  >
    <div
      className="w-full max-w-lg overflow-hidden"
      style={{ background: "#111824", borderRadius: "22px 22px 0 0", borderTop: "1px solid rgba(255,255,255,.08)", paddingBottom: 40 }}
      onClick={e => e.stopPropagation()}
    >
      {/* accent line */}
      <div style={{ height: 2, background: "linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)" }} />
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.12)", margin: "14px auto 0" }} />

      <div style={{ padding: "24px 22px 0" }}>
        {/* icon */}
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,rgba(108,99,255,.2),rgba(155,89,245,.15))", border: "1px solid rgba(108,99,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>🔗</div>

        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 8 }}>Your portfolio is live!</div>
        <div style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 22 }}>
          Share your profile link with fans so they can discover you and send booking requests. The more you share, <strong style={{ color: "#f1f5f9", fontWeight: 600 }}>the more requests you get.</strong>
        </div>

        {/* URL box */}
        <div style={{ display: "flex", background: "#0d1120", border: "1px solid rgba(108,99,255,.25)", borderRadius: 11, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ flex: 1, padding: "12px 14px", fontSize: 12.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
  {typeof window !== "undefined" ? window.location.host : "mmeko.com"}/{String(creator.username || "").replace(/^@/, "")}
</div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(
  `${window.location.origin}/${String(creator.username || "").replace(/^@/, "")}`
).catch(() => {});
              setUrlCopied(true);
              setTimeout(() => setUrlCopied(false), 2500);
            }}
            style={{ padding: "0 16px", minHeight: 46, background: urlCopied ? "rgba(34,197,94,.15)" : "rgba(108,99,255,.15)", border: "none", borderLeft: `1px solid ${urlCopied ? "rgba(34,197,94,.2)" : "rgba(108,99,255,.2)"}`, color: urlCopied ? "#22c55e" : "#a89cff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {urlCopied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>

        {/* tip */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(108,99,255,.06)", border: "1px solid rgba(108,99,255,.12)", borderRadius: 10, padding: "12px 14px", marginBottom: 22 }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            <strong style={{ color: "#a89cff", fontWeight: 600 }}>Pro tip:</strong> Post your link in your Instagram bio, TikTok profile, or OnlyFans page to reach your existing fans instantly.
          </div>
        </div>

        {/* actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={async () => {
              const url = `${window.location.origin}/${String(creator.username || "").replace(/^@/, "")}`;
              if (navigator.share) await navigator.share({ title: `Book a meet with me on mmeko`, url });
              else { await navigator.clipboard.writeText(url).catch(() => {}); toast.success("Link copied!", { autoClose: 2000 }); }
            }}
            style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#6c63ff,#9b59f5)", border: "none", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(108,99,255,.35)" }}
          >
            🔗 Share My Portfolio
          </button>
       <button
  onClick={() => {
    if (creator.hostid) {
      localStorage.setItem(`share_popup_dismissed_${creator.hostid}`, "true");
      localStorage.setItem(`share_popup_shown_${creator.hostid}`, "true");
    }
    setShowSharePopup(false);
  }}
  style={{ width: "100%", padding: 13, borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,.07)", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
>
  OK, got it
</button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>

      {!isAuthenticated && 
       <LoginPromptBanner />
        } 
    </>
  );
}