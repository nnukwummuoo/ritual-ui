"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// import DummyCreatorImage from "/icons/mmekoDummy.png";
// import femaleIcon from "/icons/femaleIcon.svg";
// import maleIcon from "/icons/maleIcon.svg";
// import transIcon from "/icons/transIcon.svg";
import { getCountryData } from "@/api/getCountries";
import VIPBadge from "@/components/VIPBadge";
import { URL as API_BASE } from "@/api/config";
import { getImageSource } from "@/lib/imageUtils";

const PROD_BASE = "https://backendritual.work";
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
  // const [hostImg, setHostImg] = useState<string>("/icons/mmekoDummy.png");
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
      
      // Check if the date is valid
      if (isNaN(creationDate.getTime())) {
        return;
      }
      
      const diffInMs = currentDate.getTime() - creationDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      // Show NEW badge for creators created within 7 days
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

  // useEffect(() => {
  //   if (photolink?.length > 0) {
  //     setHostImg(photolink[0]);
  //   }
  // }, [photolink]);

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

  // Update src when photolink changes
  useEffect(() => {
    if (photolink) {
      const newImageSource = getImageSource(photolink, 'creator');
      setCurrentSrc(newImageSource.src || "/icons/mmekoDummy.png");
    } else {
      setCurrentSrc("/icons/mmekoDummy.png");
    }
  }, [photolink]);

  // Handle image error with multiple fallback URLs
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget as HTMLImageElement & { dataset: any };
    const failedSrc = target.src || currentSrc || photolink || "";
    
    // Only log if we have meaningful information (avoid empty object logs)
    if (failedSrc && failedSrc !== "/icons/mmekoDummy.png" && failedSrc.length > 0) {
      console.warn('[CreatorCard] Image failed to load, trying fallbacks:', { 
        failedSrc: failedSrc.length > 100 ? failedSrc.substring(0, 100) + '...' : failedSrc,
        originalUrl: photolink ? (photolink.length > 100 ? photolink.substring(0, 100) + '...' : photolink) : "N/A"
      });
    }
    
    // Get current image source for fallback URL generation
    const currentImageSource = getImageSource(photolink || '', 'creator');
    const fallbackKey = currentImageSource.isStorj && currentImageSource.key 
      ? currentImageSource.key 
      : (photolink || "");
    
    // Prepare fallback URLs
    const pathUrlPrimary = fallbackKey ? `${API_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
    const queryUrlFallback = currentImageSource.isStorj && currentImageSource.key && currentImageSource.bucket
      ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(currentImageSource.key)}&bucket=${currentImageSource.bucket}`
      : (fallbackKey ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
    const pathUrlFallback = fallbackKey ? `${PROD_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
    const renderQueryUrl = currentImageSource.isStorj && currentImageSource.key && currentImageSource.bucket
      ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(currentImageSource.key)}&bucket=${currentImageSource.bucket}`
      : (fallbackKey ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
    const renderPathUrl = fallbackKey ? `${RENDER_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
    
    // Try fallback URLs in sequence
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
    
    // Final fallback to dummy image
    if (!target.dataset.fallback6 && currentSrc !== "/icons/mmekoDummy.png") {
      target.dataset.fallback6 = "1";
      setCurrentSrc("/icons/mmekoDummy.png");
    }
  };

  return (
    <div className="relative overflow-hidden" onClick={handleClick}>
      {/* Host Image */}
      <div>
        <img
          alt="creator"
          src={currentSrc}
          width={400}
          height={300}
          className="object-cover w-full rounded h-80"
          onError={handleImageError}
        />
      </div>


      {/* New Badge */}
      {isNew && (
        <div className="absolute top-0 right-0 m-1 ">
          <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl rounded-full">
            New
          </span>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-1">
        <div className="flex flex-col items-start gap-1 px-1 overflow-auto sm:gap-2">
          {/* Country */}
          <div className="flex items-center gap-1 p-1 bg-black bg-opacity-40 rounded-lg">
            {countryData.flag && (
              <div className="rounded-full overflow-hidden size-4">
                <img                  src={countryData.flag}
                  alt={`${countryData.abbreviation} flag`}
                  width={200}
                  height={200}
                  className="size-full object-fill object-center"
                />
              </div>
            )}
            <span className="text-xs text-white">{countryData.fifa}</span>
          </div>

          {/* Host Type */}
          <h4 className="p-1 text-xs bg-black bg-opacity-40 rounded-lg whitespace-nowrap">
            {hosttype}
          </h4>

          {/* First Name */}
          <h4 className="p-1 text-xs bg-black bg-opacity-50 rounded-lg overflow-auto">
            {name?.split?.(" ")[0] ?? "Name"}
          </h4>
        </div>
      </div>
    </div>
  );
};
