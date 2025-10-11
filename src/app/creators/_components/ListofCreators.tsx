"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import dodo from "@/icons/person.svg";
import onlineIcon from "@/icons/onlineIcon.svg";
import offlineIcon from "@/icons/offlineIcon.svg";
import femaleicon from "@/icons/femaleIcon.svg";
import maleIcon from "@/icons/maleIcon.svg";
import transIcon from "@/icons/transIcon.svg";
import viewIcon from "@/icons/clicksIcon.svg";
import { interst } from "@/data/intresttypes";
// import { Bookinginfo } from "@/fragment/bookingFrag/Bookinginfo";
// import { Bookingsuccess } from "@/fragment/bookingFrag/Bookingsuccess";
import { getCountryData } from "@/api/getCountries";
import DummyCreatorImage from "@/icons/mmekoDummy.png";
import D from "@/icons/icons8-profile_Icon.png";

interface ListofCreatorsProps {
  photolink?: string[];
  hosttype: string;
  online: boolean;
  name: string;
  age: number;
  gender: string;
  location: string;
  interest: string[];
  amount: number;
  creator_portfoliio_Id: string;
  userid: string;
  createdAt: string;
}

export const ListofCreators: React.FC<ListofCreatorsProps> = ({
  photolink,
  hosttype,
  online,
  name,
  age,
  gender,
  location,
  interest,
  amount,
  creator_portfoliio_Id,
  userid,
  createdAt,
}) => {
  const router = useRouter();
  const [hostimg, sethostimg] = useState<string>(DummyCreatorImage.src);
  const [creator_portfolio_id] = useState([creator_portfoliio_Id, userid]);
  const [countryData, setCountryData] = useState({
    flag: "",
    abbreviation: "",
    fifa: "",
  });
  const [isNew, setIsNew] = useState(false);

  // Check if creator is less than 7 days old
  useEffect(() => {
    if (createdAt) {
      const creationDate = new Date(createdAt);
      const currentDate = new Date();
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

  const fetchgender = () => {
    if (gender === "Man") {
      return <Image alt="maleIcon" src={maleIcon} width={20} height={20} />;
    } else if (gender === "Woman") {
      return <Image alt="femaleIcon" src={femaleicon} width={20} height={20} />;
    } else {
      return <Image alt="transIcon" src={transIcon} width={20} height={20} />;
    }
  };

  useEffect(() => {
    if (photolink && photolink.length > 0) {
      sethostimg(photolink[0]);
    }
  }, [photolink]);

  return (
    <li
      className="overflow-hidden cursor-pointer"
      onClick={() => {
        router.push(`/creatorbyid/${creator_portfolio_id.toString()}`);
      }}
    >
      <div className="relative">
        <div>
          <Image
            alt="verified"
            src={hostimg || DummyCreatorImage}
            width={400}
            height={320}
            className="object-cover w-full rounded h-80"
            onError={() => sethostimg(DummyCreatorImage.src)}
          />
        </div>

        {/* Online/Offline Indicator (Top-Left) */}
        <div className="absolute top-0 left-0 w-6 h-6 m-1">
          <Image
            alt={online ? "online" : "offline"}
            src={online ? onlineIcon : offlineIcon}
            width={20}
            height={20}
            className={`object-cover rounded-full w-5 h-5 ${
              online ? "bg-[#d3f6e0]" : "bg-[#ffd8d9]"
            }`}
          />
        </div>

        {/* New Badge */}
        {isNew && (
          <div className="absolute top-0 right-0 m-1">
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl rounded-full">
              New
            </span>
          </div>
        )}

        {/* Bottom Info (Country, Host Type, Name) */}
        <div className="absolute bottom-1">
          <div className="flex flex-col items-start gap-1 px-1 overflow-auto sm:gap-2">
            <div className="flex items-center gap-1 p-1 overflow-auto bg-black rounded-lg bg-opacity-40">
              {countryData.flag && (
                <Image
                  src={countryData.flag}
                  alt={`${countryData.abbreviation} flag`}
                  width={12}
                  height={12}
                  className="object-cover rounded-full"
                />
              )}
              <span className="text-xs text-white">{countryData.fifa}</span>
            </div>
            <h4 className="p-1 text-xs bg-black rounded-lg bg-opacity-40 whitespace-nowrap">
              {hosttype}
            </h4>
            <h4 className="p-1 overflow-auto text-xs bg-black bg-opacity-50 rounded-lg">
              {name.split(" ")[0]}
            </h4>
          </div>
        </div>
      </div>
    </li>
  );
};
