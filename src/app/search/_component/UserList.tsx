'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getImageSource } from '@/lib/imageUtils';

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8'/%3E%3C/svg%3E";


interface UserListProps {
  photolink: string;
  name: string;
  country: string;
  gender: string;
  age: number;
  userid: string;
  username: string;
}

export const UserList: React.FC<UserListProps> = ({
  photolink,
  name,
  country,
  gender,
  age,
  userid,
  username,
}) => {
  const [userPic, setUserPic] = useState<string>(DEFAULT_AVATAR);
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
          src={getImageSource(userPic || DEFAULT_AVATAR, 'profile').src}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_AVATAR;
          }}
        />
      </div>
      <div className="flex flex-col ml-2">
        <div className="flex flex-col mb-1">
          <p className="text-slate-100 font-bold text-start">{name}</p>
          <p className="text-slate-300 text-xs text-start">{username}</p>
        </div>
        <p className="text-slate-300 font-semibold text-start">{country}</p>
        <p className="text-slate-300 font-semibold text-start">{gender}</p>
        <p className="text-slate-300 font-semibold text-start">{age} years</p>
      </div>
    </li>
  );
};
