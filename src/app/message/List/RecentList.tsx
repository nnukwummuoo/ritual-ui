'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { format, isToday } from 'date-fns';
import onlineIcon from '@/icons/onlineIcon.svg';
import offlineIcon from '@/icons/offlineIcon.svg';
import DummyPics from '@/icons/icons8-profile_Icon.png';
import dodo from '@/icons/icons8-profile_Icon.png';
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
  const [modelid, setModelid] = useState<string[]>([]);
  const router = useRouter();

  const myid = useSelector((state: any) => state.register.userID);

  // Format date for display
  const dateObj = new Date(Number(date));
  const dates = isToday(dateObj)
    ? format(dateObj, 'h:mm a')
    : format(dateObj, 'MM/dd/yyyy');

  useEffect(() => {
    if (fromid === myid) {
      setModelid([toid, fromid]);
    }
    if (toid === myid) {
      setModelid([fromid, toid]);
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
      className="mb-1"
      onClick={() => {
        router.push(`/message/${modelid.toString()}`);
      }}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          router.push(`/message/${modelid.toString()}`);
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 mx-2 rounded-lg sm:px-2 bg-slate-800">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <img
              src={userphoto}
              alt="message-image"
              className="object-cover w-full h-full rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DummyPics?.src;
              }}
            />
            <div className="absolute z-10 w-6 h-6 m-1 top-6 left-6">
              <img
                alt={online ? 'online' : 'offline'}
                src={online ? onlineIcon : offlineIcon}
                className={`object-cover rounded-full w-5 h-5 ${
                  online ? 'bg-[#d3f6e0]' : 'bg-[#ffd8d9]'
                }`}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 text-md sm:text-sm">
              {username.split(' ')[0]}
            </h4>

            <p className="text-sm text-slate-400 sm:text-xs">{sliceContent()}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-slate-400">{dates}</h4>
        </div>
      </div>
    </li>
  );
};
