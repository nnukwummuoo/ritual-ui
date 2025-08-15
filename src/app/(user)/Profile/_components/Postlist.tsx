import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import comment from "../../../icons/commentpostIcon.svg";
import threeDots from "../../../icons/Dots 3 horizontal.svg";

import { Commmentpage } from "./Commmentpage";
import like from "../../../icons/likeIcon.svg";
import unfollowIcon from "../../../icons/transparentstar.svg";
import followIcon from "../../../icons/star.svg";
import "../../../navs/Navs.css";
// import { toast } from "react-toastify";
// import { format } from "date-fns";
// import likedicon from "../../../icons/likedIcon.svg";
// import Options from "../../../icons/menu.svg";
// import "/icons/icons8-profile_Icon.png from "../../../icons";
// import { getpostcomment } from "../../../app/features/comment/comment";
// import deleteicon from "../../../icons/deleteicon.svg";
// import {
//   resetcomment,
//   clearcomment,
// } from "../../../app/features/comment/comment";
// import {
//   deletepost,
//   PostchangeStatus,
//   emptypostphoto,
// // } from "../../../app/features/post/post";
// import { postlike, chagelikestatus } from "../../../app/features/like/like";
// import { getpostbyid, getallpost } from "../../../app/features/post/post";
// import { useNavigate } from "react-router-dom";
// import { resetprofilebyid } from "../../../app/features/profile/comprofile";
// import {
//   follow,
//   unfollow,
//   ProfilechangeStatus,
// } from "../../../app/features/profile/profile";
// import { useCall } from "../../messageview/context";
// import { BottomNav } from "../../../navs/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import DummyImage from "../../../icons/icons8-profile_Icon.png";
import DummyContentImage from "../../../icons/mmekoDummy.png";
import "../../../styles/postlist.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { postListConstants } from "../_constants/postListConstants";
// import { useAuth } from "../../../hooks/useAuth";
// import { updateFollowers } from "../../../app/features/model/modelSlice";

export const Postlist = React.memo(
  ({
    userphoto,
    username,
    datetime,
    likes,
    comments,
    postphoto,
    content,
    posttype,
    postlog,
    postuserid,
    likelist,
    nickname,
    isfollow,
    currentPlayingIndex,
    setCurrentPlayingIndex,
    isMuted,
    setIsMuted,
    setShowAction,
    index,
    showAction,
    timeoutId,
    setPosts,
    isProfilePage = false,
    modelId,
    followers,
  }: postListConstants) => {
    const [following, set_following] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // const dispatch = useDispatch();
    // const navigate = useNavigate();
    // const token = useSelector((state) => state.register.refreshtoken);
    const enableDelete = true; // actually a function from initial
    const userid = "random-user-id-1234" // useSelector((state) => state.register.userID);
    // const allcommentstatus = useSelector(
    //   (state) => state.comment.allcommentstatus
    // );
    // const likestatus = useSelector((state) => state.like.likestatus);
    // const poststatus = useSelector((state) => state.post.getpostbyidstatus);
    // const profile = useSelector((state) => state.comprofile.profile);
    // const follow_stats = useSelector((state) => state.profile.follow_stats);
    // const unfollow_stats = useSelector((state) => state.profile.unfollow_stats);
    // const allPost = useSelector((state) => state.post.allPost);

    // let myNick = "";
    // const ref = useRef(true);
    // const { toggleoption, opening, trackopen, settrackOpens, closehomeopts } =
    //   useCall();
    // let count = 0;

    // const error = useSelector((state) => state.comment.error);
    // const errorpost = useSelector((state) => state.post.error);
    // const likeerror = useSelector((state) => state.like.error);
    // const deletepostsatus = useSelector((state) => state.post.deletepostsatus);
    // const user = useAuth();

    // useEffect(() => {
    //   if (followers) {
    //     // console.log(followers, username);
    //     // console.log(user?.userID);
    //     if (followers.includes(user?.userID)) {
    //       set_following(true);
    //     } else {
    //       set_following(false);
    //     }
    //   }

    //   getphotos();
    //   checkmyLike();
    // }, [followers]);

    // const onFollowClick = async () => {
    //   try {
    //     if (following == true) {
    //       set_following(false);
    //       setPosts((prev) =>
    //         prev.map((item) => {
    //           if (item.userid === postuserid)
    //             return {
    //               ...item,
    //               followers: item.followers.filter((id) => id !== user.userID),
    //             };
    //           return item;
    //         })
    //       );
    //     } else {
    //       set_following(true);
    //       setPosts((prev) =>
    //         prev.map((item) => {
    //           if (item.userid === postuserid)
    //             return {
    //               ...item,
    //               followers: [...item.followers, user.userID],
    //             };
    //           return item;
    //         })
    //       );
    //     }

    //     setIsLoading(true);
    //     const res = await dispatch(
    //       updateFollowers({
    //         id: postuserid,
    //         userId: userid,
    //         action: "update",
    //         token: user?.refreshtoken || "",
    //       })
    //     );
    //     console.log(res);
    //   } catch (error) {
    //     console.log(error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // Memoize date formatting to prevent recalculation
    // const formattedDate = useMemo(() => {
    // const date1 = new Date(parseInt(datetime));
    //   return format(date1, "MM/dd/yyyy 'at' h:mm a");
    // }, [datetime]);

    const [postuser, setpostuser] = useState<string | undefined>("/icons/icons8-profile_Icon.png");
    const [file, setfile] = useState();
    const [alreadylike, setalreadylike] = useState(false);
    const [likephoto, setlikephoto] = useState(like);
    const [showComments, setShowComments] = useState();
    const [isFollowing, set_isFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOpen, setisOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const observerRef = useRef(null);
    const actionTimeoutRef = useRef(null);

    // NEW: States for handling network loading
    const [isBuffering, setIsBuffering] = useState(false);
    const [networkLoading, setNetworkLoading] = useState(false);
    const bufferingTimeoutRef = useRef(null);

    // Optimized video intersection observer
    // useEffect(() => {
    //   if (!videoRef.current || posttype !== "video" || videoError) return;

    //   const video = videoRef.current;

    //   const handleVideoLoad = () => {
    //     setIsVideoLoaded(true);
    //     setLoading(false);
    //     setNetworkLoading(false);
    //   };

    //   const handleVideoError = () => {
    //     setVideoError(true);
    //     setLoading(false);
    //     setNetworkLoading(false);
    //     console.error("Video failed to load:", file);
    //   };

    //   // NEW: Handle video waiting (buffering/network issues)
    //   const handleWaiting = () => {
    //     setIsBuffering(true);
    //     setNetworkLoading(true);

    //     // Clear any existing timeout
    //     if (bufferingTimeoutRef.current) {
    //       clearTimeout(bufferingTimeoutRef.current);
    //     }

    //     // Set timeout to show loading after 500ms of buffering
    //     bufferingTimeoutRef.current = setTimeout(() => {
    //       if (isBuffering) {
    //         setNetworkLoading(true);
    //       }
    //     }, 500);
    //   };

    //   // NEW: Handle video playing (no longer buffering)
    //   const handlePlaying = () => {
    //     setIsBuffering(false);
    //     setNetworkLoading(false);
    //     setLoading(false);

    //     // Clear buffering timeout
    //     if (bufferingTimeoutRef.current) {
    //       clearTimeout(bufferingTimeoutRef.current);
    //     }
    //   };

    //   // NEW: Handle when video can play (enough data loaded)
    //   const handleCanPlay = () => {
    //     setIsBuffering(false);
    //     setNetworkLoading(false);
    //     setLoading(false);
    //   };

    //   // NEW: Handle progress (downloading)
    //   const handleProgress = () => {
    //     if (video.buffered.length > 0) {
    //       const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    //       const duration = video.duration;
    //       if (bufferedEnd < duration && !video.paused) {
    //         // Still downloading/buffering
    //         setNetworkLoading(true);
    //       }
    //     }
    //   };

    //   // NEW: Handle stalled (network issues)
    //   const handleStalled = () => {
    //     setNetworkLoading(true);
    //     setIsBuffering(true);
    //   };

    //   video.addEventListener("loadeddata", handleVideoLoad);
    //   video.addEventListener("error", handleVideoError);
    //   video.addEventListener("waiting", handleWaiting);
    //   video.addEventListener("playing", handlePlaying);
    //   video.addEventListener("canplay", handleCanPlay);
    //   video.addEventListener("progress", handleProgress);
    //   video.addEventListener("stalled", handleStalled);

    //   // Optimized intersection observer with better threshold
    //   const observer = new IntersectionObserver(
    //     ([entry]) => {
    //       if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
    //         // Only play if video is loaded and not already playing
    //         if (isVideoLoaded && video.paused) {
    //           setCurrentPlayingIndex(postlog);
    //           video.play().catch((err) => {
    //             console.error("Video play failed:", err);
    //             setNetworkLoading(false);
    //           });
    //           setIsPlaying(true);
    //         }
    //       } else {
    //         // Pause and reset video when out of view
    //         if (!video.paused) {
    //           video.pause();
    //           video.currentTime = 0;
    //           setIsPlaying(false);
    //           setNetworkLoading(false);
    //           setIsBuffering(false);
    //         }
    //       }
    //     },
    //     {
    //       threshold: [0.5, 0.7],
    //       rootMargin: "20px",
    //     }
    //   );

    //   observer.observe(video);
    //   observerRef.current = observer;

    //   return () => {
    //     video.removeEventListener("loadeddata", handleVideoLoad);
    //     video.removeEventListener("error", handleVideoError);
    //     video.removeEventListener("waiting", handleWaiting);
    //     video.removeEventListener("playing", handlePlaying);
    //     video.removeEventListener("canplay", handleCanPlay);
    //     video.removeEventListener("progress", handleProgress);
    //     video.removeEventListener("stalled", handleStalled);

    //     if (bufferingTimeoutRef.current) {
    //       clearTimeout(bufferingTimeoutRef.current);
    //     }

    //     if (observerRef.current && video) {
    //       observerRef.current.unobserve(video);
    //     }
    //   };
    // }, [
    //   posttype,
    //   postlog,
    //   setCurrentPlayingIndex,
    //   isVideoLoaded,
    //   videoError,
    //   file,
    //   isBuffering,
    // ]);

    // // Optimized video control based on current playing index
    // useEffect(() => {
    //   if (
    //     videoRef.current &&
    //     posttype === "video" &&
    //     isVideoLoaded &&
    //     !videoError
    //   ) {
    //     const video = videoRef.current;

    //     if (currentPlayingIndex === postlog) {
    //       if (video.paused) {
    //         video.play().catch((err) => {
    //           console.error("Video play failed:", err);
    //           setNetworkLoading(false);
    //         });
    //         setIsPlaying(true);
    //       }
    //     } else {
    //       if (!video.paused) {
    //         video.pause();
    //         video.currentTime = 0;
    //         setIsPlaying(false);
    //         setNetworkLoading(false);
    //         setIsBuffering(false);
    //       }
    //     }
    //   }
    // }, [currentPlayingIndex, postlog, posttype, isVideoLoaded, videoError]);

    // // Optimized video end handler
    // const handleVideoEnd = useCallback(() => {
    //   setCurrentPlayingIndex((prevIndex) => prevIndex + 1);
    //   setIsPlaying(false);
    //   setNetworkLoading(false);
    //   setIsBuffering(false);
    // }, [setCurrentPlayingIndex]);

    // Memoize likes and comments to prevent unnecessary re-renders
    const [displayLikes, setDisplayLikes] = useState(Number(likes) || 0);
    const displayComments = comments || "0";

    // Optimized pause all videos function
    // const pauseAllVideos = useCallback(() => {
    //   document.querySelectorAll("video").forEach((vid) => {
    //     if (!vid.paused) {
    //       vid.pause();
    //     }
    //   });
    // }, []);

    // const getphotos = useCallback(async () => {
    //   if (userphoto) setpostuser(userphoto);
    //   setfile(postphoto);
    // }, [userphoto, postphoto]);

    // const enableDelete = useCallback(() => {
    //   return userid === postuserid;
    // }, [userid, postuserid]);
    const enableFollow = useCallback(() => {
      if (!userid || userid === postuserid) return false;
      return true;
    }, [userid, postuserid]);

    // // Optimized like function with debouncing
    // const postmylike = useCallback(() => {
    //   if (likestatus !== "loading") {
    //     dispatch(postlike({ userid, postid: postlog, token }));
    //   }
    // }, [likestatus, userid, postlog, token, dispatch]);

    // useEffect(() => {
    //   if (allcommentstatus === "succeeded") {
    //     dispatch(resetcomment("idle"));
    //   }

    //   if (allcommentstatus === "failed") {
    //     dispatch(resetcomment("idle"));
    //     dispatch(clearcomment());
    //   }

    //   if (deletepostsatus === "succeeded") {
    //     toast.dismiss();
    //     dispatch(PostchangeStatus("idle"));
    //     dispatch(emptypostphoto());
    //   }

    //   if (deletepostsatus === "failed") {
    //     toast.error(`${errorpost}`);
    //     dispatch(PostchangeStatus("idle"));
    //     dispatch(emptypostphoto());
    //   }

    //   // if (likestatus === "succeeded") {
    //   //   // if (poststatus !== "loading") {
    //   //   //   dispatch(getpostbyid({ postid: postlog, token }));
    //   //   // }
    //   //   dispatch(chagelikestatus("idle"));
    //   //   toast.dismiss();
    //   // }

    //   // if (likestatus === "failed") {
    //   //   if (poststatus !== "loading") {
    //   //     dispatch(getpostbyid({ postid: postlog, token }));
    //   //   }
    //   //   dispatch(chagelikestatus("idle"));
    //   // }

    //   if (unfollow_stats === "succeeded") {
    //     dispatch(getallpost({ userid }));
    //     set_isFollowing(false);
    //     dispatch(ProfilechangeStatus("idle"));
    //   }

    //   if (follow_stats === "succeeded") {
    //     dispatch(getallpost({ userid }));
    //     set_isFollowing(true);
    //     dispatch(ProfilechangeStatus("idle"));
    //   }
    // }, [
    //   allcommentstatus,
    //   deletepostsatus,
    //   likestatus,
    //   unfollow_stats,
    //   follow_stats,
    // ]);

    // useEffect(() => {
    //   if (alreadylike) setlikephoto(likedicon);
    //   else setlikephoto(like);
    // }, [alreadylike]);

    // // Optimized file loading with better error handling
    // const loadPostFile = useCallback(() => {
    //   if (posttype === "text") return null;

    //   if (posttype === "image") {
    //     return (
    //       <img
    //         onClick={() => setPreviewImage(file)}
    //         className="post-content"
    //         alt="post image"
    //         src={file}
    //         loading="lazy"
    //         onError={(e) => {
    //           e.target.onerror = null;
    //           e.target.src = DummyContentImage;
    //         }}
    //       />
    //     );
    //   }

    //   if (posttype === "video") {
    //     return (
    //       <video
    //         ref={videoRef}
    //         className="post-content"
    //         src={file}
    //         muted={isMuted}
    //         playsInline
    //         preload="metadata"
    //         onEnded={handleVideoEnd}
    //         onLoadStart={() => {
    //           setLoading(true);
    //           setNetworkLoading(true);
    //         }}
    //         onLoadedData={() => {
    //           setLoading(false);
    //           setIsVideoLoaded(true);
    //           setNetworkLoading(false);
    //         }}
    //         onError={() => {
    //           setVideoError(true);
    //           setLoading(false);
    //           setNetworkLoading(false);
    //         }}
    //         poster=""
    //       />
    //     );
    //   }
    // }, [posttype, file, isMuted, handleVideoEnd, setPreviewImage]);

    // // Optimized video controls
    // const toggleMute = useCallback(() => {
    //   const video = videoRef.current;
    //   if (!video) return;
    //   video.muted = !video.muted;
    //   setIsMuted(video.muted);
    // }, [setIsMuted]);

    // const togglePlayPause = useCallback(() => {
    //   const video = videoRef.current;
    //   if (!video) return;

    //   if (video.paused) {
    //     pauseAllVideos();
    //     video.play().catch((err) => {
    //       console.error("Video play failed:", err);
    //       setNetworkLoading(false);
    //     });
    //     setIsPlaying(true);
    //     setCurrentPlayingIndex(postlog);
    //   } else {
    //     video.pause();
    //     setIsPlaying(false);
    //     setNetworkLoading(false);
    //   }
    // }, [pauseAllVideos, setCurrentPlayingIndex, postlog]);

    // const forward10 = useCallback(() => {
    //   const video = videoRef.current;
    //   if (video) {
    //     video.currentTime = Math.min(video.currentTime + 10, video.duration);
    //   }
    // }, []);

    // const backward10 = useCallback(() => {
    //   const video = videoRef.current;
    //   if (video) {
    //     video.currentTime = Math.max(video.currentTime - 10, 0);
    //   }
    // }, []);

    // Optimized video interaction controls
    // const videoInteraction = useCallback(() => {
    //   if (posttype !== "video" || !showAction || videoError) return null;

    //   return (
    //     <div className="action-container">
    //       <div className="action" onClick={backward10}>
    //         <div className="span">10</div>
    //         <i className="bi bi-arrow-counterclockwise"></i>
    //       </div>
    //       <div className="action" onClick={togglePlayPause}>
    //         <i
    //           className={`bi ${
    //             isPlaying ? "bi-pause-circle" : "bi-play-circle"
    //           }`}
    //         ></i>
    //       </div>
    //       <div className="action" onClick={forward10}>
    //         <div className="span">10</div>
    //         <i className="bi bi-arrow-clockwise"></i>
    //       </div>
    //     </div>
    //   );
    // }, [
    //   posttype,
    //   showAction,
    //   videoError,
    //   isPlaying,
    //   backward10,
    //   togglePlayPause,
    //   forward10,
    // ]);

    // // Optimized video tap handler with proper timeout management
    // const handleVideoTap = useCallback(() => {
    //   setShowAction(true);

    //   // Clear existing timeout
    //   if (actionTimeoutRef.current) {
    //     clearTimeout(actionTimeoutRef.current);
    //   }

    //   // Set new timeout
    //   actionTimeoutRef.current = setTimeout(() => {
    //     setShowAction(false);
    //   }, 3000);
    // }, [setShowAction]);

    // // Cleanup timeout on unmount
    // useEffect(() => {
    //   return () => {
    //     if (actionTimeoutRef.current) {
    //       clearTimeout(actionTimeoutRef.current);
    //     }
    //     if (bufferingTimeoutRef.current) {
    //       clearTimeout(bufferingTimeoutRef.current);
    //     }
    //   };
    // }, []);

    // const deletepostbyid = useCallback(() => {
    //   if (deletepostsatus !== "loading") {
    //     toast.info("deleting post please wait a moment...", {
    //       autoClose: false,
    //     });
    //     dispatch(deletepost({ postid: postlog, token }));
    //   }
    // }, [deletepostsatus, postlog, token, dispatch]);

    // const checkmyLike = useCallback(() => {
    //   let mylike = likelist.find((value) => value.userid === userid);
    //   if (mylike) {
    //     setalreadylike(true);
    //     setlikephoto(likedicon);
    //   } else {
    //     setalreadylike(false);
    //     setlikephoto(like);
    //   }
    // }, [likelist, userid]);

    // const toggleComments = useCallback(() => {
    //   setShowComments(!showComments);
    //   if (!showComments) {
    //     dispatch(clearcomment());
    //     dispatch(getpostcomment({ token, postid: postlog }));
    //   }
    // }, [showComments, dispatch, token, postlog]);

    // const toggleopts = useCallback(() => {
    //   if (isOpen) {
    //     settrackOpens(false);
    //     setisOpen(trackopen);
    //     return;
    //   }
    //   setisOpen(true);
    //   settrackOpens(true);
    // }, [isOpen, trackopen, settrackOpens]);

    // useEffect(() => {
    //   if (isOpen) setisOpen(trackopen);
    // }, [trackopen, isOpen]);

    // const handleProfileClick = useCallback(() => {
    //   if (!isProfilePage) {
    //     dispatch(resetprofilebyid());
    //     navigate(`/profile/${postuserid}`);
    //   }
    // }, [isProfilePage, dispatch, navigate, postuserid]);

    // // Optimized like handler with immediate UI feedback
    // const handleLikeClick = useCallback(() => {
    //   // let like = alreadylike;
    //   setalreadylike((prev) => !prev);
    //   setDisplayLikes((prev) => (Number(likes) === prev ? prev + 1 : prev - 1));
    //   postmylike();
    // }, []);

    return (
      <>
        <li>
          {/* Video Post */}
          {posttype === "video" && (
            <div className="post">
              <div className="post-overlay"> {/* Overlay for video post: onClick={handleVideoTap} */}
                <div className="flex items-center justify-between">
                  <div className="authur">
                    <div
                      className="profilepic"
                      // {/*onClick={handleProfileClick}*/}
                      style={{ cursor: isProfilePage ? "default" : "pointer" }}
                    >
                      <img
                        alt="post"
                        src={postuser}
                        loading="lazy"
                        // onError={(e) => {
                        //   e.target.onerror = null;
                        //   e.target.src = DummyImage;
                        // }}
                      />
                    </div>
                    <div className="authur-info">
                      <div className="text-xs font-semibold text-slate-200 text-start">
                        {username}
                      </div>
                      <div className="text-xs text-slate-400 text-start">
                        {nickname}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: "30px", cursor: "pointer" }}
                    // onClick={toggleMute}
                  >
                    {isMuted ? (
                      <i className="bi bi-volume-mute"></i>
                    ) : (
                      <i className="bi bi-volume-up"></i>
                    )}
                  </div>
                </div>
                {/* {videoInteraction()} */}
                <div className="overflow-content">
                  <div className="activities-container">
                    {enableFollow() && (
                      <div>
                        <button
                          type="button"
                          className="activity bg-black/50 p-2 rounded-full"
                          // onClick={onFollowClick}
                          disabled={isLoading}
                        >
                          <img
                            alt="followIcon"
                            src={following == true ? followIcon : unfollowIcon}
                            className=""
                          />
                        </button>
                      </div>
                    )}
                    <div className="activity">
                      <button
                        className="activity bg-black/50 p-2 rounded-full"
                        // onClick={handleLikeClick}
                      >
                        <img alt="likeIcon" src={likephoto} />
                      </button>

                      <span>{displayLikes}</span>
                    </div>
                    <div className="activity"> {/*onClick={toggleComments}*/}
                      <button className="activity bg-black/50 p-2 rounded-full">
                        <img alt="comment" src={comment} />
                      </button>

                      <span>{displayComments}</span>
                    </div>
                    <div
                      className="activity bg-black/50 p-2 rounded-full"
                      // onClick={toggleopts}
                    >
                      <img alt="threedot" className="size-7" src={threeDots} />
                    </div>
                  </div>
                  <p className="w-full max-w-xs mx-2 mt-1 overflow-hidden text-sm text-white break-words whitespace-normal sm:max-w-sm md:max-w-full lg:max-w-auto lg:pr-4">
                    <span>{content}</span> <br /> Posted{" "}
                    <span>29/7/2025</span>
                  </p>
                </div>
              </div>
              {/* {loadPostFile()} */}

              {/* Show loading indicator for initial video loading */}
              {posttype === "video" && loading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    {/* <p className="text-white text-sm">Loading video...</p> */}
                  </div>
                </div>
              )}

              {/* Show loading indicator for network/buffering issues */}
              {posttype === "video" &&
                networkLoading &&
                !loading &&
                !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="flex flex-col items-center rounded-lg p-4 ">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mb-2"></div>
                      {/* <p className="text-white text-xs">Buffering...</p> */}
                    </div>
                  </div>
                )}

              {/* Show error state for videos */}
              {posttype === "video" && videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <i className="bi bi-exclamation-triangle text-2xl mb-2"></i>
                    <p>Video failed to load. Check internet connection</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Post - Optimized */}
          {posttype === "image" && (
            <div className="bg-gray-800 post image-post">
              <div className="authur">
                <div
                  className="profilepic"
                  // onClick={handleProfileClick}
                  style={{ cursor: isProfilePage ? "default" : "pointer" }}
                >
                  <img
                    alt="post"
                    src={postuser}
                    loading="lazy"
                    // onError={(e) => {
                    //   e.target.onerror = null;
                    //   e.target.src = DummyImage;
                    // }}
                  />
                </div>
                <div className="authur-info">
                  <div className="text-xs font-semibold text-slate-200 text-start">
                    {username}
                  </div>
                  <div className="text-xs text-slate-400 text-start">
                    {nickname}
                  </div>
                </div>
              </div>
              <p className="w-full max-w-xs mx-2 mt-1 overflow-hidden text-sm text-white break-words whitespace-normal sm:max-w-sm md:max-w-full lg:max-w-auto lg:pr-4">
                <span>{content}</span> <br /> Posted{" "}
                <span>29/07/2025</span>
              </p>
              {/* <div className="post-image">{loadPostFile()}</div> */}
              <div className="activities">
                {enableFollow() && (
                  <button
                    type="button"
                    className="activity"
                    // onClick={onFollowClick}
                    disabled={isLoading}
                  >
                    <img
                      alt="followIcon"
                      src={following ? followIcon : unfollowIcon}
                      className=""
                    />
                  </button>
                )}
                <div className="activity">{/*onClick={handleLikeClick}*/}
                  <button className="flex"></button>
                  <img alt="likeIcon" src={likephoto}></img>
                  <span>{displayLikes}</span>
                </div>
                <div className="activity">{/*onClick={toggleComments}*/}
                  <img alt="comment" src={comment} />
                  <span>{displayComments}</span>
                </div>
                <div className="activity">{/*onClick={toggleopts}*/}
                  <img alt="threedot" className="size-7" src={threeDots} />
                </div>
              </div>
            </div>
          )}

          {/* Text Post - Optimized */}
          {posttype === "text" && (
            <div className="bg-gray-800 post text-post">
              <div className="authur">
                <div
                  className="profilepic"
                  // onClick={handleProfileClick}
                  style={{ cursor: isProfilePage ? "default" : "pointer" }}
                >
                  <img
                    alt="post"
                    src={postuser}
                    loading="lazy"
                    // onError={(e) => {
                    //   e.target.onerror = null;
                    //   e.target.src = DummyImage;
                    // }}
                  />
                </div>
                <div className="authur-info">
                  <div className="text-xs font-semibold text-slate-200 text-start">
                    {username}
                  </div>
                  <div className="text-xs text-slate-400 text-start">
                    {nickname}
                  </div>
                </div>
              </div>
              Posted <span>29/07/2025</span>
              <div className="text-post-content">
                <div className="content">
                  <p>
                    <span>{content}</span>
                  </p>
                </div>
              </div>
              <div className="activities">
                {enableFollow() && (
                  <button
                    type="button"
                    className="activity"
                    // onClick={onFollowClick}
                    disabled={isLoading}
                  >
                    <img
                      alt="followIcon"
                      src={following ? followIcon : unfollowIcon}
                      className=""
                    />
                  </button>
                )}
                <div className="activity"> {/**onClick={handleLikeClick} */}
                  <button className="flex"></button>
                  <img alt="likeIcon" src={likephoto}></img>
                  <span>{displayLikes}</span>
                </div>
                <div className="activity"> {/**onClick={toggleComments} */}
                  <img alt="comment" src={comment} />
                  <span>{displayComments}</span>
                </div>
                <div className="activity"> {/**onClick={toggleopts} */}
                  <img alt="threedot" className="size-7" src={threeDots} />
                </div>
              </div>
            </div>
          )}

          {/* Options Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center"
                onClick={() => setisOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-80 max-w-sm mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  onClick={(e) => e.stopPropagation()}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  <div className="py-2">
                    {/* Block User Option */}
                    {enableFollow() && (
                      <motion.button
                        className="flex items-center w-full px-6 py-4 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group"
                        role="menuitem"
                        onClick={() => {
                          setisOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                          <i className="bi bi-person-slash text-xl text-red-600 dark:text-red-400"></i>
                        </div>
                        <div className="flex flex-col items-start flex-1">
                          <span className="font-semibold text-base">
                            Block User
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            You won't see posts from {username}
                          </span>
                        </div>
                      </motion.button>
                    )}

                    {/* Separator */}
                    {/* {enableFollow() && enableDelete() && (
                      <div className="border-t border-gray-200 dark:border-gray-600 mx-6"></div>
                    )} */}

                    {/* Delete Post Option */}
                    {
                     enableDelete && (
                      <motion.button
                        className="flex items-center w-full px-6 py-4 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group"
                        role="menuitem"
                        // onClick={() => {
                        //   deletepostbyid();
                        //   setisOpen(false);
                        // }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                          <i className="bi bi-trash text-xl text-red-600 dark:text-red-400"></i>
                        </div>
                        <div className="flex flex-col items-start flex-1">
                          <span className="font-semibold text-base">
                            Delete Post
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This action cannot be undone
                          </span>
                        </div>
                      </motion.button>
                    )}

                    {/* Action Buttons */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-2 bg-gray-400 dark:bg-gray-750 ">
                      <div className="flex gap-3">
                        {/* Cancel Button */}
                        <motion.button
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-lg transition-colors duration-150"
                          onClick={() => setisOpen(false)}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>

                        {/* Block User Button */}
                        {enableFollow() && (
                          <motion.button
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-700 hover:bg-orange-700 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
                            onClick={() => {
                              setisOpen(false);
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <i className="bi bi-person-slash text-sm"></i>
                            Block
                          </motion.button>
                        )}

                        {/* Delete Post Button */}
                        {enableDelete && (
                          <motion.button
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-700 hover:bg-red-700 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
                            // onClick={() => {
                            //   // deletepostbyid();
                            //   setisOpen(false);
                            // }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <i className="bi bi-trash text-sm"></i>
                            Delete
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Image Preview Modal */}
          <AnimatePresence>
            {previewImage && (
              <motion.div
                key="image-modal"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                onClick={() => setPreviewImage(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.img
                  src={previewImage}
                  className="object-contain max-w-full max-h-full rounded"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment Section */}
          {showComments && (
            <div className="comment-con">
              <div
                className="activities-container"
                style={{ color: "#fff", fontSize: 20 }}
              >
                <i className="bi bi-x-octagon" ></i> {/*onClick={toggleComments}*/}
              </div>
              <Commmentpage
                userphoto={userphoto}
                username={username}
                postid={postlog}
                comments={displayLikes}
                content={content}
                file={file}
                type={posttype}
                likes={6}
                posttime="13:40:09"
              />
            </div>
          )}
        </li>
      </>
    );
  }
);
