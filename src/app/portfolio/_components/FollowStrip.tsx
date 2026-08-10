"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/lib/context/auth-context";
import { useUserId } from "@/lib/hooks/useUserId";
import { follow, unfollow, getfollow } from "@/store/profile";
import { toast } from "material-react-toastify";

interface FollowStripProps {
  creatorName: string;
  creatorId: string;
  creatorUserId: string;
  followingUser: boolean;
  checkuser: boolean;
}

const FollowStrip: React.FC<FollowStripProps> = ({
  creatorName,
  creatorId,
  creatorUserId,
  followingUser,
  checkuser,
}) => {
  const dispatch = useDispatch<any>();
  const userid = useUserId();
  const reduxToken = useSelector((state: any) => state.register.accessToken);
  const [localToken, setLocalToken] = React.useState("");
  const [isFollowing, setIsFollowing] = useState(followingUser);
  const [isProcessing, setIsProcessing] = useState(false);

  const token = reduxToken || localToken;

  // Get follow data from Redux
  const getfollow_data = useSelector(
    (state: any) => state.profile.getfollow_data,
  );
  const followingList = useSelector(
    (state: any) => {
      interface FollowData {
        following?: Array<{ id: string }>;
      }
      const followingData = state.profile.getfollow_data as FollowData;
      return followingData?.following?.map((u: any) => u.id) || [];
    },
    (left: any, right: any) => {
      if (left.length !== right.length) return false;
      return left.every((id: any, index: number) => id === right[index]);
    },
  );

  // Load token from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (!reduxToken && (data?.accesstoken || data?.refreshtoken)) {
            setLocalToken(data.accesstoken || data.refreshtoken);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [reduxToken]);

  // Check if following based on followingList
  useEffect(() => {
    if (userid && creatorUserId && creatorUserId !== userid) {
      const isInList = followingList.includes(
        Array.isArray(creatorUserId)
          ? creatorUserId.join(",")
          : String(creatorUserId),
      );
      setIsFollowing(isInList);
    }
  }, [followingList, userid, creatorUserId]);

 const handleFollowClick = async () => {
    if (checkuser) {
      toast.info("This action is meant for fans");
      return;
    }
    if (!userid || !creatorUserId || isProcessing) {
      return;
    }
    

    let authToken = token;
    if (!authToken) {
      try {
        const loginData = localStorage.getItem("login");
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.accesstoken || parsedData.refreshtoken;
        }
      } catch (error) {
        // Silent fail
      }
    }

    if (!authToken) {
      alert("Please log in to follow/unfollow creators");
      return;
    }

    setIsProcessing(true);

    try {
      if (isFollowing) {
        try {
          await dispatch(
            unfollow({
              userid: Array.isArray(creatorUserId)
                ? creatorUserId.join(",")
                : creatorUserId,
              followerid: userid,
              token: authToken,
            }),
          ).unwrap();

          setIsFollowing(false);
          toast.success("Unfollowed successfully!");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not following")) {
            setIsFollowing(false);
          } else {
            throw error;
          }
        }
      } else {
        try {
          await dispatch(
            follow({
              userid: Array.isArray(creatorUserId)
                ? creatorUserId.join(",")
                : creatorUserId,
              followerid: userid,
              token: authToken,
            }),
          ).unwrap();

          setIsFollowing(true);
          toast.success("Followed successfully!");
        } catch (error: unknown) {
          let errorMessage = "";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "object" && error !== null) {
            const errorObj = error as Record<string, unknown>;
            const messageValue =
              errorObj.message ||
              (
                (errorObj.response as Record<string, unknown>)?.data as Record<
                  string,
                  unknown
                >
              )?.message;
            errorMessage =
              typeof messageValue === "string"
                ? messageValue
                : JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }

          if (errorMessage.includes("already followed")) {
            setIsFollowing(true);
            setTimeout(() => {
              setIsFollowing(true);
            }, 100);
          } else {
            setIsFollowing(true);
          }
        }
      }

      // Refresh following list
      dispatch(getfollow({ userid: String(userid), token: authToken }));
    } catch (error: unknown) {
      let errorMessage = "";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const errorObj = error as Record<string, unknown>;
        const messageValue =
          errorObj.message ||
          (
            (errorObj.response as Record<string, unknown>)?.data as Record<
              string,
              unknown
            >
          )?.message;
        errorMessage =
          typeof messageValue === "string"
            ? messageValue
            : JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }

      if (!isFollowing || errorMessage.includes("already followed")) {
        setIsFollowing(true);
      } else if (errorMessage.includes("not following")) {
        setIsFollowing(false);
      } else {
        alert(
          "Failed to " +
            (isFollowing ? "unfollow" : "follow") +
            ". Please try again.",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };


  return (
  <div className="mb-6 px-4 py-3 rounded-lg border border-purple-400 flex items-center justify-between gap-3">
    <div className="flex-1">
      {checkuser ? (
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Fans can follow you to be notified when you&apos;re available.
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          <strong className="text-gray-100 text-xs lg:text-sm">Like what you see?</strong> Follow{" "}
          {creatorName.split(" ")[0]} to get notified when she&apos;s available.
        </p>
      )}
    </div>
   <button
      onClick={handleFollowClick}
      disabled={isProcessing}
      className={`flex-shrink-0 px-3  py-2 rounded-lg font-semibold text-[12px] lg:text-sm whitespace-nowrap transition-all duration-200 ${
        isFollowing
          ? "bg-purple-400/20 border border-purple-400/40 text-purple-200 hover:bg-purple-400/30"
          : "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600"
      } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
    >
    
      {isProcessing ? "..." : isFollowing ? "Following ✓" : "Follow"}
    </button>
  </div>
);
};

export default FollowStrip;
