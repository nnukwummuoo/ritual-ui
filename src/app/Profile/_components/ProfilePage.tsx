"use client"
import React, { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Tabs from "./Tabs";
import DropdownMenu from "./DropDonMenu";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";
// import backIcon from "../icons/backIcon.svg";
// import StarIcon from "../icons/transparentstar.svg";
// import StarIcon2 from "../icons/star.svg";
// import { Postlist } from "../_components/Postlist";
// import messageIcon from "../icons/messageIcon.png";
// import { Exclusive } from "../_components/exclusive"
// import { Info } from "../_components/info";
// import Empty from "../icons/empty.svg";
// import DummyCoverImage from "../icons/mmekoDummy.png";
// import D from "../icons/icons8-profile_Icon.png";
// import MessagePics from "../icons/icons8-message.png";
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
  const dispatch = useDispatch<AppDispatch>();
  const {
    status,
    firstname,
    lastname,
    nickname,
    State: location,
    country,
    active,
  } = useSelector((s: RootState) => s.profile);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  const joined = React.useMemo(() => {
    if (!createdAt) return { month: "", year: "" };
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return { month: "", year: "" };
    return { month: Months[d.getMonth()] ?? "", year: String(d.getFullYear()) };
  }, [createdAt]);
  const [isbuying, setisbuying] = useState(false);
  const [gender, setgender] = useState("");
  const [about, setabout] = useState("");
  // const navigate = useNavigate();
  // const getprofilebyidstats = useSelector(
  //   (state) => state.comprofile.getprofileidstatus
  // );
  // const profile = useSelector((state) => state.comprofile.profile);
  // const follow_stats = useSelector((state) => state.profile.follow_stats);
  // const unfollow_stats = useSelector((state) => state.profile.unfollow_stats);
  // const dispatch = useDispatch();
  // const userid = useSelector((state) => state.register.userID);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const { postuserid } = useParams();
  const formatter = new Intl.NumberFormat("en-US");

  // const [userphoto, setuserphoto] = useState(person);
  // const [disablehost, setdisable] = useState(false);
  // const [exclusive_verify, set_exclusive_verify] = useState(false);
  // const [disabledButton, setdisableButton] = useState(false);
  // const [followimg, setfollowimg] = useState(StarIcon);
  // const [isfollwed, setisfollowed] = useState(false);
  // const [modelid, setmodelid] = useState([]);
  // const [click, setclick] = useState(true);
  // const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  // const [isMuted, setIsMuted] = useState(true);
  // const [showAction, setShowAction] = useState(true);
  // const [isFollowing, setisFollowing] = useState(false);

  // let timeoutId = null;

  useEffect(() => {
    const userid = (params as any)?.userid as string | undefined;
    if (!userid) return;
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
    // eslint-disable-next-line no-console
    console.log("[ProfilePage] dispatch getprofile", {
      userid,
      hasToken: Boolean(token),
      tokenSource: tokenFromRegister ? "redux" : tokenFromRedux ? "window" : "localStorage/missing",
    });
    dispatch(getprofile({ userid, token } as any));
  }, [params, dispatch]);

  // useEffect(() => {
  //   if (getprofilebyidstats === "succeeded") {
  //     setusername(profile.username);
  //     setgender(profile.gender);
  //     setlocation(profile.location);
  //     setabout(profile.aboutuser);
  //     setactive(profile.active);
  //     setfirstname(profile.firstname);
  //     setlastname(profile.lastname);
  //     setnickname(profile.nickname);
  //     set_exclusive_verify(profile.exclusive);
  //     setisFollowing(() => {
  //       if (profile.followers.includes(userid)) {
  //         return true;
  //       }
  //       return false;
  //     });
  //     month = Months[Number(profile.joined_month)];
  //     year = profile.joined_year;
  //     likes = profile.likecount;
  //     followers = profile.followers.length;
  //     if (profile."/icons/icons8-profile_Icon.png") {
  //       setuserphoto(profile."/icons/icons8-profile_Icon.png");
  //     } else {
  //       setuserphoto(person);
  //     }

  //     cantfandc();

  //     dispatch(comprofilechangeStatus("idle"));
  //   }

  //   if (getprofilebyidstats === "failed") {
  //     dispatch(comprofilechangeStatus("idle"));
  //   }
  // }, [getprofilebyidstats, userid, postuserid]);

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

  // const cantfandc = () => {
  //   if (userid && postuserid) {
  //     setmodelid([postuserid, userid]);
  //   }

  //   if (userid && profile) {
  //     if (profile.following) {
  //       setisfollowed(true);
  //       setfollowimg(StarIcon2);
  //       follow_text = "";
  //     }

  //     if (!userid) {
  //       setdisableButton(true);
  //     } else if (userid === profile.userid) {
  //       setdisableButton(true);
  //     } else {
  //       setdisableButton(false);
  //     }
  //   }
  // };

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
  // const onFollowClick = async () => {
  //   try {
  //     setisFollowing((prev) => !prev);
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
  //     // setIsLoading(false);
  //   }
  // };

  return (
    <div
      className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12"
      style={{ overflowY: "scroll" }}
    >
      <div
        className="w-full mx-auto mt-10 text-white md:mr-auto md:ml-0"
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
            <div className="w-full text-center text-red-400">Failed to load profile. Please check your connection and try again.</div>
          )}
          {status === "succeeded" && (
            <div className="flex flex-col">
              <div className="relative w-full bg-red-300 h-52">
                <img
                  alt="background img"
                  src={"/icons/profile.png"}
                  className="object-cover w-full h-full"
                  // onError={(e) => {
                  //   e.target.onerror = null;
                  //   e.target.src = DummyCoverImage;
                  // }}
                />
                <div className="absolute top-0 w-full px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <img
                        src={"/icons/profile.png"}
                        className="w-5 h-5"
                        alt="rating"
                        // onClick={() => navigate(-1)}
                      />
                    </div>
                    <DropdownMenu />
                  </div>
                </div>
                <div className="absolute w-full px-2 top-3/4">
                  <div className="flex items-start justify-between">
                    <div>
                      <img
                        alt="profile picture"
                        src={"/icons/profile.png"}
                        className="object-cover w-32 h-32 border-4 border-orange-300 rounded-full"
                        // onError={(e) => {
                        //   e.target.onerror = null;
                        //   e.target.src = D;
                        // }}
                      />
                    </div>
                    {/* {postuserid !== userid ? (
                      <div className="flex flex-row items-center gap-2 mt-14">
                        <div className="flex flex-row rounded-lg">
                          <button
                            className="p-0 px-2 rounded-lg"
                            disabled={disabledButton}
                            onClick={() =>
                              navigate(`/message/${modelid.toString()}`)
                            }
                          >
                            <img
                              src={MessagePics}
                              className="w-7 h-7"
                              alt="rating"
                            />
                          </button>
                        </div>
                        <button
                          onClick={onFollowClick}
                          className="flex gap-x-1 items-center flex-row p-1.5 bg-orange-500 rounded-lg"
                        >
                          <img
                            src={isFollowing ? StarIcon2 : StarIcon}
                            className="size-5"
                            alt="rating"
                          />

                          {isFollowing ? null : "Follow"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 flex items-center justify-center gap-x-1 bg-orange-500 text-center text-sm rounded-lg mt-16"
                        onClick={() => navigate("/editprofile")}
                      >
                        <BiPencil />
                        Edit Profile
                      </button>
                    )} */}
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-20 ml-4">
                  <p className="pt-2 text-lg font-bold text-slate-200">
                    {firstname} {lastname}
                  </p>
                  <p className="text-slate-400">{nickname}</p>
                  <div className="flex gap-2">
                    <p className="font-bold text-slate-400">
                      {formatter.format(Number(likes))}{" "}
                      <span className="font-thin">likes</span>
                    </p>
                    <p className="font-bold text-slate-400">
                      {followers} <span className="font-thin">fans</span>
                    </p>
                  </div>
                  <p className="font-bold text-white">{about}</p>
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
                  <div className="flex gap-2 mt-3">
                    <img
                      src={"/icons/locationIcon.svg"}
                      className="w-5 h-5"
                      alt="location"
                    />
                    <p className="text-slate-500">{location}</p>
                  </div>
                  <div className="flex gap-2">
                    <img
                      src={"/icons/calendar.svg"}
                      className="w-5 h-5"
                      alt="joined date"
                    />
                    <p className="text-slate-500">
                      Joined {joined.month}{joined.month && joined.year ? ", " : ""}{joined.year}
                    </p>
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
              label: "Posts",
              content: (
                <div className="flex justify-center py-4 my-4 mb-10">
                  <p className="text-sm text-slate-50">No posts yet</p>
                </div>
              ),
            },
            {
              label: "Exclusive",
              content: (
                <div className="flex justify-center py-4 my-4 mb-10">
                  <p className="text-sm text-slate-50">No exclusive content yet</p>
                </div>
              ),
            },
            {
              label: "Info",
              content: (
                <div className="space-y-2 text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-200">Name:</span> {firstname} {lastname}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Nickname:</span> {nickname}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Location:</span> {location}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Joined:</span> {month}, {year}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
