'use client';

import React, { useEffect, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import Person from '@/icons/icons8-profile_Icon.png'; // Adjust path as needed
import { getImageSource } from '@/lib/imageUtils';

interface UserListProps {
  photolink: string;
  name: string;
  country: string;
  gender: string;
  age: number;
  userid: string;
  nickname: string;
}

export const UserList: React.FC<UserListProps> = ({
  photolink,
  name,
  country,
  gender,
  age,
  userid,
  nickname,
}) => {
  const [userPic, setUserPic] = useState<string | StaticImageData>(Person);
  const router = useRouter();

  useEffect(() => {
    if (photolink) {
      // Optionally handle with downloadImage or validate link
      setUserPic(photolink);
    }
  }, [photolink]);

  return (
    <li
      className="flex flex-row border border-blue-400 p-1 rounded-md mb-3 cursor-pointer"
     
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 overflow-hidden">
        {/* Fallback logic for broken URLs */}
        <Image
          alt="profile"
          src={getImageSource(userPic || Person, 'profile').src}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = (Person as unknown as string);
          }}
        />
      </div>
      <div className="flex flex-col ml-2">
        <div className="flex flex-col mb-1">
          <p className="text-slate-100 font-bold text-start">{name}</p>
          <p className="text-slate-300 text-xs text-start">{nickname}</p>
        </div>
        <p className="text-slate-300 font-semibold text-start">{country}</p>
        <p className="text-slate-300 font-semibold text-start">{gender}</p>
        <p className="text-slate-300 font-semibold text-start">{age} years</p>
      </div>
    </li>
  );
};
