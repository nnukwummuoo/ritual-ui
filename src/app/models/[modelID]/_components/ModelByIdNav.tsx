"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";

import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";

import {
  follow,
  unfollow,
  ProfilechangeStatus,
} from "@/store/profile";
import { updateFollowers } from "@/store/modelSlice";
import { useAuth } from '@/lib/context/auth-context';
import { useUserId } from "@/lib/hooks/useUserId";

type Props = {
  modelName: string;
  views: number;
  followingUser: boolean;
  id: string | undefined;
  modelid: string | undefined;
};

const ModelByIdNav = ({ modelName, views, followingUser, id,modelid }: Props) => {
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const { postuserid, modelID } = useParams<{ postuserid?: string; modelID?: string }>();

  const follow_stats = useSelector((state: any) => state.profile.follow_stats);
  const unfollow_stats = useSelector((state: any) => state.profile.unfollow_stats);
  const userid = useUserId();
  const token = useSelector((state: any) => state.register.refreshtoken);
  const profile = useSelector((state: any) => state.comprofile.profile);

  const [isfollwed, setisfollowed] = useState(false);
  const [disabledButton, setdisableButton] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user: any = useAuth();

  useEffect(() => {
    setIsFollowing(followingUser);
  }, [followingUser]);

  useEffect(() => {
    if (userid) {
      if (profile.following) {
        setisfollowed(true);
      }

      if (!userid || userid === profile.userid) {
        setdisableButton(true);
      } else {
        setdisableButton(false);
      }
    }
  }, [userid, profile]);

  const onFollowClick = async () => {
    try {
      setIsFollowing((prev) => !prev);
      setIsLoading(true);
      await dispatch(
        updateFollowers({
          userId: id||userid,
          id: modelid,
          action: "update",
          token: user?.refreshtoken || "",
        })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between w-full mx-auto text-white bg-black bg-opacity-80 md:mr-auto md:ml-0">
      <div onClick={() => router.back()} className="cursor-pointer">
        <IoArrowBack className="w-5 h-5" />
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="leading-none text-right">
          <p className="mb-0 font-semibold">{modelName}</p>
          <p className="mt-0 text-xs font-semibold text-gray-400">
            {views} Views
          </p>
        </div>

        <button
          className="flex flex-row items-center space-x-1 bg-orange-500 px-2 py-1 rounded-lg justify-center"
          onClick={onFollowClick}
          disabled={isLoading || disabledButton}
        >
          <Image
            src={isFollowing ? StarIcon2 : StarIcon}
            alt="rating"
            width={18}
            height={18}
          />
          {!isFollowing && <p>Follow</p>}
        </button>
      </div>
    </div>
  );
};

export default ModelByIdNav;
