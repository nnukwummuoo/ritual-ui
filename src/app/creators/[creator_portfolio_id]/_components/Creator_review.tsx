"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import personIcon from "@/icons/person.svg";
import deleteIcon from "@/icons/deleteicon.svg";
import { useSelector, useDispatch } from "react-redux";
import RingLoader from "react-spinners/RingLoader";
import { deletereview, changecreatorstatus } from "@/store/creatorSlice";
import { format } from "date-fns";
import type { RootState, AppDispatch } from "@/store/store";
import PacmanLoader from "react-spinners/RingLoader";

interface CreatorReviewProps {
  name: string;
  photolink: string | StaticImageData;
  content: string;
  id: string;
  userid: string;
  posttime: string;
  rating?: number;
  hostType?: string;
  requestId?: string;
}

export const CreatorReview: React.FC<CreatorReviewProps> = ({
  name,
  photolink,
  content,
  id,
  userid,
  posttime,
  rating,
  hostType,
  requestId,
}) => {
  const date1 = new Date(parseInt(posttime));
  const date = format(date1, "MM/dd/yyyy 'at' h:mm a");

  const [image, setImage] = useState<string | StaticImageData>(personIcon);
  const myID = useSelector((state: any) => state.register.userID);
  const review_delete_stats = useSelector(
    (state: RootState) => state.creator.review_delete_stats
  );
  const token = useSelector((state: any) => state.register.refreshtoken);
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");

  useEffect(() => {
    if (photolink) {
      setImage(photolink);
    }
  }, [photolink]);

  useEffect(() => {
    if (review_delete_stats === "succeeded" || review_delete_stats === "failed") {
      setLoading(false);
      dispatch(changecreatorstatus("idle"));
    }
  }, [review_delete_stats, dispatch]);

  const showDelete = () => myID === userid;

  const deleteMyReview = () => {
    if (review_delete_stats !== "loading") {
      setLoading(true);
      dispatch(deletereview({ token, id }));
    }
  };

  return (
    <div className="flex mb-2 flex-col">
      <div className="flex mb-1">
        {/* Avatar */}
        <Image
          alt="clientIcon"
          src={typeof image === "string" ? image : personIcon}
          className="rounded-full w-5 h-5 object-cover mt-3"
          width={20}
          height={20}
        />

        {/* Content */}
        <div className="flex flex-col ml-2 bg-white p-2 rounded-md border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-black text-sm">{name}</p>
            {rating && (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= rating ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
          {hostType && (
            <p className="text-xs text-blue-600 mb-1">{hostType} Experience</p>
          )}
          <p className="text-xs text-black">{content}</p>
        </div>

        {/* Delete button */}
        {showDelete() && (
          <button onClick={deleteMyReview}>
            <Image alt="deleteIcon" src={deleteIcon} width={20} height={20} />
          </button>
        )}

        {/* Loader */}
        {loading && (
          <div className="flex flex-col justify-center mb-3">
            <RingLoader
              color={color}
              loading={loading}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="text-xs text-black">Deleting... wait</p>
          </div>
        )}
      </div>
    </div>
  );
};
