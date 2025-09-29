// "use client"
// import React, { useEffect, useRef, useState } from "react";
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import Tabs from "./Tabs";
// import DropdownMenu from "./DropDonMenu";
// import { useParams, useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { getprofile, getfollow, getAllUsers, follow, unfollow } from "@/store/profile";
// import { getViewingProfile, getViewingFollow, getAllUsersForViewing, clearViewingProfile } from "@/store/viewingProfile";
// import type { AppDispatch, RootState } from "@/store/store";
// import { updateEdit } from "@/store/comprofile";
// import { getSocket } from "@/lib/socket";
// import { BiPencil } from "react-icons/bi";
// import StarIcon from "@/icons/transparentstar.svg";
// import StarIcon2 from "@/icons/star.svg";
// import axios from "axios";
// import { Heart, MessageCircle, X } from "lucide-react";
// import Image from "next/image";
// import { URL as API_URL } from "@/api/config";
// // import backIcon from "../icons/backIcon.svg";
//  //import StarIcon from "../icons/transparentstar.svg";
// // import StarIcon2 from "../icons/star.svg";
// // import { Postlist } from "../_components/Postlist";
// // import messageIcon from "../icons/messageIcon.png";
// // import { Exclusive } from "../_components/exclusive"
// // import { Info } from "/_components/info";
// // import Empty from "@/icons/empty.svg";
// // import DummyCoverImage from "@/icons/mmekoDummy.png";
// // import D from "@/icons/icons8-profile_Icon.png";
// // import MessagePics from "@/icons/icons8-message.png";
// // import { BiPen, BiPencil } from "react-icons/bi";
// // import {
// //   comprofilechangeStatus,
// //   getprofilebyid,
// // } from "../app/features/profile/comprofile";
// // import {
// //   follow,
// //   unfollow,
// //   ProfilechangeStatus,
// // } from "../app/features/profile/profile";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useParams, useNavigate } from "react-router-dom";
// // import person from "../icons/icons8-profile_Icon.png";
// // import { RiMarkPenLine } from "react-icons/ri";
// // import { updateFollowers } from "../app/features/model/modelSlice";
// // import { useAuth } from "../hooks/useAuth";

// // let month = "";
// // let year = "";
// // let followers = 0;
// // let likes = 0;
// // let follow_text = "follow";

// // Helper function to format numbers (e.g., 1000 -> 1K)
// const formatNumber = (num: number): string => {
//   if (!num) return '0';
//   if (num < 1000) return num.toString();
//   if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
//   return `${(num / 1000000).toFixed(1)}M`;
// };

// const Months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// // const profile = {
// //   ismodel: true,
// //   username: "John Doe",
// //   modeltDype: "music artist"
// // }

// export const Profile = () => {
//   const params = useParams();
//   const router = useRouter();

//   const dispatch = useDispatch<AppDispatch>();
//   const fileRef = useRef<HTMLInputElement | null>(null);
  
//   // State for user posts
//   const [userPosts, setUserPosts] = useState<any[]>([]);
//   const [isLoadingPosts, setIsLoadingPosts] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<any>(null);
//   const [showPostModal, setShowPostModal] = useState(false);
//   const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
//   // Get current user profile data (for side menu and current user info)
//   const currentUserProfile = useSelector((s: RootState) => s.profile);
  
//   // Get viewing profile data (for the profile being viewed)
//   const viewingProfile = useSelector((s: RootState) => s.viewingProfile);
  
//     const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

//   // Get viewingUserId from params
//   const viewingUserId = (params as any)?.userid as string;
  
//   // Determine which profile data to use based on whether we're viewing our own profile
//   const isViewingOwnProfile = viewingUserId === currentUserProfile.userId;
//   const profileData = isViewingOwnProfile ? currentUserProfile : viewingProfile;
  
//   const {
//     status,
//     firstname,
//     lastname,
//     nickname,
//     // State: location,
//     // country,
//     // active,
//     // model,
//   } = profileData;
  
//   // Access properties that might not exist on both types
//   const bio = (profileData as any).bio || "";
//   const photolink = (profileData as any).photolink || "";
//   console.log(profileData);
//   const error = useSelector((s: RootState) => s.profile.error);
//   const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
//   const reduxUserId = useSelector((s: RootState) => s.register.userID);
//   const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
//   // const isUploading = useSelector((s: RootState) => s.comprofile.updateEdit_stats === "loading");

  
//   // Get userid and token from localStorage if not in Redux
//   const [localUserid, setLocalUserid] = React.useState("");
//   const [localToken, setLocalToken] = React.useState("");
  
//   const loggedInUserId = reduxUserId || localUserid;
//   const token = reduxToken || localToken;
//   const isSelf = Boolean(loggedInUserId && viewingUserId && loggedInUserId === viewingUserId);
//   // const joined = React.useMemo(() => {
//   //   if (!createdAt) return { month: "", year: "" };
//   //   const d = new Date(createdAt);
//   //   if (isNaN(d.getTime())) return { month: "", year: "" };
//   //   return { month: Months[d.getMonth()] ?? "", year: String(d.getFullYear()) };
//   // }, [createdAt]);
//   // const [isbuying, setisbuying] = useState(false);
//   // const [gender, setgender] = useState("");
//   // const [about, setabout] = useState("");
//   // Get all selectors unconditionally
//   const currentProfileStatus = useSelector((state: RootState) => state.profile.status);
//   const viewingProfileStatus = useSelector((state: RootState) => state.viewingProfile.status);
//   const currentProfile = useSelector((state: RootState) => state.profile);
//   const viewingProfileData = useSelector((state: RootState) => state.viewingProfile);
//   const currentFollowData = useSelector((state: RootState) => state.profile.getfollow_data as any);
//   const viewingFollowData = useSelector((state: RootState) => state.viewingProfile.getfollow_data as any);
//   const currentFollowStats = useSelector((state: RootState) => state.profile.getfollow_stats);
//   const viewingFollowStats = useSelector((state: RootState) => state.viewingProfile.getfollow_stats);
//   const currentAllUsersData = useSelector((state: RootState) => state.profile.getAllUsers_data as any);
//   const viewingAllUsersData = useSelector((state: RootState) => state.viewingProfile.getAllUsers_data as any);
  
//   // Use conditional logic to select the right data
//   const getprofilebyidstats = isViewingOwnProfile ? currentProfileStatus : viewingProfileStatus;
//   const profile = isViewingOwnProfile ? currentProfile : viewingProfileData;
//   const getfollow_data = isViewingOwnProfile ? currentFollowData : viewingFollowData;
//   const getfollow_stats = isViewingOwnProfile ? currentFollowStats : viewingFollowStats;
//   const getAllUsers_data = isViewingOwnProfile ? currentAllUsersData : viewingAllUsersData;
  
//   // We don't need the entire Redux state - removing to avoid unnecessary rerenders
//   // const follow_stats = useSelector((state: RootState) => state.profile.follow_stats);
//   // const unfollow_stats = useSelector((state: RootState) => state.profile.unfollow_stats);

//   const userid = useSelector((state: RootState) => state.register.userID);
//   const { postuserid } = useParams();
  
//   // Load userid and token from localStorage if not in Redux
//   React.useEffect(() => {
//     if (typeof window !== "undefined") {
//       try {
//         const raw = localStorage.getItem("login");
//         if (raw) {
//           const data = JSON.parse(raw);
          
//           // Set user ID if not in Redux
//           if (!reduxUserId && data?.userID) {
//             setLocalUserid(data.userID);
//           }
          
//           // Set token if not in Redux
//           if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
//             setLocalToken(data.refreshtoken || data.accesstoken);
//           }
//         }
//       } catch (error) {
//         console.error("[ProfilePage] Error retrieving data from localStorage:", error);
//       }
//     }
//   }, [reduxUserId, reduxToken]);
  
//   // Use postuserid from URL params as the target user ID (the profile we're viewing)
//   const targetUserId = viewingUserId || postuserid || userid || localUserid;
  
//   // URL params and auth info ready
//   const formatter = new Intl.NumberFormat("en-US");

//   // const [userphoto, setuserphoto] = useState(person);
//   // const [disablehost, setdisable] = useState(false);
//   // const [exclusive_verify, set_exclusive_verify] = useState(false);
//   // const [disabledButton, setdisableButton] = useState(false);
//   // const [followimg, setfollowimg] = useState(StarIcon);
//   // const [isfollwed, setisfollowed] = useState(false);
//   const [modelid, setmodelid] = useState<string[]>([]);
//   // const [click, setclick] = useState(true);
//   // const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
//   // const [isMuted, setIsMuted] = useState(true);
//   // const [showAction, setShowAction] = useState(true);
//   const [isFollowing, setisFollowing] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // const [username, setusername] = useState("");

//   // let timeoutId = null;


//   useEffect(() => {
//     // Use the viewingUserId from params (the profile we're viewing)
//     if (!viewingUserId) return;
    
//     // Read token from Redux first, then fall back to localStorage
//     const tokenFromRedux = (() => {
//       try {
//         return (window as any).__REDUX_TOKEN__ ?? undefined;
//       } catch {
//         return undefined;
//       }
//     })();

//     const tokenFromRegister = ((): string | undefined => {
//       try {
//         const state = (dispatch as any).getState?.() as RootState | undefined;
//         return state?.register?.refreshtoken || state?.register?.accesstoken || undefined;
//       } catch {
//         return undefined;
//       }
//     })();

//     let token: string | undefined = tokenFromRegister || tokenFromRedux;
//     if (!token) {
//       try {
//         const raw = localStorage.getItem("login");
//         if (raw) {
//           const saved = JSON.parse(raw);
//           token = saved?.refreshtoken || saved?.accesstoken;
//         }
//       } catch {}
//     }
    
    
//     // Clear viewing profile first
//     dispatch(clearViewingProfile());
    
//     // If viewing own profile, use current user profile, otherwise fetch viewing profile
//     if (viewingUserId === loggedInUserId) {
//       // Load current user profile if not already loaded
//       if (currentUserProfile.status === "idle") {
//         dispatch(getprofile({ userid: viewingUserId, token } as any));
//       }
//     } else {
//       // Load viewing profile for other users
//       dispatch(getViewingProfile({ userid: String(viewingUserId), token: token || "" }));
//     }
//   }, [viewingUserId, dispatch, loggedInUserId, currentUserProfile.status]);

//   // Cleanup effect to restore current user profile when navigating away
//   useEffect(() => {
//     return () => {
//       // Clear viewing profile when component unmounts or when navigating away
//       dispatch(clearViewingProfile());
//     };
//   }, [dispatch]);

//   // const openPicker = () => fileRef.current?.click();
//   // const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   const file = e.target.files?.[0];
//   //   if (!file || !isSelf) return;
//   //   const blobUrl = URL.createObjectURL(file);
//   //   setAvatarSrc(blobUrl);
//   //   if (loggedInUserId && token) {
//   //     dispatch(updateEdit({ userid: loggedInUserId, token, updatePhoto: file }))
//   //       .unwrap()
//   //       .then(() => dispatch(getprofile({ userid: loggedInUserId, token } as any)))
//   //       .catch(() => {});
//   //   }
//   // };
//   useEffect(() => {
//     return () => {
//       if (avatarSrc && avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
//     };
//   }, [avatarSrc]);

//   // Ensure follow data is loaded for both current user and viewed user profiles
//   useEffect(() => {
//     if (targetUserId && token) {
//       if (isViewingOwnProfile) {
//         // For current user's own profile, use regular getfollow
//         dispatch(getfollow({ userid: String(targetUserId), token }));
//         dispatch(getAllUsers({ token }));
//       } else {
//         // For other user's profile, use viewing profile thunks
//         dispatch(getViewingFollow({ userid: String(targetUserId), token }));
//         dispatch(getAllUsersForViewing({ token }));
//       }
//     }
//   }, [targetUserId, token, isViewingOwnProfile, dispatch]);

//   useEffect(() => {
//     const profileStatus = isViewingOwnProfile ? currentUserProfile.status : viewingProfile.status;
    
//     if (profileStatus === "succeeded") {
      
//       // Fetch follower data and all users if not already loaded
//       // Use the target user ID (the profile we're viewing) for getfollow
//       if (targetUserId && token) {
//         if (isViewingOwnProfile) {
//           dispatch(getfollow({ userid: String(targetUserId), token }));
//         dispatch(getAllUsers({ token }));
//         } else {
//           dispatch(getViewingFollow({ userid: String(targetUserId), token }));
//           dispatch(getAllUsersForViewing({ token }));
//         }
//       }
      
//       // setusername((profile as any).username || "");
//       // setgender((profile as any).gender || "");
//       // setlocation(profile.location);
//       // setabout((profile as any).bio || (profile as any).aboutuser || "");
//       // setactive(profile.active);
//       // setfirstname(profile.firstname);
//       // setlastname(profile.lastname);
//       // setnickname(profile.nickname);
//       // set_exclusive_verify((profile as any).exclusive || false);
//       // We'll update isFollowing when we have follow data
//       // month = Months[Number((profile as any).joined_month)];
//       // year = (profile as any).joined_year || "";
//       // likes = (profile as any).likecount || 0; // Add fallback for likes to prevent NaN
//       // followers = (profile as any).followers?.length || 0;
//       // if (profile."/icons/icons8-profile_Icon.png") {
//       //   setuserphoto(profile."/icons/icons8-profile_Icon.png");
//       // } else {
//       //   setuserphoto(person);
//       // }

//       cantfandc();

//       // dispatch(comprofilechangeStatus("idle"));
//     }

//     if (getprofilebyidstats === "failed") {
//       // dispatch(comprofilechangeStatus("idle"));
//     }
//   }, [getprofilebyidstats, userid, postuserid]);

//   // Get followers/following from API response - EXACTLY like following page
//   const apiFollowers = React.useMemo(() => {
//     return (getfollow_data?.followers as any[]) || [];
//   }, [getfollow_data]);
  
//   const apiFollowing = React.useMemo(() => {
//     return (getfollow_data?.following as any[]) || [];
//   }, [getfollow_data]);
  
//   // Use useMemo to prevent unnecessary re-renders
//   const allUsers = React.useMemo(() => {
//     return (getAllUsers_data as any[]) || [];
//   }, [getAllUsers_data]);
  
//   // Track stats data
  
//   // Calculate follower/following counts and total likes
//   const profileStats = React.useMemo(() => {
//     // Try to get counts from API data first
//     let followersCount = apiFollowers.length;
//     let followingCount = apiFollowing.length;
    
//     // Calculate total likes from all user posts
//     const totalLikes = userPosts.reduce((sum, post) => {
//       return sum + (post.totalLikes || post.likeCount || post.likes?.length || 0);
//     }, 0);
    
//     // Fallback to profile data if API data is not available
//     if (followersCount === 0 && profileData) {
//       followersCount = (profileData as any).followers || 0;
//     }
//     if (followingCount === 0 && profileData) {
//       followingCount = (profileData as any).following || 0;
//     }
    
//     return { 
//       followersCount, 
//       followingCount,
//       totalLikes
//     };
//   }, [apiFollowers.length, apiFollowing.length, getfollow_data, isViewingOwnProfile, profileData, userPosts]);

//   // Get current user's following list from Redux (EXACT same as following page)
//   const followingList = useSelector((state: RootState) => {
//     interface FollowData {
//       following?: Array<{ id: string }>;
//     }
//     const followingData = state.profile.getfollow_data as FollowData;
//     return followingData?.following?.map(u => u.id) || [];
//   }, (left, right) => {
//     // Custom equality check to prevent unnecessary re-renders
//     if (left.length !== right.length) return false;
//     return left.every((id, index) => id === right[index]);
//   });

//   // Check if logged-in user is following the profile being viewed (EXACT same as following page)
//   useEffect(() => {
//     if (loggedInUserId && targetUserId && targetUserId !== loggedInUserId) {
//       // Use the same logic as following page
//       if (followingList.includes(Array.isArray(targetUserId) ? targetUserId.join(',') : String(targetUserId))) {
//         setisFollowing(true);
//       } else {
//         setisFollowing(false);
//       }
//     }
//   }, [followingList, loggedInUserId, targetUserId]);
  
  
//   // Note: Removed old follow status check logic - now using followingList from Redux (same as following page)
  
//   // Setup socket for real-time follow/unfollow updates
//   useEffect(() => {
//     if (!loggedInUserId || !targetUserId) return;
    
//     // Try to get socket connection
//     const socket = getSocket();
//     if (!socket) {
//       // Fallback: poll for updates every 10 seconds if socket is not available
//       const intervalId = setInterval(() => {
//         if (loggedInUserId && token) {
//           if (isViewingOwnProfile) {
//             dispatch(getfollow({ userid: loggedInUserId, token }));
//           } else {
//             dispatch(getViewingFollow({ userid: String(targetUserId), token }));
//           }
//         }
//       }, 10000);
      
//       return () => clearInterval(intervalId);
//     }
    
//     // Listen for follow/unfollow events
//     const handleFollowUpdate = (data: any) => {
//       // Check if this update is relevant to the current profile
//       if (data.target === targetUserId || data.actor === loggedInUserId) {
//         // Refresh follow data
//         if (loggedInUserId && token) {
//           if (isViewingOwnProfile) {
//             dispatch(getfollow({ userid: loggedInUserId, token }));
//           } else {
//             dispatch(getViewingFollow({ userid: String(targetUserId), token }));
//           }
//         }
//       }
//     };
    
//     socket.on('follow_update', handleFollowUpdate);
    
//     return () => {
//       socket.off('follow_update', handleFollowUpdate);
//     };
//   }, [loggedInUserId, targetUserId, token, dispatch, isViewingOwnProfile]);
  
//   // Mock data for development/testing when API fails
//   const mockPosts = React.useMemo(() => [
//     {
//       _id: 'mock1',
//       content: 'This is a sample post to show when the API is unavailable',
//       likes: Array(15),
//       comments: Array(5),
//       user: {
//         firstname: firstname || 'User',
//         lastname: lastname || '',
//         nickname: nickname || '@user',
//         photolink: photolink || avatarSrc || '/icons/profile.png'
//       },
//       createdAt: new Date().toISOString()
//     },
//     {
//       _id: 'mock2',
//       content: 'Another sample post with some image content',
//       postfilelink: ['/icons/mmekoDummy.png'],
//       likes: Array(32),
//       comments: Array(8),
//       user: {
//         firstname: firstname || 'User',
//         lastname: lastname || '',
//         nickname: nickname || '@user',
//         photolink: photolink || avatarSrc || '/icons/profile.png'
//       },
//       createdAt: new Date().toISOString()
//     }
//   ], [firstname, lastname, nickname]);

//   // Fetch user posts - wrapped in useCallback to avoid dependency cycle
//   const fetchUserPosts = React.useCallback(async (userId: string) => {
//     if (!userId || !token) {
//       return;
//     }
    
//     setIsLoadingPosts(true);
    
//     try {
//       // Use the URL constant from config for backend requests
//       const response = await axios.post(`${API_URL}/getalluserpost`, 
//         { userid: userId }, 
//         { 
//               headers: { 
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//               },
//           timeout: 10000
//         }
//       );
      
      
//       // Extract posts from response - handle different response formats
//       let posts = [];
      
//       if (response.data) {
//         // Try different possible response structures
//         if (Array.isArray(response.data)) {
//           posts = response.data;
//         } else if (response.data.posts && Array.isArray(response.data.posts)) {
//           posts = response.data.posts;
//         } else if (response.data.post && Array.isArray(response.data.post)) {
//           posts = response.data.post;
//         } else if (response.data.data && response.data.data.posts && Array.isArray(response.data.data.posts)) {
//           posts = response.data.data.posts;
//         }
//       }

//       // Fetch likes for each post, just like in fetchposts function
//       const postsWithLikes = await Promise.all(posts.map(async (post: any) => {
//         try {
//           // Get likes for this post
//           const likeResponse = await axios.get(`${API_URL}/like`, {
//             params: { postid: post._id || post.postid || post.id }
//           });
//           if (likeResponse.data.ok) {
//             console.log(`[Profile] Got likes for post ${post._id}:`, likeResponse.data);
//             return {
//               ...post,
//               likeCount: likeResponse.data.likeCount,
//               likedBy: likeResponse.data.likedBy
//             };
//           }
//           return post;
//         } catch (err) {
//           console.error(`Error fetching likes for post ${post._id}:`, err);
//           return {
//             ...post,
//             likeCount: post.likeCount || 0,
//             likedBy: post.likedBy || []
//           };
//         }
//       }));
      
//       // Use the posts with likes instead of original posts
//       posts = postsWithLikes;
      
//       // Filter posts to ensure they belong to the specific user and count total likes
//       const filteredPosts = posts.filter((post: any) => {
//         // Check if post belongs to the user we're viewing
//         const postUserId = post.userid || post.user?.userid || post.user?._id || post.userId;
//         const belongsToUser = String(postUserId) === String(userId);
        
//         if (belongsToUser) {
//           // Get total likes for this post
//           let totalLikes = 0;
          
//           // Try different possible structures where likes might be stored
//           if (Array.isArray(post.likes)) {
//             totalLikes = post.likes.length;
//           } else if (Array.isArray(post.like)) {
//             totalLikes = post.like.length;
//           } else if (typeof post.likeCount === 'number') {
//             totalLikes = post.likeCount;
//           }
          
//           // Attach the total likes count to the post
//           post.totalLikes = totalLikes;
          
//           console.log(`[Profile] Post ${post._id || 'unknown'} total likes:`, {
//             totalLikes,
//             postUserId
//           });
//         }
        
//         return belongsToUser;
//       });
      
//       setUserPosts(filteredPosts);
//       console.log("[Profile] Fetched user posts:", filteredPosts);
//     } catch (error) {
//       // Only use mock data for current user in development
//         if (typeof window !== 'undefined' && 
//             window.location.hostname === 'localhost' && 
//           userId === loggedInUserId) {
//           setUserPosts(mockPosts);
//         } else {
//           setUserPosts([]);
//         }
//     } finally {
//       setIsLoadingPosts(false);
//     }
//   }, [token, mockPosts, loggedInUserId]);
  
//   // Clear posts when switching users to prevent showing wrong posts
//   useEffect(() => {
//     setUserPosts([]);
//   }, [viewingUserId]);

//   // Fetch posts when profile is loaded - ONLY for the specific user being viewed
//   useEffect(() => {
//     if (targetUserId) {
//       // Add a small delay to ensure other API calls complete first
//       const timer = setTimeout(() => {
//         fetchUserPosts(String(targetUserId));
//       }, 500);
      
//       return () => clearTimeout(timer);
//     }
//   }, [targetUserId, token, fetchUserPosts]);

//   // useEffect(() => {
//   //   if (unfollow_stats === "succeeded") {
//   //     setisfollowed(false);
//   //     dispatch(ProfilechangeStatus("idle"));
//   //   }

//   //   if (follow_stats === "succeeded") {
//   //     setisfollowed(true);
//   //     dispatch(ProfilechangeStatus("idle"));
//   //   }
//   // }, [unfollow_stats, follow_stats]);

//   // const checkonline = (active) => {
//   //   if (active === true) {
//   //     return <p className="ml-5 text-green-600">online</p>;
//   //   } else {
//   //     return <p className="ml-5 text-red-600">offline</p>;
//   //   }
//   // };

//   // const fectuser = () => {
//   //   // if (profile.username) return false;
//   //     return false;
//   //   }
//   // };

//   // const myposts = () => {
//   //   if (profile.username) {
//   //     const sortedPosts = [...profile.post].sort(
//   //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//   //     );
//   //     return sortedPosts?.map((value) => (
//   //       <Postlist
//   //         key={value.postid}
//   //         postlog={value.postid}
//   //         "/icons/icons8-profile_Icon.png"={profile."/icons/icons8-profile_Icon.png"}
//   //         username={value.username}
//   //         datetime={value.posttime}
//   //         likes={value.like.length}
//   //         comments={value.comment.length}
//   //         postphoto={value.postphoto}
//   //         content={value.content}
//   //         posttype={value.posttype}
//   //         postuserid={value.userid}
//   //         likelist={value.like}
//   //         isfollow={value.isfollow}
//   //         currentPlayingIndex={currentPlayingIndex}
//   //         setCurrentPlayingIndex={setCurrentPlayingIndex}
//   //         isMuted={isMuted}
//   //         setIsMuted={setIsMuted}
//   //         setShowAction={setShowAction}
//   //         showAction={showAction}
//   //         timeoutId={timeoutId}
//   //         isProfilePage={true}
//   //       />
//   //     ));
//   //   }
//   // };

//   // if (userid && profile) {
//     //   if (profile.following) {
//     //     setisfollowed(true);
//     //     setfollowimg(StarIcon2);
//     //     follow_text = "";
//     //   }

//     //   if (!userid) {
//     //     setdisableButton(true);
//     //   } else if (userid === profile.userid) {
//     //     setdisableButton(true);
//     //   } else {
//     //     setdisableButton(false);
//     //   }
//     // }

//   // const exclusive = () => {
//   //   if (profile.exclusive_content?.length > 0) {
//   //     const sortedContent = [...profile.exclusive_content].sort(
//   //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//   //     );
//   //     console.log(sortedContent);

//   //     if (userid === profile.userid) {
//   //       if (exclusive_verify === true) {
//   //         return (
//   //           <div className="flex flex-col overflow-auto">
//   //             <div className="grid grid-cols-1 gap-6 mb-3 overflow-hidden">
//   //               {sortedContent.map((c, index) => (
//   //                 <Exclusive
//   //                   key={`${index}_${c._id}`}
//   //                   image={"/icons/icons8-profile_Icon.png"}
//   //                   price={c.price}
//   //                   content_type={c.content_type}
//   //                   contentlink={c.contentlink}
//   //                   contentname={c.contentname}
//   //                   buy={true}
//   //                   modelId={postuserid}
//   //                   setisbuying={setisbuying}
//   //                   id={c._id}
//   //                   me={true}
//   //                   thumblink={c.thumblink}
//   //                   createdAt={c.createdAt}
//   //                 />
//   //               ))}
//   //             </div>
//   //             <div className="flex justify-center py-4 my-4 mb-10">
//   //               <button
//   //                 onClick={() => navigate("/addexclusive")}
//   //                 className="font-bold text-slate-50"
//   //               >
//   //                 ADD Exclusive
//   //               </button>
//   //             </div>
//   //           </div>
//   //         );
//   //       } else {
//   //         return (
//   //           <div className="flex flex-col">
//   //             <div className="flex justify-end mb-2">
//   //               <button
//   //                 onClick={() => navigate("/verification")}
//   //                 className="btn"
//   //               >
//   //                 Upload
//   //               </button>
//   //             </div>
//   //           </div>
//   //         );
//   //       }
//   //     } else {
//   //       return (
//   //         <div className="flex flex-col">
//   //           <div className="grid grid-cols-1 gap-6 mb-10">
//   //             {sortedContent.map((c, index) => (
//   //               <Exclusive
//   //                 key={`${index}_${c._id}`}
//   //                 image={"/icons/icons8-profile_Icon.png"}
//   //                 price={c.price}
//   //                 content_type={c.content_type}
//   //                 contentlink={c.contentlink}
//   //                 contentname={c.contentname}
//   //                 buy={c.buy}
//   //                 setisbuying={setisbuying}
//   //                 id={c._id}
//   //                 me={false}
//   //                 thumblink={c.thumblink}
//   //                 createdAt={c.createdAt}
//   //                 modelId={postuserid}
//   //               />
//   //             ))}
//   //           </div>
//   //         </div>
//   //       );
//   //     }
//   //   } else {
//   //     if (userid === profile.userid) {
//   //       return (
//   //         <div className="flex flex-col">
//   //           <div className="flex justify-center py-4 my-4 mb-10">
//   //             <button onClick={() => navigate("/addexclusive")}>
//   //               <img
//   //                 src={Empty}
//   //                 alt="empty"
//   //                 className="object-cover w-10 h-10"
//   //               />
//   //             </button>
//   //           </div>
//   //         </div>
//   //       );
//   //     } else {
//   //       return (
//   //         <div className="flex justify-center py-4 my-4 mb-10">
//   //           <p className="text-sm text-slate-50">No content yet!</p>
//   //         </div>
//   //       );
//   //     }
//   //   }
//   // };

//   // const info = () => {
//   //   return (
//   //     <Info
//   //       firstname={profile.firstname}
//   //       lastname={profile.lastname}
//   //       birthday={profile.dob}
//   //       gender={gender}
//   //       location={location}
//   //     />
//   //   );
//   // };

//   // const follow_button = () => {
//   //   if (isfollwed === true) {
//   //     if (unfollow_stats !== "loading") {
//   //       setfollowimg(StarIcon);
//   //       follow_text = "follow";
//   //       dispatch(unfollow({ userid: postuserid, followerid: userid, token }));
//   //     }
//   //   } else if (isfollwed === false) {
//   //     if (follow_stats !== "loading") {
//   //       setfollowimg(StarIcon2);
//   //       follow_text = "";
//   //       dispatch(follow({ userid: postuserid, followerid: userid, token }));
//   //     }
//   //   }
//   // };
//   // useEffect(() => {
//   //   console.log(profile);
//   // }, [profile]);
//   // const user = useAuth();
//   // Handle follow/unfollow button click - EXACT same pattern as following page
//   const onFollowClick = async () => {
//     if (!loggedInUserId || !targetUserId || isProcessing) {
//       return;
//     }
    
//     // Get token from localStorage if not in Redux state (EXACT same as following page)
//     let authToken = token;
//     if (!authToken) {
//       try {
//         const loginData = localStorage.getItem('login');
//         if (loginData) {
//           const parsedData = JSON.parse(loginData);
//           authToken = parsedData.refreshtoken || parsedData.accesstoken;
//         }
//       } catch (error) {
//         console.error("[ProfilePage] Error retrieving token from localStorage:", error);
//       }
//     }
    
//     if (!authToken) {
//       alert("Please log in to follow/unfollow users");
//       return;
//     }
    
//     setIsProcessing(true);
    
//     try {
//       // Perform follow/unfollow action (EXACT same as following page)
//       if (isFollowing) {
//         try {
//           await dispatch(unfollow({ 
//             userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
//             followerid: loggedInUserId, 
//             token: authToken 
//           })).unwrap();
          
//           // Update local state
//           setisFollowing(false);
//         } catch (error: unknown) {
//           // If the error is "not following this user", update the UI state
//           const errorMessage = error instanceof Error ? error.message : String(error);
//           if (errorMessage.includes("not following")) {
//             setisFollowing(false);
//           } else {
//             throw error; // Re-throw for the outer catch
//           }
//         }
//       } else {
//         try {
//           await dispatch(follow({
//             userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
//             followerid: loggedInUserId,
//             token: authToken
//           })).unwrap();

          
//           // Update local state
//           setisFollowing(true);
//         } catch (error: unknown) {
//           // Handle empty error objects or objects without message property
//           let errorMessage = "";
//           if (error instanceof Error) {
//             errorMessage = error.message;
//           } else if (typeof error === 'object' && error !== null) {
//             // Try to extract message from response data if available
//             const errorObj = error as Record<string, unknown>;
//             errorMessage = 
//               (errorObj.message as string) || 
//               ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 
//               JSON.stringify(error);
//           } else {
//             errorMessage = String(error);
//           }
          
//           // If the error is "already followed", update UI to show Following
//           if (errorMessage.includes("already followed")) {
//             setisFollowing(true);
//             // Don't throw error - this is expected behavior
//           } else {
//             // For other errors, still assume following (safer approach)
//             setisFollowing(true);
//           }
//         }
//       }
      
//       // Try to emit socket event to notify other users (EXACT same as following page)
//       try {
//         const socket = getSocket();
//         if (socket && socket.connected) {
//           socket.emit('follow_update', {
//             actor: loggedInUserId,
//             target: targetUserId,
//             action: isFollowing ? 'unfollow' : 'follow'
//           });
//         }
//       } catch {
//         // Socket error - continue with normal flow
//       }
      
//       // Always refresh followers/following lists regardless of socket status (EXACT same as following page)
//       dispatch(getfollow({ userid: loggedInUserId, token: authToken }));
      
//     } catch (error: unknown) {
//       // Handle empty error objects or objects without message property
//       let errorMessage = "";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       } else if (typeof error === 'object' && error !== null) {
//         // Try to extract message from response data if available
//         const errorObj = error as Record<string, unknown>;
//         errorMessage = 
//               (errorObj.message as string) || 
//               ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string ||
//               JSON.stringify(error);
//       } else {
//         errorMessage = String(error);
//       }
      
//       // For follow errors (which are most common), assume it's "already followed"
//       if (!isFollowing || errorMessage.includes("already followed")) {
//         setisFollowing(true);
        
//         // Update DOM attributes to reflect the followed state
//         const element = document.querySelector(`[data-userid="${targetUserId}"]`);
//         if (element) {
//           element.setAttribute('data-following', 'true');
//         }
//       } else if (errorMessage.includes("not following")) {
//         setisFollowing(false);
        
//         // Update DOM attributes to reflect the unfollowed state
//         const element = document.querySelector(`[data-userid="${targetUserId}"]`);
//         if (element) {
//           element.setAttribute('data-following', 'false');
//         }
//       } else {
//         // For other errors, show an alert
//         alert("Failed to " + (isFollowing ? "unfollow" : "follow") + ". Please try again.");
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };
  
//   const cantfandc = () => {
//     if (loggedInUserId && viewingUserId) {
//       setmodelid([viewingUserId, loggedInUserId]);
//     }
//   };
  
//   // Post modal component
//   const PostModal = () => {
//     if (!selectedPost) return null;

//   return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
//         <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//           {/* Header */}
//           <div className="p-4 border-b border-gray-800 flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
//                 {selectedPost.user?.photolink ? (
//                   <Image 
//                     src={selectedPost.user.photolink} 
//                     alt="Profile" 
//                     width={40} 
//                     height={40} 
//                     className="object-cover w-full h-full"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
//                     {selectedPost.user?.firstname?.charAt(0) || '?'}
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <p className="font-medium">{selectedPost.user?.firstname} {selectedPost.user?.lastname}</p>
//                 <p className="text-xs text-gray-400">{selectedPost.user?.nickname}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setShowPostModal(false)}
//               className="text-gray-400 hover:text-white"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           {/* Content */}
//           <div className="flex-1 overflow-auto">
//             {/* Post image */}
//             {selectedPost.postfilelink && selectedPost.postfilelink[0] && (
//               <div className="relative aspect-square bg-black">
//                 <div 
//                   className="absolute inset-0 w-full h-full"
//                   style={{
//                     backgroundImage: `url('${selectedPost.postfilelink[0]}')`,
//                     backgroundSize: 'contain',
//                     backgroundPosition: 'center',
//                     backgroundRepeat: 'no-repeat'
//                   }}
//                 />
//               </div>
//             )}
            
//             {/* Post content */}
//             <div className="p-4">
//               <p className="mb-4">{selectedPost.content}</p>
              
//               {/* Stats */}
//               <div className="flex items-center gap-4 text-sm text-gray-400">
//                 <div className="flex items-center gap-1">
//                   <Heart className="w-4 h-4" />
//                   <span>{formatNumber(selectedPost.likes?.length || 0)} likes</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <MessageCircle className="w-4 h-4" />
//                   <span>{formatNumber(selectedPost.comments?.length || 0)} comments</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Profile Picture Modal Component
//   const ProfilePictureModal = () => {
//     if (!showProfilePictureModal) return null;

//     return (
//       <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4">
//         <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
//           {/* Close Button */}
//           <button
//             onClick={() => setShowProfilePictureModal(false)}
//             className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
//           >
//             <X className="w-8 h-8" />
//           </button>
          
//           {/* Profile Picture */}
//           <div className="relative w-full h-full flex items-center justify-center">
//             <div className="relative w-full h-0 pb-[100%] max-h-[80vh]">
//               <Image
//                 alt="Profile Picture"
//                 src={photolink || avatarSrc || "/icons/profile.png"}
//                 fill
//                 className="object-contain rounded-lg"
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
//               />
//             </div>
//           </div>
          
//           {/* User Info */}
//           <div className="mt-4 text-center">
//             <p className="text-white text-xl font-bold">
//               {firstname} {lastname}
//             </p>
//             <p className="text-gray-300">{nickname}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12"
//       style={{ overflowY: "scroll" }}
//     >
//       {/* Post Modal */}
//       {showPostModal && <PostModal />}
//       {/* Profile Picture Modal */}
//       {showProfilePictureModal && <ProfilePictureModal />}
//       <div
//         className="w-full mx-auto mt-4 text-white md:mr-auto md:ml-0"
//         // onClick={() => setclick(true)}
//       >
//         <div className="pb-6">
//           {(status === "loading" || status === "idle") && (
//             <SkeletonTheme baseColor="#202020" highlightColor="#444">
//               <div className="flex flex-col gap-6">
//                 {/* Profile header skeleton */}
//                 <div className="relative w-full flex items-center justify-between px-2">
//                   <div className="flex items-center justify-center w-1/3">
//                     <div className="w-24 h-24 rounded-full p-1">
//                       <Skeleton circle width={96} height={96} />
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
//                     <Skeleton width={120} height={24} className="rounded-md" />
//                     <div className="flex justify-start gap-4 w-full">
//                       <Skeleton width={60} height={20} />
//                       <Skeleton width={60} height={20} />
//                       <Skeleton width={60} height={20} />
//                     </div>
//                   </div>
//                 </div>
//                 {/* Bio and nickname skeleton */}
//                 <div className="mt-3 ml-6">
//                   <Skeleton width={80} height={18} />
//                   <Skeleton width={180} height={16} />
//                 </div>
//                 {/* Follow grid skeleton */}
//                 <div className="grid grid-cols-2 gap-1 md:gap-2">
//                   <Skeleton width={180} height={18} />
//                   <Skeleton width={180} height={18} />
//                 </div>
//               </div>
//             </SkeletonTheme>
//           )}
//           {status === "failed" && (
//             <div className="w-full px-4 py-6 text-center">
//               <div className="mb-3 text-sm text-red-400">
//                 {error || "Failed to load profile."}
//               </div>
//               <button
//                 onClick={() => viewingUserId && dispatch(getprofile({ userid: viewingUserId, token } as any))}
//                 className="px-3 py-1 text-sm rounded bg-orange-500 text-white hover:bg-orange-600"
//               >
//                 Retry
//               </button>
//             </div>
//           )}
//           {status === "succeeded" && (
//             <div className="flex flex-col">
//               <div className="relative w-full ">
               
//               <div className=" w-max absolute -top-5 right-0 px-4">
//                   <div className="flex items-center justify-between">
                    
//                     <DropdownMenu userId={viewingUserId} isOwnProfile={viewingUserId === loggedInUserId} />
//                   </div>
//                 </div>
//                 <div className="w-full px-2 ">
//                   <div className="flex items-center  justify-between">
//                     <div className="flex items-center justify-center w-1/3">
//                       <div 
//                       onClick={() => setShowProfilePictureModal(true)}
//                       className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600">
//                         <Image
//                         alt="profile picture"
//                         src={photolink || avatarSrc || "/icons/profile.png"}
//                           width={128}
//                           height={128}
//                           className="object-cover w-full h-full rounded-full"
//                       />
//                       </div>
//                     </div>
//                       <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
//                       <p className="pt-2 text-xl font-bold text-slate-200">
//                           {firstname} {lastname}
//                   </p>
//                   <div className="flex justify-start gap-4 w-full">
//                   <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
//                       {formatter.format(profileStats.totalLikes)}{" "}
//                       <span className="font-semibold tracking-wider text-[15px]">Likes</span>
//                     </p>
//          <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
//            {profileStats.followersCount} <span className="font-semibold tracking-wider text-[15px]">Fans</span>
//          </p>
//          <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
//            {profileStats.followingCount} <span className="font-semibold tracking-wider text-[15px]">Following</span>
//          </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <div className="mt-3 ml-6 ">
                 
//                   <p className="text-blue-500">{nickname}</p>
                
                
//                   {(profile as any).ismodel && (
//                     <button
//                       className="bg-[#7e3500] text-[#eedfcb] rounded-lg p-1 px-2 mt-3"
//                       // onClick={() =>
//                       //   navigate(`/modelbyid/${profile.modelid.toString()}`)
//                       // }
//                     >
//                       Request {(profile as any).modeltDype}
//                     </button>
//                   )}
//               {/* Bio */}
//                   <div className="w-full mt-2">
//                     <p className="text-slate-400">{bio || "Hey, I am using mmeko"}</p>
//                   </div>
//               <div className="w-full flex items-center justify-center">
//                     {viewingUserId !== loggedInUserId ? (
//                       <div className="flex flex-row-reverse mr-5 w-full justify-between items-center gap-2 mt-4">
//                         <div className="flex flex-row   w-1/2 rounded-lg">
//                           <button
//                             className="p-0 px-3 w-full bg-gray-800 cursor-pointer py-1.5 rounded-lg"
//                             onClick={() =>
//                               router.push(`/message/${modelid.toString()}`)
//                             }
//                           >
//                             Message
//                           </button>
//                         </div>
//                         <button
//                           key={`follow-button-${isFollowing}`}
//                           onClick={onFollowClick}
//                           disabled={isProcessing}
//                           className={`flex w-1/2 justify-center gap-x-1 items-center flex-row p-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
//                             isFollowing 
//                               ? "bg-gradient-to-r !from-blue-700 !to-purple-800" 
//                               : "bg-gradient-to-r !from-blue-500 !to-purple-600"
//                           } ${isProcessing ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
//                         >
//                           <Image
//                             src={isFollowing ? StarIcon2 : StarIcon}
//                             width={20}
//                             height={20}
//                             className="size-5"
//                             alt="rating"
//                           />

//                           <span className="font-medium">
//                             {isProcessing 
//                               ? "..." 
//                               : isFollowing === true 
//                                 ? "Following" 
//                                 : "Follow"
//                             }
//                           </span>
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         className="p-2 flex items-center justify-center gap-x-1 bg-gradient-to-r !from-blue-500 !to-purple-600 text-center text-sm rounded-lg mt-4"
//                         onClick={() => router.push(`/Profile/${viewingUserId}/editprofile`)}
//                       >
//                         <BiPencil />
//                         Edit Profile
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//                     </div>
//           )}
//                     </div>
//                   </div>
//       <div className="mx-4 sm:max-w-xl">
//         <Tabs
//           tabs={[
//             {
//               id: "posts",
//               icon: ({ className }) => (
//                 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               ),
//               count: userPosts.length,
//               content: (
//               <div>
//                   {/* 🔒 SAFETY: Only show posts belonging to the specific user being viewed */}
//                   {isLoadingPosts ? (
//                     <div className="flex justify-center items-center h-40">
//                       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
//                   </div>
//                   ) : userPosts.length === 0 ? (
//                     <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
//                       <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                       <p>No posts yet</p>
//                       {viewingUserId === loggedInUserId ? (
//                         <div>
//                           <p className="text-sm mb-2">Share your first post with your followers</p>
//                           <button 
//                             onClick={() => router.push('/upload')}
//                             className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
//                           >
//                             Create Post
//                           </button>
//                         </div>
//                       ) : (
//                         <p className="text-sm">Posts will appear here when created</p>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-3 gap-1 md:gap-2">
//                       {userPosts.map((post) => (
//                         <div
//                           key={post._id}
//                           className="relative aspect-square group cursor-pointer rounded-sm overflow-hidden bg-black"
//                           onClick={() => { 
//                             setSelectedPost(post); 
//                             setShowPostModal(true); 
//                           }}
//                         >
//                           {post.postfilelink && post.postfilelink[0] ? (
//                             <div 
//                               className="absolute inset-0 w-full h-full"
//                               style={{
//                                 backgroundImage: `url('${post.postfilelink[0]}')`,
//                                 backgroundSize: 'cover',
//                                 backgroundPosition: 'center',
//                                 backgroundRepeat: 'no-repeat'
//                               }}
//                             />
//                           ) : (
//                             <div className="absolute inset-0 flex items-center justify-center p-2">
//                               <span className="text-center text-white text-base font-semibold line-clamp-2">{post.content}</span>
//                     </div>
//                   )}
                  
//                           {/* Hover overlay */}
//                           <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                          
//                           {/* Content overlay */}
//                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="text-white text-center p-2">
//                               <div className="flex items-center justify-center gap-4 mb-2">
//                                 <div className="flex items-center gap-1">
//                                   <Heart className="w-4 h-4" />
//                                   <span className="text-sm">{formatNumber(post.totalLikes || post.likeCount || post.likes?.length || 0)}</span>
//                       </div>
//                                 <div className="flex items-center gap-1">
//                                   <MessageCircle className="w-4 h-4" />
//                                   <span className="text-sm">{formatNumber(post.comments?.length || 0)}</span>
//                   </div>
//                   </div>
//                               <p className="text-xs line-clamp-2">{post.content}</p>
//                 </div>
//               </div>
//                         </div>
//                       ))}
//             </div>
//           )}
//                 </div>
//               ),
//             },
//             {
//               id: "exclusive",
//               icon: ({ className }) => (
//                 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//               ),
//               count: 0,
//               content: (
//                 <div className="grid grid-cols-3 gap-1 md:gap-2">
//                   <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
//                     <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                       </svg>
//                     <p>No exclusive content yet</p>
//                     <p className="text-sm">Exclusive content will appear here</p>
//                     </div>
//                 </div>
//               ),
//             },
//             {
//               id: "reviews",
//               icon: ({ className }) => (
//                 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                 </svg>
//               ),
//               count: 5,
//               content: (
//                 <div className="space-y-4 py-4">
//                   {[
//                     {
//                       id: 1,
//                       name: "John Doe",
//                       rating: 5,
//                       comment: "Excellent service and support. Highly recommend!",
//                       avatar: "/icons/profile.png"
//                     },
//                     {
//                       id: 2,
//                       name: "Jane Smith",
//                       rating: 5,
//                       comment: "Amazing content! Worth every penny. Will definitely follow for more updates.",
//                       avatar: "/icons/profile.png"
//                     },
//                     {
//                       id: 3,
//                       name: "Michael Brown",
//                       rating: 4,
//                       comment: "Great experience overall. Very responsive and professional.",
//                       avatar: "/icons/profile.png"
//                     },
//                     {
//                       id: 4,
//                       name: "Sarah Johnson",
//                       rating: 5,
//                       comment: "Incredible talent! The content exceeded my expectations.",
//                       avatar: "/icons/profile.png"
//                     }
//                   ].map(review => (
//                     <div key={review.id} className="bg-gray-900 rounded-lg p-4 flex flex-col">
//                       <div className="flex items-center mb-3">
//                         <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
//                           <div className="w-full h-full rounded-full overflow-hidden bg-black">
//                             <Image 
//                               src={review.avatar} 
//                               alt={review.name} 
//                               width={40} 
//                               height={40} 
//                               className="w-full h-full object-cover"
//                             />
//                   </div>
//                   </div>
//                   <div>
//                           <div className="flex items-center">
//                             {[...Array(5)].map((_, i) => (
//                               <svg 
//                                 key={i} 
//                                 className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`} 
//                                 fill="currentColor" 
//                                 viewBox="0 0 20 20"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             ))}
//                   </div>
//                           <p className="text-white font-medium">{review.name}</p>
//                   </div>
//                     </div>
//                       <p className="text-gray-300">{review.comment}</p>
//                       </div>
//                   ))}
//                 </div>
//               ),
//             },
//           ]}
//         />
//       </div>
//     </div>
//   );
// };

// export default Profile;
"use client"
import React, { useEffect, useRef, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Tabs from "./Tabs";
import DropdownMenu from "./DropDonMenu";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile, getfollow, getAllUsers, follow, unfollow } from "@/store/profile";
import { getViewingProfile, getViewingFollow, getAllUsersForViewing, clearViewingProfile } from "@/store/viewingProfile";
import type { AppDispatch, RootState } from "@/store/store";
import { updateEdit } from "@/store/comprofile";
import { getSocket } from "@/lib/socket";
import { BiPencil } from "react-icons/bi";
import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";
import axios from "axios";
import { Heart, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { URL as API_URL } from "@/api/config";

// Add the same constants from PostsCard
const PROD_BASE = "https://mmekoapi.onrender.com"; // fallback when local proxy is down

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
  // Get current user profile data (for side menu and current user info)
  const currentUserProfile = useSelector((s: RootState) => s.profile);
  
  // Get viewing profile data (for the profile being viewed)
  const viewingProfile = useSelector((s: RootState) => s.viewingProfile);
  
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  // Get viewingUserId from params
  const viewingUserId = (params as any)?.userid as string;
  
  // Determine which profile data to use based on whether we're viewing our own profile
  const isViewingOwnProfile = viewingUserId === currentUserProfile.userId;
  const profileData = isViewingOwnProfile ? currentUserProfile : viewingProfile;
  
  const {
    status,
    firstname,
    lastname,
    nickname,
  } = profileData;
  
  // Access properties that might not exist on both types
  const bio = (profileData as any).bio || "";
  const photolink = (profileData as any).photolink || "";
  
  const error = useSelector((s: RootState) => s.profile.error);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  
  // Get userid and token from localStorage if not in Redux
  const [localUserid, setLocalUserid] = React.useState("");
  const [localToken, setLocalToken] = React.useState("");
  
  const loggedInUserId = reduxUserId || localUserid;
  const token = reduxToken || localToken;
  const isSelf = Boolean(loggedInUserId && viewingUserId && loggedInUserId === viewingUserId);

  // Get all selectors unconditionally
  const currentProfileStatus = useSelector((state: RootState) => state.profile.status);
  const viewingProfileStatus = useSelector((state: RootState) => state.viewingProfile.status);
  const currentProfile = useSelector((state: RootState) => state.profile);
  const viewingProfileData = useSelector((state: RootState) => state.viewingProfile);
  const currentFollowData = useSelector((state: RootState) => state.profile.getfollow_data as any);
  const viewingFollowData = useSelector((state: RootState) => state.viewingProfile.getfollow_data as any);
  const currentFollowStats = useSelector((state: RootState) => state.profile.getfollow_stats);
  const viewingFollowStats = useSelector((state: RootState) => state.viewingProfile.getfollow_stats);
  const currentAllUsersData = useSelector((state: RootState) => state.profile.getAllUsers_data as any);
  const viewingAllUsersData = useSelector((state: RootState) => state.viewingProfile.getAllUsers_data as any);
  
  // Use conditional logic to select the right data
  const getprofilebyidstats = isViewingOwnProfile ? currentProfileStatus : viewingProfileStatus;
  const profile = isViewingOwnProfile ? currentProfile : viewingProfileData;
  const getfollow_data = isViewingOwnProfile ? currentFollowData : viewingFollowData;
  const getfollow_stats = isViewingOwnProfile ? currentFollowStats : viewingFollowStats;
  const getAllUsers_data = isViewingOwnProfile ? currentAllUsersData : viewingAllUsersData;
  
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

  const [modelid, setmodelid] = useState<string[]>([]);
  const [isFollowing, setisFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    // Clear viewing profile first
    dispatch(clearViewingProfile());
    
    // If viewing own profile, use current user profile, otherwise fetch viewing profile
    if (viewingUserId === loggedInUserId) {
      // Load current user profile if not already loaded
      if (currentUserProfile.status === "idle") {
        dispatch(getprofile({ userid: viewingUserId, token } as any));
      }
    } else {
      // Load viewing profile for other users
      dispatch(getViewingProfile({ userid: String(viewingUserId), token: token || "" }));
    }
  }, [viewingUserId, dispatch, loggedInUserId, currentUserProfile.status]);

  // Cleanup effect to restore current user profile when navigating away
  useEffect(() => {
    return () => {
      // Clear viewing profile when component unmounts or when navigating away
      dispatch(clearViewingProfile());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  // Ensure follow data is loaded for both current user and viewed user profiles
  useEffect(() => {
    if (targetUserId && token) {
      if (isViewingOwnProfile) {
        // For current user's own profile, use regular getfollow
        dispatch(getfollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsers({ token }));
      } else {
        // For other user's profile, use viewing profile thunks
        dispatch(getViewingFollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsersForViewing({ token }));
      }
    }
  }, [targetUserId, token, isViewingOwnProfile, dispatch]);

  useEffect(() => {
    const profileStatus = isViewingOwnProfile ? currentUserProfile.status : viewingProfile.status;
    
    if (profileStatus === "succeeded") {
      
      // Fetch follower data and all users if not already loaded
      // Use the target user ID (the profile we're viewing) for getfollow
      if (targetUserId && token) {
        if (isViewingOwnProfile) {
          dispatch(getfollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsers({ token }));
        } else {
          dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          dispatch(getAllUsersForViewing({ token }));
        }
      }
      
      cantfandc();
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
  
  // Calculate follower/following counts and total likes
  const profileStats = React.useMemo(() => {
    // Try to get counts from API data first
    let followersCount = apiFollowers.length;
    let followingCount = apiFollowing.length;
    
    // Calculate total likes from all user posts
    const totalLikes = userPosts.reduce((sum, post) => {
      return sum + (post.totalLikes || post.likeCount || post.likes?.length || 0);
    }, 0);
    
    // Fallback to profile data if API data is not available
    if (followersCount === 0 && profileData) {
      followersCount = (profileData as any).followers || 0;
    }
    if (followingCount === 0 && profileData) {
      followingCount = (profileData as any).following || 0;
    }
    
    return { 
      followersCount, 
      followingCount,
      totalLikes
    };
  }, [apiFollowers.length, apiFollowing.length, getfollow_data, isViewingOwnProfile, profileData, userPosts]);

  // Get current user's following list from Redux (EXACT same as following page)
  const followingList = useSelector((state: RootState) => {
    interface FollowData {
      following?: Array<{ id: string }>;
    }
    const followingData = state.profile.getfollow_data as FollowData;
    return followingData?.following?.map(u => u.id) || [];
  }, (left, right) => {
    // Custom equality check to prevent unnecessary re-renders
    if (left.length !== right.length) return false;
    return left.every((id, index) => id === right[index]);
  });

  // Check if logged-in user is following the profile being viewed (EXACT same as following page)
  useEffect(() => {
    if (loggedInUserId && targetUserId && targetUserId !== loggedInUserId) {
      // Use the same logic as following page
      if (followingList.includes(Array.isArray(targetUserId) ? targetUserId.join(',') : String(targetUserId))) {
        setisFollowing(true);
      } else {
        setisFollowing(false);
      }
    }
  }, [followingList, loggedInUserId, targetUserId]);
  
  // Setup socket for real-time follow/unfollow updates
  useEffect(() => {
    if (!loggedInUserId || !targetUserId) return;
    
    // Try to get socket connection
    const socket = getSocket();
    if (!socket) {
      // Fallback: poll for updates every 10 seconds if socket is not available
      const intervalId = setInterval(() => {
        if (loggedInUserId && token) {
          if (isViewingOwnProfile) {
            dispatch(getfollow({ userid: loggedInUserId, token }));
          } else {
            dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          }
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
    
    // Listen for follow/unfollow events
    const handleFollowUpdate = (data: any) => {
      // Check if this update is relevant to the current profile
      if (data.target === targetUserId || data.actor === loggedInUserId) {
        // Refresh follow data
        if (loggedInUserId && token) {
          if (isViewingOwnProfile) {
            dispatch(getfollow({ userid: loggedInUserId, token }));
          } else {
            dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          }
        }
      }
    };
    
    socket.on('follow_update', handleFollowUpdate);
    
    return () => {
      socket.off('follow_update', handleFollowUpdate);
    };
  }, [loggedInUserId, targetUserId, token, dispatch, isViewingOwnProfile]);
  
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
    if (!userId || !token) {
      return;
    }
    
    setIsLoadingPosts(true);
    
    try {
      // Use the URL constant from config for backend requests
      const response = await axios.post(`${API_URL}/getalluserpost`, 
        { userid: userId }, 
        { 
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
          timeout: 10000
        }
      );
      
      
      // Extract posts from response - handle different response formats
      let posts = [];
      
      if (response.data) {
        // Try different possible response structures
        if (Array.isArray(response.data)) {
          posts = response.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          posts = response.data.posts;
        } else if (response.data.post && Array.isArray(response.data.post)) {
          posts = response.data.post;
        } else if (response.data.data && response.data.data.posts && Array.isArray(response.data.data.posts)) {
          posts = response.data.data.posts;
        }
      }

      // Fetch likes for each post, just like in fetchposts function
      const postsWithLikes = await Promise.all(posts.map(async (post: any) => {
        try {
          // Get likes for this post
          const likeResponse = await axios.get(`${API_URL}/like`, {
            params: { postid: post._id || post.postid || post.id }
          });
          if (likeResponse.data.ok) {
         
            return {
              ...post,
              likeCount: likeResponse.data.likeCount,
              likedBy: likeResponse.data.likedBy
            };
          }
          return post;
        } catch (err) {
        
          return {
            ...post,
            likeCount: post.likeCount || 0,
            likedBy: post.likedBy || []
          };
        }
      }));
      
      // Use the posts with likes instead of original posts
      posts = postsWithLikes;
      
      // Filter posts to ensure they belong to the specific user and count total likes
      const filteredPosts = posts.filter((post: any) => {
        // Check if post belongs to the user we're viewing
        const postUserId = post.userid || post.user?.userid || post.user?._id || post.userId;
        const belongsToUser = String(postUserId) === String(userId);
        
        if (belongsToUser) {
          // Get total likes for this post
          let totalLikes = 0;
          
          // Try different possible structures where likes might be stored
          if (Array.isArray(post.likes)) {
            totalLikes = post.likes.length;
          } else if (Array.isArray(post.like)) {
            totalLikes = post.like.length;
          } else if (typeof post.likeCount === 'number') {
            totalLikes = post.likeCount;
          }
          
          // Attach the total likes count to the post
          post.totalLikes = totalLikes;
          
        }
        
        return belongsToUser;
      });
      
      setUserPosts(filteredPosts);
   
    } catch (error) {
      // Only use mock data for current user in development
        if (typeof window !== 'undefined' && 
            window.location.hostname === 'localhost' && 
          userId === loggedInUserId) {
          setUserPosts(mockPosts);
        } else {
          setUserPosts([]);
        }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token, mockPosts, loggedInUserId]);
  
  // Clear posts when switching users to prevent showing wrong posts
  useEffect(() => {
    setUserPosts([]);
  }, [viewingUserId]);

  // Fetch posts when profile is loaded - ONLY for the specific user being viewed
  useEffect(() => {
    if (targetUserId) {
      // Add a small delay to ensure other API calls complete first
      const timer = setTimeout(() => {
        fetchUserPosts(String(targetUserId));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [targetUserId, token, fetchUserPosts]);

  // Handle follow/unfollow button click - EXACT same pattern as following page
  const onFollowClick = async () => {
    if (!loggedInUserId || !targetUserId || isProcessing) {
      return;
    }
    
    // Get token from localStorage if not in Redux state (EXACT same as following page)
    let authToken = token;
    if (!authToken) {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.refreshtoken || parsedData.accesstoken;
        }
      } catch (error) {
        console.error("[ProfilePage] Error retrieving token from localStorage:", error);
      }
    }
    
    if (!authToken) {
      alert("Please log in to follow/unfollow users");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Perform follow/unfollow action (EXACT same as following page)
      if (isFollowing) {
        try {
          await dispatch(unfollow({ 
            userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
            followerid: loggedInUserId, 
            token: authToken 
          })).unwrap();
          
          // Update local state
          setisFollowing(false);
        } catch (error: unknown) {
          // If the error is "not following this user", update the UI state
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not following")) {
            setisFollowing(false);
          } else {
            throw error; // Re-throw for the outer catch
          }
        }
      } else {
        try {
          await dispatch(follow({
            userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
            followerid: loggedInUserId,
            token: authToken
          })).unwrap();

          
          // Update local state
          setisFollowing(true);
        } catch (error: unknown) {
          // Handle empty error objects or objects without message property
          let errorMessage = "";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            // Try to extract message from response data if available
            const errorObj = error as Record<string, unknown>;
            errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 
              JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }
          
          // If the error is "already followed", update UI to show Following
          if (errorMessage.includes("already followed")) {
            setisFollowing(true);
            // Don't throw error - this is expected behavior
          } else {
            // For other errors, still assume following (safer approach)
            setisFollowing(true);
          }
        }
      }
      
      // Try to emit socket event to notify other users (EXACT same as following page)
      try {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('follow_update', {
            actor: loggedInUserId,
            target: targetUserId,
            action: isFollowing ? 'unfollow' : 'follow'
          });
        }
      } catch {
        // Socket error - continue with normal flow
      }
      
      // Always refresh followers/following lists regardless of socket status (EXACT same as following page)
      dispatch(getfollow({ userid: loggedInUserId, token: authToken }));
      
    } catch (error: unknown) {
      // Handle empty error objects or objects without message property
      let errorMessage = "";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from response data if available
        const errorObj = error as Record<string, unknown>;
        errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string ||
              JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      // For follow errors (which are most common), assume it's "already followed"
      if (!isFollowing || errorMessage.includes("already followed")) {
        setisFollowing(true);
        
        // Update DOM attributes to reflect the followed state
        const element = document.querySelector(`[data-userid="${targetUserId}"]`);
        if (element) {
          element.setAttribute('data-following', 'true');
        }
      } else if (errorMessage.includes("not following")) {
        setisFollowing(false);
        
        // Update DOM attributes to reflect the unfollowed state
        const element = document.querySelector(`[data-userid="${targetUserId}"]`);
        if (element) {
          element.setAttribute('data-following', 'false');
        }
      } else {
        // For other errors, show an alert
        alert("Failed to " + (isFollowing ? "unfollow" : "follow") + ". Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const cantfandc = () => {
    if (loggedInUserId && viewingUserId) {
      setmodelid([viewingUserId, loggedInUserId]);
    }
  };

  // Function to get media source with fallbacks (same as in PostsCard)
  const getMediaSource = (post: any) => {
    // Infer post type: prefer explicit fields if present
    let postType: string = post?.posttype || post?.type || "text";
    if (!postType) {
      if (post?.postphoto || post?.image) postType = "image";
      else if (post?.postvideo || post?.video) postType = "video";
    }

    // Resolve media reference (cover more backend key variants) - same as PostsCard
    const mediaRef =
      post?.postphoto ||
      post?.postvideo ||
      post?.postlink ||
      post?.postFile ||
      post?.file ||
      post?.proxy_view ||
      post?.file_link ||
      post?.media ||
      post?.image ||
      post?.video ||
      post?.thumblink ||
      // support top-level identifiers
      post?.publicId ||
      post?.public_id ||
      post?.imageId ||
      post?.postfilepublicid ||
      post?.postfilelink ||
      "";
    
    const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
    const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
    const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
    const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
    const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
    const queryUrlPrimary = asString ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlPrimary = asString ? `${API_URL}/api/image/view/${encodeURIComponent(asString)}` : "";
    const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
    const src = isUrl ? asString : queryUrlPrimary;

    return {
      src,
      postType,
      asString,
      queryUrlPrimary,
      pathUrlPrimary,
      queryUrlFallback,
      pathUrlFallback
    };
  };

  // Post modal component
  const PostModal = () => {
    if (!selectedPost) return null;

    const { src, postType } = getMediaSource(selectedPost);

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
            {/* Media display with proper fallbacks */}
            {postType === "image" && src && (
              <div className="relative aspect-square bg-black">
                <img
                  src={src}
                  alt={selectedPost?.content || "post image"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement & { dataset: any };
                    const { pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(selectedPost);
                    
                    // First fallback: switch to path URL on same base
                    if (!img.dataset.fallback1 && pathUrlPrimary) {
                      img.dataset.fallback1 = "1";
                      img.src = pathUrlPrimary;
                      return;
                    }
                    // Second fallback: try query on PROD base
                    if (!img.dataset.fallback2 && queryUrlFallback) {
                      img.dataset.fallback2 = "1";
                      img.src = queryUrlFallback;
                      return;
                    }
                    // Final fallback: try path on PROD base
                    if (!img.dataset.fallback3 && pathUrlFallback) {
                      img.dataset.fallback3 = "1";
                      img.src = pathUrlFallback;
                    }
                  }}
                />
              </div>
            )}
            
            {postType === "video" && src && (
              <div className="relative aspect-square bg-black">
                <video
                  src={src}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                    const { pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(selectedPost);
                    
                    // First fallback: switch to path URL on same base
                    if (!video.dataset.fallback1 && pathUrlPrimary) {
                      video.dataset.fallback1 = "1";
                      video.src = pathUrlPrimary;
                      video.load();
                      return;
                    }
                    // Second fallback: try query on PROD base
                    if (!video.dataset.fallback2 && queryUrlFallback) {
                      video.dataset.fallback2 = "1";
                      video.src = queryUrlFallback;
                      video.load();
                      return;
                    }
                    // Final fallback: try path on PROD base
                    if (!video.dataset.fallback3 && pathUrlFallback) {
                      video.dataset.fallback3 = "1";
                      video.src = pathUrlFallback;
                      video.load();
                    }
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

  // Profile Picture Modal Component
  const ProfilePictureModal = () => {
    if (!showProfilePictureModal) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4">
        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setShowProfilePictureModal(false)}
            className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Profile Picture */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-0 pb-[100%] max-h-[80vh]">
              <Image
                alt="Profile Picture"
                src={photolink || avatarSrc || "/icons/profile.png"}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
          </div>
          
          {/* User Info */}
          <div className="mt-4 text-center">
            <p className="text-white text-xl font-bold">
              {firstname} {lastname}
            </p>
            <p className="text-gray-300">{nickname}</p>
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
      {/* Profile Picture Modal */}
      {showProfilePictureModal && <ProfilePictureModal />}
      <div
        className="w-full mx-auto mt-4 text-white md:mr-auto md:ml-0"
      >
        <div className="pb-6">
          {(status === "loading" || status === "idle") && (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <div className="flex flex-col gap-6">
                {/* Profile header skeleton */}
                <div className="relative w-full flex items-center justify-between px-2">
                  <div className="flex items-center justify-center w-1/3">
                    <div className="w-24 h-24 rounded-full p-1">
                      <Skeleton circle width={96} height={96} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
                    <Skeleton width={120} height={24} className="rounded-md" />
                    <div className="flex justify-start gap-4 w-full">
                      <Skeleton width={60} height={20} />
                      <Skeleton width={60} height={20} />
                      <Skeleton width={60} height={20} />
                    </div>
                  </div>
                </div>
                {/* Bio and nickname skeleton */}
                <div className="mt-3 ml-6">
                  <Skeleton width={80} height={18} />
                  <Skeleton width={180} height={16} />
                </div>
                {/* Follow grid skeleton */}
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  <Skeleton width={180} height={18} />
                  <Skeleton width={180} height={18} />
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
                      <div 
                      onClick={() => setShowProfilePictureModal(true)}
                      className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600">
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
                      {formatter.format(profileStats.totalLikes)}{" "}
                      <span className="font-semibold tracking-wider text-[15px]">Likes</span>
                    </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {profileStats.followersCount} <span className="font-semibold tracking-wider text-[15px]">Fans</span>
         </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {profileStats.followingCount} <span className="font-semibold tracking-wider text-[15px]">Following</span>
         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-3 ml-6 ">
                 
                  <p className="text-blue-500">{nickname}</p>
                
                
                  {(profile as any).ismodel && (
                    <button
                      className="bg-[#7e3500] text-[#eedfcb] rounded-lg p-1 px-2 mt-3"
                    >
                      Request {(profile as any).modeltDype}
                    </button>
                  )}
              {/* Bio */}
                  <div className="w-full overflow-x-hidden   mt-2">
                    <p className="text-slate-400 break-words">{bio || "Hey, I am using mmeko"}</p>
                  </div>
              <div className="w-full flex items-center justify-center">
                    {viewingUserId !== loggedInUserId ? (
                      <div className="flex flex-row-reverse mr-5 w-full justify-between items-center gap-2 mt-4">
                        <div className="flex flex-row   w-1/2 rounded-lg">
                          <button
                            className="p-0 px-3 w-full bg-gray-800 cursor-pointer py-1.5 rounded-lg"
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
                          disabled={isProcessing}
                          className={`flex w-1/2 justify-center gap-x-1 items-center flex-row p-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            isFollowing 
                              ? "bg-gradient-to-r !from-blue-700 !to-purple-800" 
                              : "bg-gradient-to-r !from-blue-500 !to-purple-600"
                          } ${isProcessing ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
                        >
                          <Image
                            src={isFollowing ? StarIcon2 : StarIcon}
                            width={20}
                            height={20}
                            className="size-5"
                            alt="rating"
                          />

                          <span className="font-medium">
                            {isProcessing 
                              ? "..." 
                              : isFollowing === true 
                                ? "Following" 
                                : "Follow"
                            }
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
                  {/* 🔒 SAFETY: Only show posts belonging to the specific user being viewed */}
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
  {[...userPosts].reverse().map((post) => {
    const { src, postType, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(post);
    
    return (
      <div
        key={post._id}
        className="relative aspect-square group cursor-pointer rounded-sm overflow-hidden bg-black"
        onClick={() => { 
          setSelectedPost(post); 
          setShowPostModal(true); 
        }}
      >
        {/* Image Post */}
        {postType === "image" && src && (
          <img
            src={src}
            alt={post?.content || "post image"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement & { dataset: any };
              // First fallback: switch to path URL on same base
              if (!img.dataset.fallback1 && pathUrlPrimary) {
                img.dataset.fallback1 = "1";
                img.src = pathUrlPrimary;
                return;
              }
              // Second fallback: try query on PROD base
              if (!img.dataset.fallback2 && queryUrlFallback) {
                img.dataset.fallback2 = "1";
                img.src = queryUrlFallback;
                return;
              }
              // Final fallback: try path on PROD base
              if (!img.dataset.fallback3 && pathUrlFallback) {
                img.dataset.fallback3 = "1";
                img.src = pathUrlFallback;
              }
            }}
          />
        )}
        
        {/* Video Post */}
        {postType === "video" && src && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
            <video
              src={src}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              onError={(e) => {
                const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                // First fallback: switch to path URL on same base
                if (!video.dataset.fallback1 && pathUrlPrimary) {
                  video.dataset.fallback1 = "1";
                  video.src = pathUrlPrimary;
                  video.load();
                  return;
                }
                // Second fallback: try query on PROD base
                if (!video.dataset.fallback2 && queryUrlFallback) {
                  video.dataset.fallback2 = "1";
                  video.src = queryUrlFallback;
                  video.load();
                  return;
                }
                // Final fallback: try path on PROD base
                if (!video.dataset.fallback3 && pathUrlFallback) {
                  video.dataset.fallback3 = "1";
                  video.src = pathUrlFallback;
                  video.load();
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* Text Post or No Media */}
        {(!src || postType === "text") && (
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
                <span className="text-sm">{formatNumber(post.totalLikes || post.likeCount || post.likes?.length || 0)}</span>
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
    );
  })}
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