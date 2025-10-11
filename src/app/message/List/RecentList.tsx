'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { format, isToday } from 'date-fns';
import onlineIcon from '@/icons/onlineIcon.svg';
import offlineIcon from '@/icons/offlineIcon.svg';
import DummyPics from '@/icons/icons8-profile_user.png';
import dodo from '@/icons/icons8-profile_user.png';
import Image from 'next/image';

interface RecentListProps {
  photolink?: string;
  username: string;
  content?: string;
  toid: string;
  fromid: string;
  date: string | number;
  online: boolean;
}

export const RecentList: React.FC<RecentListProps> = ({
  photolink,
  username,
  content,
  toid,
  fromid,
  date,
  online,
}) => {
  const [userphoto, setUserphoto] = useState<any>(dodo);
  const [creator_portfoliio_Id, setCreator_portfoliio_Id] = useState<string[]>([]);
  const router = useRouter();

  const myid = useSelector((state: any) => state.register.userID);

  // Format date for display
  const dateObj = new Date(Number(date));
  const dates = isToday(dateObj)
    ? format(dateObj, 'h:mm a')
    : format(dateObj, 'MM/dd/yyyy');

  useEffect(() => {
    if (fromid === myid) {
      setCreator_portfoliio_Id([toid, fromid]);
    }
    if (toid === myid) {
      setCreator_portfoliio_Id([fromid, toid]);
    }

    if (photolink) {
      setUserphoto(photolink);
    }
  }, [fromid, toid, myid, photolink]);

  const sliceContent = () => {
    if (content) {
      return content.length > 10 ? content.slice(0, 10) + '...' : content;
    }
    return '';
  };

  return (
    <li
      className="mb-1 cursor-pointer hover:bg-blue-700/30 transition-colors"
      onClick={() => {
        router.push(`/message/${creator_portfoliio_Id.toString()}`);
      }}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          router.push(`/message/${creator_portfoliio_Id.toString()}`);
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 mx-2 rounded-xl bg-blue-800/40 border border-blue-700/30">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <img
              src={userphoto}
              alt="message-image"
              className="object-cover w-full h-full rounded-full border-2 border-blue-600/50"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DummyPics?.src;
              }}
            />
            {online && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-blue-800 rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg">
              {username.split(' ')[0]}
            </h4>
            <p className="text-sm text-blue-200 truncate">{sliceContent()}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-blue-300 mb-1">{dates}</p>
          {online && (
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
          )}
        </div>
      </div>
    </li>
  );
};
