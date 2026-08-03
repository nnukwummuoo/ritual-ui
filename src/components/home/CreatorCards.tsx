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
      className="relative overflow-hidden rounded-xl cursor-pointer group border border-white/[0.06] w-48 flex-shrink-0 snap-start transition-transform duration-200 active:scale-[0.98] hover:-translate-y-0.5"
      onClick={handleCardClick}
    >
      {/* Profile Image */}
      <div className="relative w-full h-64 bg-gray-700">
        {photolink && photolink !== "/images/default-placeholder.png" ? (
          <img
            src={getImageSource(photolink, 'profile').src}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* Bottom gradient scrim for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Online indicator */}
        {isOnline && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
            <span className="text-[10px] font-medium text-white">Online</span>
          </div>
        )}

        {/* VIP Badge — resized down and pinned to the corner instead of overlapping the online pill */}
        {isVip && (
          <div className="absolute top-1 right-1">
            <VIPBadge size="lg" isVip={isVip} vipEndDate={vipEndDate} />
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h4 className="text-sm font-semibold text-white truncate drop-shadow-sm">
            {firstName}
          </h4>
          {hosttype && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 text-[10px] font-medium text-[#c9c4ff] bg-[#6c63ff]/15 border border-[#6c63ff]/25 rounded-full whitespace-nowrap">
                {hosttype}
              </span>
            </div>
          )}
        </div>
      </div>
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
          <button className="text-[#9b59f5] text-sm font-medium hover:text-[#b48cf7] hover:underline underline-offset-2">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-48">
              <SkeletonTheme baseColor="#1a1f2e" highlightColor="#252b3d">
                <Skeleton height={256} borderRadius={12} />
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
          className="text-[#9b59f5] text-sm font-medium hover:text-[#b48cf7] hover:underline underline-offset-2"
          onClick={() => router.push('/creators')}
        >
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
        {creators.map((creator, index) => (
          <CreatorCard key={`${creator.creator_portfolio_id}-${index}`} {...creator} />
        ))}
      </div>
    </div>
  );
};

export default CreatorCards;