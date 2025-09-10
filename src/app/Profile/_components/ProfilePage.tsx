"use client"
import React, { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Tabs from "./Tabs";
import DropdownMenu from "./DropDonMenu";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile, follow, unfollow, getfollow } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";
import { BiPencil } from "react-icons/bi";
import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";
import MessagePics from "@/icons/icons8-message.png";
import Image from "next/image";

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

  const {
    status,
    firstname,
    lastname,
    nickname,
    photourl,
    headerurl,
    State: location,
    error,
  } = useSelector((s: RootState) => s.profile);
  const getfollow_data = useSelector((s: RootState) => s.profile.getfollow_data as any);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  const loggedInUserId = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const viewingUserId = (params as any)?.userid as string;
  const isSelf = Boolean(loggedInUserId && viewingUserId && loggedInUserId === viewingUserId);

  const isFollowing = React.useMemo(() => {
    if (!getfollow_data || !getfollow_data.following) return false;
    return getfollow_data.following.some((user: any) => user.id === viewingUserId);
  }, [getfollow_data, viewingUserId]);

  const joined = React.useMemo(() => {
    if (!createdAt) return { month: "", year: "" };
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return { month: "", year: "" };
    return { month: Months[d.getMonth()] ?? "", year: String(d.getFullYear()) };
  }, [createdAt]);

  useEffect(() => {
    if (viewingUserId) {
      dispatch(getprofile({ userid: viewingUserId, token } as any));
      dispatch(getfollow({ userid: viewingUserId, token } as any));
    }
  }, [viewingUserId, token, dispatch]);

  const onFollowClick = async () => {
    if (isFollowing) {
      dispatch(unfollow({ userid: viewingUserId, token }));
    } else {
      dispatch(follow({ userid: viewingUserId, token }));
    }
  };

  return (
    <div
      className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12"
      style={{ overflowY: "scroll" }}
    >
      <div
        className="w-full mx-auto mt-10 text-white md:mr-auto md:ml-0"
      >
        <div className="pb-6">
          {(status === "loading" || status === "idle") && (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <div className="w-full max-w-sm p-4 mx-auto space-y-4 text-white rounded-lg shadow-md">
                <div className="w-full h-36">
                  <Skeleton width={"100%"} height={"100%"} />
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
                  <Skeleton width={"80%"} height={15} className="rounded-md" />
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
              <div className="relative w-full bg-red-300 h-52">
                <img
                  alt="background img"
                  src={headerurl || "/icons/profile.png"}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-0 w-full px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <img
                        src={"/icons/profile.png"}
                        className="w-5 h-5"
                        alt="rating"
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
                        src={photourl || "/icons/profile.png"}
                        className="object-cover w-32 h-32 border-4 border-orange-300 rounded-full"
                      />
                    </div>
                    {viewingUserId !== loggedInUserId ? (
                      <div className="flex flex-row items-center gap-2 mt-14">
                        <div className="flex flex-row rounded-lg">
                          <button
                            className="p-0 px-2 rounded-lg"
                            onClick={() =>
                              router.push(`/message/${viewingUserId}`)
                            }
                          >
                            <Image
                              src={MessagePics}
                              className="w-7 h-7"
                              alt="rating"
                            />
                          </button>
                        </div>
                        <button
                          onClick={onFollowClick}
                          className="flex gap-x-1 items-center flex-row p-1.5 bg-gradient-to-r !from-blue-500 !to-purple-600 rounded-lg"
                        >
                          <img
                            src={isFollowing ? StarIcon2.src : StarIcon.src}
                            className="size-5"
                            alt="rating"
                          />

                          {isFollowing ? null : "Follow"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 flex items-center justify-center gap-x-1 bg-gradient-to-r !from-blue-500 !to-purple-600 text-center text-sm rounded-lg mt-16"
                        onClick={() => router.push("/editprofile")}
                      >
                        <BiPencil />
                        Edit Profile
                      </button>
                    )}
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
                      {getfollow_data?.following?.length || 0} <span className="font-thin">likes</span>
                    </p>
                    <p className="font-bold text-slate-400">
                      {getfollow_data?.followers?.length || 0} <span className="font-thin">fans</span>
                    </p>
                  </div>
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
                    <span className="font-semibold text-slate-200">Joined:</span> {joined.month}, {joined.year}
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
