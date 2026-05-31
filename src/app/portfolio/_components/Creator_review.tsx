/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getImageSource } from "@/lib/imageUtils";

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
  ratingType?: string; // 'fan-to-creator' or 'creator-to-creator'
  fanName?: string;
  fanPhoto?: string;
  creatorName?: string;
  creatorPhoto?: string;
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
  ratingType,
  fanName,
  fanPhoto,
  creatorName,
  creatorPhoto,
}) => {
  const date1 = new Date(parseInt(posttime));
  const date = format(date1, "MM/dd/yyyy 'at' h:mm a");

  const [image, setImage] = useState<string | StaticImageData>(personIcon);
  const [imageError, setImageError] = useState(false);
  
  // Determine the reviewer's name and photo based on rating type
  const getReviewerInfo = () => {
    if (ratingType === 'creator-to-creator') {
      // For creator-to-creator ratings, use creatorName and creatorPhoto
      return {
        name: creatorName || name,
        photo: creatorPhoto || photolink
      };
    } else {
      // For fan-to-creator ratings, use fanName and fanPhoto
      return {
        name: fanName || name,
        photo: fanPhoto || photolink
      };
    }
  };
  
  const reviewerInfo = getReviewerInfo();
  const myID = useSelector((state: any) => state.register.userID);
  const review_delete_stats = useSelector(
    (state: RootState) => state.creator.review_delete_stats
  );
  const token = useSelector((state: any) => state.register.refreshtoken);
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");

  // Generate user initials from name
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
    } else {
      return names[0].charAt(0).toUpperCase();
    }
  };

  // Generate random background color for user initials
  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    
    // Use name to generate consistent color for same user
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    const photoToUse = reviewerInfo.photo;
    if (photoToUse) {
      setImage(photoToUse);
      setImageError(false); // Reset error state when new image is set
    }
  }, [reviewerInfo.photo]);

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
        <div className="relative w-5 h-5 rounded-full overflow-hidden mt-3 bg-gray-600 flex items-center justify-center">
          {(() => {
            const profileImage = typeof image === "string" ? image : personIcon;
            const hasValidImage = profileImage && 
              profileImage !== personIcon && 
              profileImage.trim() !== "" && 
              profileImage !== "null" && 
              profileImage !== "undefined" && 
              !imageError;
            
            if (hasValidImage) {
              const imageSource = getImageSource(profileImage, 'profile');
              return (
                <Image
                  alt="clientIcon"
                  src={imageSource.src}
                  className="w-full h-full object-cover"
                  width={20}
                  height={20}
                  onError={() => {
                    setImageError(true);
                  }}
                />
              );
            }
            
            return (
              <div className={`w-full h-full flex items-center justify-center text-white text-xs font-semibold ${getRandomColor(reviewerInfo.name)}`}>
                {getUserInitials(reviewerInfo.name)}
              </div>
            );
          })()}
        </div>

        {/* Content */}
        <div className="flex flex-col ml-2 bg-white p-2 rounded-md border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-black text-sm">{reviewerInfo.name}</p>
            {ratingType === 'creator-to-creator' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Creator
              </span>
            )}
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
