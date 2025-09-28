"use client"
import React, { useEffect, useRef, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Tabs from "./Tabs";
import DropdownMenu from "./DropDonMenu";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile, getfollow, getAllUsers } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";
import { updateEdit } from "@/store/comprofile";
import { BiPencil } from "react-icons/bi";
import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";
import axios from "axios";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
// import backIcon from "../icons/backIcon.svg";
 //import StarIcon from "../icons/transparentstar.svg";
// import StarIcon2 from "../icons/star.svg";
// import { Postlist } from "../_components/Postlist";
// import messageIcon from "../icons/messageIcon.png";
// import { Exclusive } from "../_components/exclusive"
// import { Info } from "/_components/info";
import Empty from "@/icons/empty.svg";
import DummyCoverImage from "@/icons/mmekoDummy.png";
import D from "@/icons/icons8-profile_Icon.png";
import MessagePics from "@/icons/icons8-message.png";
// import { BiPen, BiPencil } from "react-icons/bi";
// import {
//   comprofilechangeStatus,
//   getprofilebyid,
// } from "../app/features/profile/comprofile";
// import {
//   follow,
//   unfollow,
//   ProfilechangeStatus,
// } from "../app/features/profile/profile";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import person from "../icons/icons8-profile_Icon.png";
// import { RiMarkPenLine } from "react-icons/ri";
// import { updateFollowers } from "../app/features/model/modelSlice";
// import { useAuth } from "../hooks/useAuth";

let month = "";
let year = "";
let followers = 0;
let likes = 0;
let follow_text = "follow";

// Helper function to format numbers (e.g., 1000 -> 1K)
const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

const Months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const profile = {
  ismodel: true,
  username: "John Doe",
  modeltDype: "music artist"
}

export const Profile = () => {
  const params = useParams();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  // State for user posts
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const {
    status,
    firstname,
    lastname,
    nickname,
    bio,
    State: location,
    country,
    active,
    model,
    photolink,
  } = useSelector((s: RootState) => s.profile);

  const error = useSelector((s: RootState) => s.profile.error);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  const isUploading = useSelector((s: RootState) => s.comprofile.updateEdit_stats === "loading");

  // Add logging for profile data changes
  useEffect(() => {
    console.log("📊 [ProfilePage] Profile data updated:", {
      firstname,
      lastname,
      nickname,
      photolink,
      status,
      hasPhotolink: !!photolink,
      photolinkType: typeof photolink,
      photolinkPreview: photolink?.substring(0, 50) + '...'
    });
  }, [firstname, lastname, nickname, photolink, status]);
  const viewingUserId = (params as any)?.userid as string;
  
  // Get userid and token from localStorage if not in Redux
  const [localUserid, setLocalUserid] = React.useState("");
  const [localToken, setLocalToken] = React.useState("");
  
  const loggedInUserId = reduxUserId || localUserid;
  const token = reduxToken || localToken;
  const isSelf = Boolean(loggedInUserId && viewingUserId && loggedInUserId === viewingUserId);
  const joined = React.useMemo(() => {
    if (!createdAt) return { month: "", year: "" };
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return { month: "", year: "" };
    return { month: Months[d.getMonth()] ?? "", year: String(d.getFullYear()) };
  }, [createdAt]);
  const [isbuying, setisbuying] = useState(false);
  const [gender, setgender] = useState("");
  const [about, setabout] = useState("");
  const getprofilebyidstats = useSelector(
    (state: RootState) => state.profile.status
  );
  const profile = useSelector((state: RootState) => state.profile);
  const getfollow_data = useSelector((state: RootState) => state.profile.getfollow_data as any);
  const getfollow_stats = useSelector((state: RootState) => state.profile.getfollow_stats);
  const getAllUsers_data = useSelector((state: RootState) => state.profile.getAllUsers_data as any);
  
  // We don't need the entire Redux state - removing to avoid unnecessary rerenders
  const follow_stats = useSelector((state: RootState) => state.profile.follow_stats);
  const unfollow_stats = useSelector((state: RootState) => state.profile.unfollow_stats);

  const userid = useSelector((state: RootState) => state.register.userID);
  const { postuserid } = useParams();
  
  // Load userid and token from localStorage if not in Redux
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set user ID if not in Redux
          if (!reduxUserId && data?.userID) {
            setLocalUserid(data.userID);
          }
          
          // Set token if not in Redux
          if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
            setLocalToken(data.refreshtoken || data.accesstoken);
          }
        }
      } catch (error) {
        console.error("[ProfilePage] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserId, reduxToken]);
  
  // Use postuserid from URL params as the target user ID (the profile we're viewing)
  const targetUserId = viewingUserId || postuserid || userid || localUserid;
  
  // URL params and auth info ready
  const formatter = new Intl.NumberFormat("en-US");

  // const [userphoto, setuserphoto] = useState(person);
  const [disablehost, setdisable] = useState(false);
  const [exclusive_verify, set_exclusive_verify] = useState(false);
  const [disabledButton, setdisableButton] = useState(false);
  // const [followimg, setfollowimg] = useState(StarIcon);
  const [isfollwed, setisfollowed] = useState(false);
  const [modelid, setmodelid] = useState<string[]>([]);
  const [click, setclick] = useState(true);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showAction, setShowAction] = useState(true);
  const [isFollowing, setisFollowing] = useState(false);

  const [username, setusername] = useState("");

  // let timeoutId = null;


  useEffect(() => {
    // Use the viewingUserId from params (the profile we're viewing)
    if (!viewingUserId) return;
    
    // Read token from Redux first, then fall back to localStorage
    const tokenFromRedux = (() => {
      try {
        return (window as any).__REDUX_TOKEN__ ?? undefined;
      } catch {
        return undefined;
      }
    })();

    const tokenFromRegister = ((): string | undefined => {
      try {
        const state = (dispatch as any).getState?.() as RootState | undefined;
        return state?.register?.refreshtoken || state?.register?.accesstoken || undefined;
      } catch {
        return undefined;
      }
    })();

    let token: string | undefined = tokenFromRegister || tokenFromRedux;
    if (!token) {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const saved = JSON.parse(raw);
          token = saved?.refreshtoken || saved?.accesstoken;
        }
      } catch {}
    }
    
    // Enhanced logging for fetching user data
    console.log("🔍 [ProfilePage] Fetching user data:", {
      userid: viewingUserId,
      hasToken: Boolean(token),
      tokenSource: tokenFromRegister ? "redux" : tokenFromRedux ? "window" : "localStorage/missing",
      tokenLength: token?.length,
      isSelf: viewingUserId === loggedInUserId
    });
    
    console.log("🚀 Dispatching getprofile with:", { userid: viewingUserId, token: token ? "exists" : "missing" });
    dispatch(getprofile({ userid: viewingUserId, token } as any));
  }, [viewingUserId, dispatch]);

  const openPicker = () => fileRef.current?.click();
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isSelf) return;
    const blobUrl = URL.createObjectURL(file);
    setAvatarSrc(blobUrl);
    if (loggedInUserId && token) {
      dispatch(updateEdit({ userid: loggedInUserId, token, updatePhoto: file }))
        .unwrap()
        .then(() => dispatch(getprofile({ userid: loggedInUserId, token } as any)))
        .catch(() => {});
    }
  };
  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  useEffect(() => {
    if (getprofilebyidstats === "succeeded") {
      
      // Fetch follower data and all users if not already loaded
      // Use the target user ID (the profile we're viewing) for getfollow
      if (targetUserId && token) {
        console.log(`Fetching follow data for profile user: ${targetUserId}`);
        dispatch(getfollow({ userid: targetUserId, token }));
        dispatch(getAllUsers({ token }));
      }
      
      setusername(profile.username);
      setgender(profile.gender);
      // setlocation(profile.location);
      setabout(profile.bio || profile.aboutuser);
      // setactive(profile.active);
      // setfirstname(profile.firstname);
      // setlastname(profile.lastname);
      // setnickname(profile.nickname);
      set_exclusive_verify(profile.exclusive);
      // We'll update isFollowing when we have follow data
      month = Months[Number(profile.joined_month)];
      year = profile.joined_year;
      likes = profile.likecount || 0; // Add fallback for likes to prevent NaN
      followers = profile.followers?.length || 0;
      // if (profile."/icons/icons8-profile_Icon.png") {
      //   setuserphoto(profile."/icons/icons8-profile_Icon.png");
      // } else {
      //   setuserphoto(person);
      // }

      cantfandc();

      // dispatch(comprofilechangeStatus("idle"));
    }

    if (getprofilebyidstats === "failed") {
      // dispatch(comprofilechangeStatus("idle"));
    }
  }, [getprofilebyidstats, userid, postuserid]);

  // Get followers/following from API response - EXACTLY like following page
  const apiFollowers = React.useMemo(() => {
    return (getfollow_data?.followers as any[]) || [];
  }, [getfollow_data]);
  
  const apiFollowing = React.useMemo(() => {
    return (getfollow_data?.following as any[]) || [];
  }, [getfollow_data]);
  
  // Use useMemo to prevent unnecessary re-renders
  const allUsers = React.useMemo(() => {
    return (getAllUsers_data as any[]) || [];
  }, [getAllUsers_data]);
  
  // Track stats data
  
  // Calculate follower/following counts
  const followerFollowingCounts = React.useMemo(() => {
    return { 
      followersCount: apiFollowers.length, 
      followingCount: apiFollowing.length 
    };
  }, [apiFollowers.length, apiFollowing.length]);

  // Check if logged-in user is following the profile being viewed using allUsers data
  useEffect(() => {
    if (allUsers.length > 0 && loggedInUserId && targetUserId && targetUserId !== loggedInUserId) {
      try {
        // Find logged-in user in allUsers
        const currentUser = allUsers.find((user: any) => String(user._id) === String(loggedInUserId));
        
        if (currentUser && currentUser.following) {
          // Check if logged-in user is following the profile user
          const isFollowingUser = currentUser.following.some(followedId => {
            // Handle both string and object formats
            if (typeof followedId === 'string') {
              return String(followedId) === String(targetUserId);
            } else if (followedId && typeof followedId === 'object') {
              return String(followedId._id) === String(targetUserId) || 
                     String(followedId.userid) === String(targetUserId);
        }
        return false;
      });
          
          setisFollowing(isFollowingUser);
        }
      } catch (e) {
        // Silently handle errors
      }
    }
  }, [allUsers, loggedInUserId, targetUserId]);
  
  
  // Check using API followers and following data
  useEffect(() => {
    if (getfollow_data && loggedInUserId && targetUserId && targetUserId !== loggedInUserId) {
      try {
        // Get followers and following arrays
        const followers = getfollow_data.followers || [];
        const following = getfollow_data.following || [];
        
        // IMPORTANT: To check if logged-in user is following target user,
        // we need to check if target user is in logged-in user's following list
        // OR if logged-in user is in target user's followers list
        
        // Check if any follower's ID matches logged-in user
        const isFollowerOfTarget = followers.some(follower => {
          if (typeof follower === 'string') {
            return String(follower) === String(loggedInUserId);
          } else if (follower && typeof follower === 'object') {
            // Based on the data structure we see, the ID is in the 'id' field
            return String(follower.id) === String(loggedInUserId) || 
                   String(follower._id) === String(loggedInUserId);
          }
          return false;
        });
        
        // Check if target user is in logged-in user's following list
        const isTargetInFollowing = following.some(followed => {
          if (typeof followed === 'string') {
            return String(followed) === String(targetUserId);
          } else if (followed && typeof followed === 'object') {
            return String(followed.id) === String(targetUserId) || 
                   String(followed._id) === String(targetUserId);
          }
          return false;
        });
        
        // Set following status based on either check
        const isUserFollowingTarget = isFollowerOfTarget || isTargetInFollowing;
        setisFollowing(isUserFollowingTarget);
      } catch (e) {
        // Silently handle errors
      }
    }
  }, [getfollow_data, loggedInUserId, targetUserId]);
  
  // Mock data for development/testing when API fails
  const mockPosts = React.useMemo(() => [
    {
      _id: 'mock1',
      content: 'This is a sample post to show when the API is unavailable',
      likes: Array(15),
      comments: Array(5),
      user: {
        firstname: firstname || 'User',
        lastname: lastname || '',
        nickname: nickname || '@user',
        photolink: photolink || avatarSrc || '/icons/profile.png'
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock2',
      content: 'Another sample post with some image content',
      postfilelink: ['/icons/mmekoDummy.png'],
      likes: Array(32),
      comments: Array(8),
      user: {
        firstname: firstname || 'User',
        lastname: lastname || '',
        nickname: nickname || '@user',
        photolink: photolink || avatarSrc || '/icons/profile.png'
      },
      createdAt: new Date().toISOString()
    }
  ], [firstname, lastname, nickname]);

  // Fetch user posts - wrapped in useCallback to avoid dependency cycle
  const fetchUserPosts = React.useCallback(async (userId: string) => {
    if (!userId || !token) return;
    
    setIsLoadingPosts(true);
    
    // Define possible endpoints to try in order
    const endpointsToTry = [
      { url: '/getalluserpost', method: 'post' },
      { url: '/getalluserpost', method: 'get', paramKey: 'userid' },
      { url: '/post/user', method: 'post' },
      { url: '/getallpost', method: 'post', dataKey: 'userid' }
    ];
    
    let success = false;
    
    try {
      // Try each endpoint until one works
      for (const endpoint of endpointsToTry) {
        try {
          let response;
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';
          
          if (endpoint.method === 'post') {
            // For POST requests
            const data = endpoint.dataKey ? { [endpoint.dataKey]: userId } : { userid: userId };
            response = await axios({
              method: 'post',
              url: `${baseUrl}${endpoint.url}`,
              data: data,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              timeout: 8000
            });
          } else {
            // For GET requests
            const url = endpoint.paramKey 
              ? `${baseUrl}${endpoint.url}?${endpoint.paramKey}=${userId}` 
              : `${baseUrl}${endpoint.url}/${userId}`;
              
            response = await axios({
              method: 'get',
              url: url,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              timeout: 8000
            });
          }
          
          // Check for posts in various possible response formats
          const posts = response?.data?.post || response?.data?.posts || 
                       (response?.data?.data && response?.data?.data.posts) || 
                       (Array.isArray(response?.data) ? response.data : null);
          
          if (posts && Array.isArray(posts)) {
            setUserPosts(posts);
            success = true;
            break; // Exit the loop if successful
          }
        } catch (endpointError) {
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed or returned no posts
      if (!success) {
        // For development - use mock data
        if (typeof window !== 'undefined' && 
            window.location.hostname === 'localhost' && 
            viewingUserId === loggedInUserId) {
          setUserPosts(mockPosts);
        } else {
          setUserPosts([]);
        }
      }
    } catch (error) {
      // Show empty state
      setUserPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token, mockPosts, viewingUserId, loggedInUserId]);
  
  // Fetch posts when profile is loaded
  useEffect(() => {
    if (targetUserId) {
      // Add a small delay to ensure other API calls complete first
      const timer = setTimeout(() => {
        fetchUserPosts(targetUserId);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [targetUserId, token, fetchUserPosts]);

  // useEffect(() => {
  //   if (unfollow_stats === "succeeded") {
  //     setisfollowed(false);
  //     dispatch(ProfilechangeStatus("idle"));
  //   }

  //   if (follow_stats === "succeeded") {
  //     setisfollowed(true);
  //     dispatch(ProfilechangeStatus("idle"));
  //   }
  // }, [unfollow_stats, follow_stats]);

  // const checkonline = (active) => {
  //   if (active === true) {
  //     return <p className="ml-5 text-green-600">online</p>;
  //   } else {
  //     return <p className="ml-5 text-red-600">offline</p>;
  //   }
  // };

  // const fectuser = () => {
  //   // if (profile.username) return false;
  //     return false;
  //   }
  // };

  // const myposts = () => {
  //   if (profile.username) {
  //     const sortedPosts = [...profile.post].sort(
  //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //     );
  //     return sortedPosts?.map((value) => (
  //       <Postlist
  //         key={value.postid}
  //         postlog={value.postid}
  //         "/icons/icons8-profile_Icon.png"={profile."/icons/icons8-profile_Icon.png"}
  //         username={value.username}
  //         datetime={value.posttime}
  //         likes={value.like.length}
  //         comments={value.comment.length}
  //         postphoto={value.postphoto}
  //         content={value.content}
  //         posttype={value.posttype}
  //         postuserid={value.userid}
  //         likelist={value.like}
  //         isfollow={value.isfollow}
  //         currentPlayingIndex={currentPlayingIndex}
  //         setCurrentPlayingIndex={setCurrentPlayingIndex}
  //         isMuted={isMuted}
  //         setIsMuted={setIsMuted}
  //         setShowAction={setShowAction}
  //         showAction={showAction}
  //         timeoutId={timeoutId}
  //         isProfilePage={true}
  //       />
  //     ));
  //   }
  // };

  // if (userid && profile) {
    //   if (profile.following) {
    //     setisfollowed(true);
    //     setfollowimg(StarIcon2);
    //     follow_text = "";
    //   }

    //   if (!userid) {
    //     setdisableButton(true);
    //   } else if (userid === profile.userid) {
    //     setdisableButton(true);
    //   } else {
    //     setdisableButton(false);
    //   }
    // }

  // const exclusive = () => {
  //   if (profile.exclusive_content?.length > 0) {
  //     const sortedContent = [...profile.exclusive_content].sort(
  //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //     );
  //     console.log(sortedContent);

  //     if (userid === profile.userid) {
  //       if (exclusive_verify === true) {
  //         return (
  //           <div className="flex flex-col overflow-auto">
  //             <div className="grid grid-cols-1 gap-6 mb-3 overflow-hidden">
  //               {sortedContent.map((c, index) => (
  //                 <Exclusive
  //                   key={`${index}_${c._id}`}
  //                   image={"/icons/icons8-profile_Icon.png"}
  //                   price={c.price}
  //                   content_type={c.content_type}
  //                   contentlink={c.contentlink}
  //                   contentname={c.contentname}
  //                   buy={true}
  //                   modelId={postuserid}
  //                   setisbuying={setisbuying}
  //                   id={c._id}
  //                   me={true}
  //                   thumblink={c.thumblink}
  //                   createdAt={c.createdAt}
  //                 />
  //               ))}
  //             </div>
  //             <div className="flex justify-center py-4 my-4 mb-10">
  //               <button
  //                 onClick={() => navigate("/addexclusive")}
  //                 className="font-bold text-slate-50"
  //               >
  //                 ADD Exclusive
  //               </button>
  //             </div>
  //           </div>
  //         );
  //       } else {
  //         return (
  //           <div className="flex flex-col">
  //             <div className="flex justify-end mb-2">
  //               <button
  //                 onClick={() => navigate("/verification")}
  //                 className="btn"
  //               >
  //                 Upload
  //               </button>
  //             </div>
  //           </div>
  //         );
  //       }
  //     } else {
  //       return (
  //         <div className="flex flex-col">
  //           <div className="grid grid-cols-1 gap-6 mb-10">
  //             {sortedContent.map((c, index) => (
  //               <Exclusive
  //                 key={`${index}_${c._id}`}
  //                 image={"/icons/icons8-profile_Icon.png"}
  //                 price={c.price}
  //                 content_type={c.content_type}
  //                 contentlink={c.contentlink}
  //                 contentname={c.contentname}
  //                 buy={c.buy}
  //                 setisbuying={setisbuying}
  //                 id={c._id}
  //                 me={false}
  //                 thumblink={c.thumblink}
  //                 createdAt={c.createdAt}
  //                 modelId={postuserid}
  //               />
  //             ))}
  //           </div>
  //         </div>
  //       );
  //     }
  //   } else {
  //     if (userid === profile.userid) {
  //       return (
  //         <div className="flex flex-col">
  //           <div className="flex justify-center py-4 my-4 mb-10">
  //             <button onClick={() => navigate("/addexclusive")}>
  //               <img
  //                 src={Empty}
  //                 alt="empty"
  //                 className="object-cover w-10 h-10"
  //               />
  //             </button>
  //           </div>
  //         </div>
  //       );
  //     } else {
  //       return (
  //         <div className="flex justify-center py-4 my-4 mb-10">
  //           <p className="text-sm text-slate-50">No content yet!</p>
  //         </div>
  //       );
  //     }
  //   }
  // };

  // const info = () => {
  //   return (
  //     <Info
  //       firstname={profile.firstname}
  //       lastname={profile.lastname}
  //       birthday={profile.dob}
  //       gender={gender}
  //       location={location}
  //     />
  //   );
  // };

  // const follow_button = () => {
  //   if (isfollwed === true) {
  //     if (unfollow_stats !== "loading") {
  //       setfollowimg(StarIcon);
  //       follow_text = "follow";
  //       dispatch(unfollow({ userid: postuserid, followerid: userid, token }));
  //     }
  //   } else if (isfollwed === false) {
  //     if (follow_stats !== "loading") {
  //       setfollowimg(StarIcon2);
  //       follow_text = "";
  //       dispatch(follow({ userid: postuserid, followerid: userid, token }));
  //     }
  //   }
  // };
  // useEffect(() => {
  //   console.log(profile);
  // }, [profile]);
  // const user = useAuth();
  // Handle follow/unfollow button click
  const onFollowClick = async () => {
    if (!loggedInUserId || !targetUserId || !token) {
      return;
    }
    
    // Store current status before changing
    const wasFollowing = isFollowing;
    
    try {
      // Optimistically update UI
      setisFollowing(!wasFollowing);
      
      // Call the appropriate API endpoint
      if (wasFollowing) {
        // Unfollow
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'}/follow/unfollow`,
          { 
            userid: targetUserId,
            followerid: loggedInUserId
          },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            } 
          }
        );
      } else {
        // Follow
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'}/follow`,
          { 
            userid: targetUserId,
            followerid: loggedInUserId
          },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            } 
          }
        );
      }
      
      // Refresh follow data
      dispatch(getfollow({ userid: targetUserId, token }));
      dispatch(getAllUsers({ token }));
      
    } catch (error) {
      // Revert UI on error
      setisFollowing(wasFollowing);
    }
  };
  
  const cantfandc = () => {
    if (loggedInUserId && viewingUserId) {
      setmodelid([viewingUserId, loggedInUserId]);
    }
  };
  
  // Post modal component
  const PostModal = () => {
    if (!selectedPost) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                {selectedPost.user?.photolink ? (
                  <Image 
                    src={selectedPost.user.photolink} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
                    {selectedPost.user?.firstname?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{selectedPost.user?.firstname} {selectedPost.user?.lastname}</p>
                <p className="text-xs text-gray-400">{selectedPost.user?.nickname}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPostModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Post image */}
            {selectedPost.postfilelink && selectedPost.postfilelink[0] && (
              <div className="relative aspect-square bg-black">
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url('${selectedPost.postfilelink[0]}')`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            )}
            
            {/* Post content */}
            <div className="p-4">
              <p className="mb-4">{selectedPost.content}</p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{formatNumber(selectedPost.likes?.length || 0)} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(selectedPost.comments?.length || 0)} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12"
      style={{ overflowY: "scroll" }}
    >
      {/* Post Modal */}
      {showPostModal && <PostModal />}
      <div
        className="w-full mx-auto mt-4 text-white md:mr-auto md:ml-0"
        // onClick={() => setclick(true)}
      >
        <div className="pb-6">
          {(status === "loading" || status === "idle") && (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <div className="w-full max-w-sm p-4 mx-auto space-y-4 text-white rounded-lg shadow-md">
                <div className="w-full h-36">
                  <Skeleton width="100%" height="100%" />
                </div>
                <div className="relative flex items-center justify-between px-4 -mt-12">
                  <Skeleton width={70} height={70} circle />
                  <Skeleton width={80} height={30} className="rounded-md" />
                </div>
                <div className="space-y-1 text-left">
                  <Skeleton width={140} height={20} className="rounded-md" />
                  <Skeleton width={100} height={15} className="rounded-md" />
                </div>
                <div className="flex justify-start space-x-4">
                  <Skeleton width={50} height={15} />
                  <Skeleton width={50} height={15} />
                </div>
                <div className="text-left">
                  <Skeleton width="80%" height={15} className="rounded-md" />
                </div>
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="flex justify-between w-full">
                        <Skeleton width={160} height={20} />
                      </div>
                    ))}
                </div>
              </div>
            </SkeletonTheme>
          )}
          {status === "failed" && (
            <div className="w-full px-4 py-6 text-center">
              <div className="mb-3 text-sm text-red-400">
                {error || "Failed to load profile."}
              </div>
              <button
                onClick={() => viewingUserId && dispatch(getprofile({ userid: viewingUserId, token } as any))}
                className="px-3 py-1 text-sm rounded bg-orange-500 text-white hover:bg-orange-600"
              >
                Retry
              </button>
            </div>
          )}
          {status === "succeeded" && (
            <div className="flex flex-col">
              <div className="relative w-full ">
               
              <div className=" w-max absolute -top-5 right-0 px-4">
                  <div className="flex items-center justify-between">
                    
                    <DropdownMenu userId={viewingUserId} isOwnProfile={viewingUserId === loggedInUserId} />
                  </div>
                </div>
                <div className="w-full px-2 ">
                  <div className="flex items-center  justify-between">
                    <div className="flex items-center justify-center w-1/3">
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600">
                        <Image
                        alt="profile picture"
                        src={photolink || avatarSrc || "/icons/profile.png"}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full rounded-full"
                      />
                      </div>
                    </div>
                      <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
                      <p className="pt-2 text-xl font-bold text-slate-200">
                          {firstname} {lastname}
                  </p>
                  <div className="flex justify-start gap-4 w-full">
                  <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
                      {formatter.format(Number(likes || 0))}{" "}
                      <span className="font-semibold tracking-wider text-[15px]">Likes</span>
                    </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {followerFollowingCounts.followersCount} <span className="font-semibold tracking-wider text-[15px]">Fans</span>
         </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {followerFollowingCounts.followingCount} <span className="font-semibold tracking-wider text-[15px]">Following</span>
         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-3 ml-6 ">
                 
                  <p className="text-blue-500">{nickname}</p>
                
                
                  {profile.ismodel && (
                    <button
                      className="bg-[#7e3500] text-[#eedfcb] rounded-lg p-1 px-2 mt-3"
                      // onClick={() =>
                      //   navigate(`/modelbyid/${profile.modelid.toString()}`)
                      // }
                    >
                      Request {profile.modeltDype}
                    </button>
                  )}
              {/* Bio */}
                  <div>
                    <p className="text-slate-400">{bio || "Hey, I am using mmeko"}</p>
                  </div>
              <div className="w-full flex items-center justify-center">
                    {viewingUserId !== loggedInUserId ? (
                      <div className="flex flex-row-reverse mr-5 w-full justify-between items-center gap-2 mt-4">
                        <div className="flex flex-row   w-1/2 rounded-lg">
                          <button
                            className="p-0 px-3 w-full bg-gray-800 cursor-pointer py-1.5 rounded-lg"
                            disabled={disabledButton}
                            onClick={() =>
                              router.push(`/message/${modelid.toString()}`)
                            }
                          >
                            Message
                          </button>
                        </div>
                        <button
                          key={`follow-button-${isFollowing}`}
                          onClick={onFollowClick}
                          className={`flex w-1/2 justify-center gap-x-1 items-center flex-row p-1.5 rounded-lg cursor-pointer ${
                            isFollowing 
                              ? "bg-gradient-to-r !from-blue-700 !to-purple-800" 
                              : "bg-gradient-to-r !from-blue-500 !to-purple-600"
                          }`}
                        >
                          <Image
                            src={isFollowing ? StarIcon2 : StarIcon}
                            width={20}
                            height={20}
                            className="size-5"
                            alt="rating"
                          />

                          <span className="font-medium">
                            {isFollowing === true ? "Following" : "Follow"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 flex items-center justify-center gap-x-1 bg-gradient-to-r !from-blue-500 !to-purple-600 text-center text-sm rounded-lg mt-4"
                        onClick={() => router.push(`/Profile/${viewingUserId}/editprofile`)}
                      >
                        <BiPencil />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
                    </div>
          )}
                    </div>
                  </div>
      <div className="mx-4 sm:max-w-xl">
        <Tabs
          tabs={[
            {
              id: "posts",
              icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              count: userPosts.length,
              content: (
              <div>
                  {isLoadingPosts ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                  ) : userPosts.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No posts yet</p>
                      {viewingUserId === loggedInUserId ? (
                        <div>
                          <p className="text-sm mb-2">Share your first post with your followers</p>
                          <button 
                            onClick={() => router.push('/upload')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
                          >
                            Create Post
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm">Posts will appear here when created</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      {userPosts.map((post) => (
                        <div
                          key={post._id}
                          className="relative aspect-square group cursor-pointer rounded-sm overflow-hidden bg-black"
                          onClick={() => { 
                            setSelectedPost(post); 
                            setShowPostModal(true); 
                          }}
                        >
                          {post.postfilelink && post.postfilelink[0] ? (
                            <div 
                              className="absolute inset-0 w-full h-full"
                              style={{
                                backgroundImage: `url('${post.postfilelink[0]}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                              <span className="text-center text-white text-base font-semibold line-clamp-2">{post.content}</span>
                    </div>
                  )}
                  
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                          
                          {/* Content overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-center p-2">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-sm">{formatNumber(post.likes?.length || 0)}</span>
                      </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-sm">{formatNumber(post.comments?.length || 0)}</span>
                  </div>
                  </div>
                              <p className="text-xs line-clamp-2">{post.content}</p>
                </div>
              </div>
                        </div>
                      ))}
            </div>
          )}
                </div>
              ),
            },
            {
              id: "exclusive",
              icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              count: 0,
              content: (
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    <p>No exclusive content yet</p>
                    <p className="text-sm">Exclusive content will appear here</p>
                    </div>
                </div>
              ),
            },
            {
              id: "reviews",
              icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ),
              count: 5,
              content: (
                <div className="space-y-4 py-4">
                  {[
                    {
                      id: 1,
                      name: "John Doe",
                      rating: 5,
                      comment: "Excellent service and support. Highly recommend!",
                      avatar: "/icons/profile.png"
                    },
                    {
                      id: 2,
                      name: "Jane Smith",
                      rating: 5,
                      comment: "Amazing content! Worth every penny. Will definitely follow for more updates.",
                      avatar: "/icons/profile.png"
                    },
                    {
                      id: 3,
                      name: "Michael Brown",
                      rating: 4,
                      comment: "Great experience overall. Very responsive and professional.",
                      avatar: "/icons/profile.png"
                    },
                    {
                      id: 4,
                      name: "Sarah Johnson",
                      rating: 5,
                      comment: "Incredible talent! The content exceeded my expectations.",
                      avatar: "/icons/profile.png"
                    }
                  ].map(review => (
                    <div key={review.id} className="bg-gray-900 rounded-lg p-4 flex flex-col">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                          <div className="w-full h-full rounded-full overflow-hidden bg-black">
                            <Image 
                              src={review.avatar} 
                              alt={review.name} 
                              width={40} 
                              height={40} 
                              className="w-full h-full object-cover"
                            />
                  </div>
                  </div>
                  <div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                  </div>
                          <p className="text-white font-medium">{review.name}</p>
                  </div>
                    </div>
                      <p className="text-gray-300">{review.comment}</p>
                      </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Profile;
