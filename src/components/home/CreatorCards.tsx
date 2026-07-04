/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyCreator } from "@/api/creator";
import { useAuth } from "@/lib/context/auth-context";
import { getImageSource } from "@/lib/imageUtils";
import VIPBadge from "@/components/VIPBadge";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { BadgeCheck } from "lucide-react";

interface CreatorCardProps {
  photolink: string;
  hosttype: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  amount: number;
  creator_portfolio_id: string;
  userid: string;
  createdAt: string;
  hostid: string;
  isVip: boolean;
  vipEndDate: string | null;
  views: number;
  isOnline: boolean;
  isFollowing: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  photolink,
  hosttype,
  name,
  age,
  gender,
  location,
  amount,
  creator_portfolio_id,
  userid,
  isVip,
  vipEndDate,
  isOnline,
  isFollowing,
  views
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    // Use the same ID mapping as the creators page
    if (creator_portfolio_id) {
      router.push(`/creators/${creator_portfolio_id}`);
    } else {
      console.error('No creator_portfolio_id available for navigation');
    }
  };

  // Get first name only
  const firstName = name.split(' ')[0];

  return (
    <div
      className="relative bg-[#111624] rounded-lg w-48 flex-shrink-0 cursor-pointer hover:bg-gray-750 transition-colors overflow-hidden flex flex-col"
      onClick={handleCardClick}
    >
      {/* Close button */}
      {/* <button
        className="absolute top-2 right-2 text-white/80 hover:text-white z-20 bg-black/20 rounded-full p-1 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Implement dismiss functionality
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button> */}

      {/* Profile Image - Large Portrait Style */}
      <div className="relative w-full h-64 bg-gray-700">
        {photolink && photolink !== "/images/default-placeholder.png" ? (
          <img
            src={getImageSource(photolink, 'profile').src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const nextElement = target.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.setProperty('display', 'flex');
              }
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-semibold bg-gray-600" style={{ display: photolink && photolink !== "/images/default-placeholder.png" ? 'none' : 'flex' }}>
          {firstName.charAt(0).toUpperCase()}
        </div>

        {/* VIP Badge */}
        {isVip && (
          <div className="absolute top-2 left-12 z-10">
            <VIPBadge size="xl" isVip={isVip} vipEndDate={vipEndDate} />
          </div>
        )}

        {/* Online Status */}
        {isOnline && (
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
        )}
      </div>

      {/* Creator Info */}
      {/*<div className="p-3 text-center flex flex-col gap-3">
        <h3 className="font-semibold text-white flex text-center gap-3 items-center justify-center text-lg tracking-wide">{firstName}<span> <BadgeCheck size={17} fill="white" className="text-black" /> </span></h3>


        View Profile Button
        <button
          onClick={handleCardClick}
          className="w-full py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 shadow-md"
        >
          Request
        </button>
      </div>*/}
    </div>
  );
};

const CreatorCards: React.FC = () => {
  const { session } = useAuth();
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Debug user session
  // console.log('[CreatorCards] Session object:', session);
  // console.log('[CreatorCards] Session ID:', session?._id);

  // Check localStorage for user data as fallback
  const [localUserData, setLocalUserData] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        // console.log('[CreatorCards] LocalStorage user data:', data);
        setLocalUserData(data);
      }
    } catch (error) {
      console.error('[CreatorCards] Error retrieving data from localStorage:', error);
    }
  }, []);

  // Use either context session or localStorage user
  const effectiveUser = session?._id ? session : localUserData;
  const effectiveUserId = session?._id || localUserData?.userID || localUserData?.userid || localUserData?.id;
  const effectiveToken = session?.token || localUserData?.accesstoken || localUserData?.refreshtoken;

  // console.log('[CreatorCards] Effective user ID:', effectiveUserId);
  // console.log('[CreatorCards] Effective token:', effectiveToken ? 'Present' : 'Missing');

  // Client-side check to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Remove localStorage caching - always fetch fresh from backend

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        // console.log('[CreatorCards] Fetch attempt - effective user ID:', effectiveUserId);

        // Always attempt to fetch, even without user session (for public feed)
        setLoading(true);
        setHasAttemptedFetch(true);

        // Fetch creators for both logged-in and non-logged-in users
        let res;
        if (effectiveUserId && effectiveToken) {
          // console.log('[CreatorCards] Fetching creators for logged-in user:', effectiveUserId);
          res = await getMyCreator({
            userid: effectiveUserId,
            token: effectiveToken
          });
        } else {
          // console.log('[CreatorCards] Fetching public creators for non-logged-in user');
          // For non-logged-in users, try to fetch public creators
          try {
            // Try calling the API with minimal auth (some backends allow this)
            res = await getMyCreator({
              userid: 'guest',
              token: 'guest'
            });
          } catch (error) {
            console.log('[CreatorCards] Guest API failed, trying alternative approach');
            try {
              // Alternative: try with empty/null values
              res = await getMyCreator({
                userid: '',
                token: ''
              });
            } catch (secondError) {
              console.log('[CreatorCards] All API attempts failed, returning empty list');
              // Final fallback: empty list
              res = {
                host: []
              };
            }
          }
        }

        // Handle different response formats
        const list = Array.isArray(res?.host) ? [...res.host] :
          Array.isArray(res) ? [...res] :
            Array.isArray(res?.data) ? [...res.data] : [];

        // Map to CreatorCardProps format
        const mappedCreators: CreatorCardProps[] = list.slice(0, 15).map((m: any) => {
          // Helper: pick first valid string from array or single value
          const pickValidPhoto = (value: any) => {
            if (!value) return null;
            if (Array.isArray(value)) {
              for (const v of value) {
                if (typeof v === "string" && v.trim() !== "") return v;
              }
              return null;
            }
            if (typeof value === "string" && value.trim() !== "") return value;
            return null;
          };

          // Try multiple fields in order
          const rawPhoto =
            (Array.isArray(m.creatorfiles) && m.creatorfiles.length > 0
              ? pickValidPhoto(m.creatorfiles[0]?.creatorfilelink)
              : null) ||
            pickValidPhoto(m.photolink) ||
            pickValidPhoto(m.photo) ||
            pickValidPhoto(m.image) ||
            pickValidPhoto(m.images) ||
            pickValidPhoto(m.photos);

          const photo = rawPhoto && !rawPhoto.startsWith("http")
            ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}${rawPhoto.replace(/^\.?\//, "/")}`
            : rawPhoto;

          const amountVal = m.price ?? m.amount ?? 0;
          let amountNum = 0;
          if (typeof amountVal === "string") {
            const digits = amountVal.replace(/[^0-9]/g, "");
            amountNum = digits ? parseInt(digits, 10) : 0;
          } else if (typeof amountVal === "number") {
            amountNum = amountVal;
          }

          const mappedCreator = {
            photolink: photo || "/images/default-placeholder.png",
            hosttype: m.hosttype || m.category || "",
            name: m.name || m.fullName || "Creator",
            age: Number(m.age || 0),
            gender: m.gender || "",
            location: m.location || "",
            amount: amountNum,
            creator_portfolio_id: m.hostid || m._id || m.id || m.creator_portfolio_id || "",
            userid: m.userid || m.hostid || m.ownerId || "",
            createdAt: m.createdAt || m.created_at || "",
            hostid: m.hostid,
            isVip: m.isVip || false,
            vipEndDate: m.vipEndDate || null,
            views: m.views || m.viewCount || m.view_count || m.totalViews || m.total_views || m.portfolioViews || m.portfolio_views || 0,
            isOnline: m.isOnline || m.online || m.is_online || m.onlineStatus || m.online_status || m.status === 'online' || false,
            isFollowing: m.isFollowing || m.following || m.followingUser || m.is_following || m.following_status || m.followedBy || m.followed_by || false,
          };

          // Debug logging for creator_portfolio_id issue
          if (!mappedCreator.creator_portfolio_id) {
            console.warn('[CreatorCards] Missing creator_portfolio_id for creator:', {
              name: mappedCreator.name,
              hostid: m.hostid,
              _id: m._id,
              id: m.id,
              creator_portfolio_id: m.creator_portfolio_id,
              rawData: m
            });
          }

          return mappedCreator;
        });

        setCreators(mappedCreators);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [effectiveUserId, effectiveToken]);

  // Don't render anything until client-side
  if (!isClient) {
    return null;
  }

  // console.log('[CreatorCards] Render state:', {
  //   loading,
  //   creatorsLength: creators.length,
  //   hasAttemptedFetch,
  //   hasUserSession: !!effectiveUserId,
  //   effectiveUserId,
  //   hasToken: !!effectiveToken
  // });

  // Always show skeleton if loading or no creators yet
  if (loading || !creators.length) {
    // console.log('[CreatorCards] Showing skeleton loader');
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Creators for you</h3>
          <button className="text-blue-500 text-sm hover:underline">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-48">
              <SkeletonTheme baseColor="#374151" highlightColor="#4B5563">
                <div className="bg-gray-700 rounded-lg p-3">
                  <Skeleton circle width={64} height={64} className="mx-auto mb-3" />
                  <Skeleton width="80%" height={16} className="mx-auto mb-2" />
                  <Skeleton width="60%" height={12} className="mx-auto mb-2" />
                  <Skeleton width="40%" height={12} className="mx-auto mb-3" />
                  <Skeleton width="100%" height={32} />
                </div>
              </SkeletonTheme>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // console.log('[CreatorCards] Rendering creator cards:', creators.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Creators for you</h3>
        <button
          className="text-blue-500 text-sm hover:underline"
          onClick={() => router.push('/creators')}
        >
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {creators.map((creator, index) => (
          <CreatorCard key={`${creator.creator_portfolio_id}-${index}`} {...creator} />
        ))}
      </div>
    </div>
  );
};

export default CreatorCards;
