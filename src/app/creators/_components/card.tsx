"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { getCountryData } from "@/api/getCountries";
import VIPBadge from "@/components/VIPBadge";
import { URL as API_BASE } from "@/api/config";
import { getImageSource } from "@/lib/imageUtils";

const PROD_BASE = process.env.NEXT_PUBLIC_API || "";
const RENDER_BASE = "https://mmekoapi.onrender.com";

// Props interface
export interface CreatorCardProps {
  photolink: string | null;
  hosttype: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  interest: string[];
  amount: number;
  creator_portfolio_id: string;
  userid: string;
  createdAt: string;
  hostid: string;
  isVip?: boolean;
  vipEndDate?: string;
  views?: number;
  isOnline?: boolean;
  isFollowing?: boolean;
}

interface CountryData {
  flag: string;
  abbreviation: string;
  fifa: string;
}

export const CreatorCard = ({
  photolink,
  hosttype,
  name,
  age,
  gender,
  location,
  interest,
  amount,
  creator_portfolio_id,
  userid,
  createdAt,
  hostid,
  isVip = false,
  vipEndDate,
  views = 0,
  isOnline = false,
  isFollowing = false,
}: CreatorCardProps) => {
  const router = useRouter();
  const [countryData, setCountryData] = useState<CountryData>({
    flag: "",
    abbreviation: "",
    fifa: "",
  });
  const [isNew, setIsNew] = useState(false);

  // Check if creator was created within 7 days
  useEffect(() => {
    if (createdAt && createdAt !== '') {
      const creationDate = new Date(createdAt);
      const currentDate = new Date();

      if (isNaN(creationDate.getTime())) {
        return;
      }

      const diffInMs = currentDate.getTime() - creationDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      setIsNew(diffInDays <= 7);
    }
  }, [createdAt]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCountryData(location);
      if (data) setCountryData(data);
    };
    fetchData();
  }, [location]);

  const fetchGenderIcon = () => {
    if (gender === "Man") return "/icons/maleIcon.svg";
    if (gender === "Woman") return "/icons/femaleIcon.svg";
    return "/icons/transIcon.svg";
  };

  const handleClick = () => {
    router.push(`/creators/${hostid}`);
  };

  // Get image source using the utility function
  const imageSource = getImageSource(photolink || '', 'creator');
  const [currentSrc, setCurrentSrc] = useState(imageSource.src || "/icons/mmekoDummy.png");

  useEffect(() => {
    if (photolink) {
      const newImageSource = getImageSource(photolink, 'creator');
      setCurrentSrc(newImageSource.src || "/icons/mmekoDummy.png");
    } else {
      setCurrentSrc("/icons/mmekoDummy.png");
    }
  }, [photolink]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget as HTMLImageElement & { dataset: any };
    const failedSrc = target.src || currentSrc || photolink || "";

    if (failedSrc && failedSrc !== "/icons/mmekoDummy.png" && failedSrc.length > 0) {
      console.warn('[CreatorCard] Image failed to load, trying fallbacks:', {
        failedSrc: failedSrc.length > 100 ? failedSrc.substring(0, 100) + '...' : failedSrc,
        originalUrl: photolink ? (photolink.length > 100 ? photolink.substring(0, 100) + '...' : photolink) : "N/A"
      });
    }

    const currentImageSource = getImageSource(photolink || '', 'creator');
    const fallbackKey = currentImageSource.isStorj && currentImageSource.key
      ? currentImageSource.key
      : (photolink || "");

    const pathUrlPrimary = fallbackKey ? `${API_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
    const queryUrlFallback = currentImageSource.isStorj && currentImageSource.key && currentImageSource.bucket
      ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(currentImageSource.key)}&bucket=${currentImageSource.bucket}`
      : (fallbackKey ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
    const pathUrlFallback = fallbackKey ? `${PROD_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
    const renderQueryUrl = currentImageSource.isStorj && currentImageSource.key && currentImageSource.bucket
      ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(currentImageSource.key)}&bucket=${currentImageSource.bucket}`
      : (fallbackKey ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
    const renderPathUrl = fallbackKey ? `${RENDER_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";

    if (!target.dataset.fallback1 && pathUrlPrimary && currentSrc !== pathUrlPrimary) {
      target.dataset.fallback1 = "1";
      setCurrentSrc(pathUrlPrimary);
      return;
    }

    if (!target.dataset.fallback2 && queryUrlFallback && currentSrc !== queryUrlFallback) {
      target.dataset.fallback2 = "1";
      setCurrentSrc(queryUrlFallback);
      return;
    }

    if (!target.dataset.fallback3 && pathUrlFallback && currentSrc !== pathUrlFallback) {
      target.dataset.fallback3 = "1";
      setCurrentSrc(pathUrlFallback);
      return;
    }

    if (!target.dataset.fallback4 && renderQueryUrl && currentSrc !== renderQueryUrl) {
      target.dataset.fallback4 = "1";
      setCurrentSrc(renderQueryUrl);
      return;
    }

    if (!target.dataset.fallback5 && renderPathUrl && currentSrc !== renderPathUrl) {
      target.dataset.fallback5 = "1";
      setCurrentSrc(renderPathUrl);
      return;
    }

    if (!target.dataset.fallback6 && currentSrc !== "/icons/mmekoDummy.png") {
      target.dataset.fallback6 = "1";
      setCurrentSrc("/icons/mmekoDummy.png");
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer group border border-white/[0.06] transition-transform duration-200 active:scale-[0.98] hover:-translate-y-0.5"
      onClick={handleClick}
    >
      {/* Host Image */}
      <div className="relative">
        <img
          alt="creator"
          src={currentSrc}
          width={400}
          height={300}
          className="object-cover w-full rounded-xl h-64 sm:h-80 md:h-96 transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        {/* Bottom gradient scrim for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/20 to-transparent rounded-b-xl pointer-events-none" />
      </div>

      {/* Online indicator */}
      {isOnline && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
          <span className="text-[10px] font-medium text-white">Online</span>
        </div>
      )}

      {/* New Badge */}
      {isNew && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-white bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] shadow-lg rounded-full">
            New
          </span>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-sm font-semibold text-white truncate drop-shadow-sm">
            {name?.split?.(" ")[0] ?? "Name"}
          </h4>
          {countryData.flag && (
            <div className="rounded-full overflow-hidden size-4 shrink-0 ring-1 ring-white/20">
              <img
                src={countryData.flag}
                alt={`${countryData.abbreviation} flag`}
                width={200}
                height={200}
                className="size-full object-fill object-center"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="px-2 py-0.5 text-[10px] font-medium text-[#c9c4ff] bg-[#6c63ff]/15 border border-[#6c63ff]/25 rounded-full whitespace-nowrap">
            {hosttype}
          </span>
        </div>
      </div>
    </div>
  );
};