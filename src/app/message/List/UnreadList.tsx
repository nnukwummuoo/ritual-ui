'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { format, isToday } from 'date-fns';

import dodo from '@/icons/icons8-profile_Icon.png';
import DummyPics from '@/icons/icons8-profile_Icon.png';
import onlineIcon from '@/icons/onlineIcon.svg';
import offlineIcon from '@/icons/offlineIcon.svg';

interface UnreadListProps {
  photolink?: string;
  username: string;
  content: string;
  count: number;
  toid: string;
  fromid: string;
  date: string;
  online: boolean;
}

export const UnreadList: React.FC<UnreadListProps> = ({
  photolink,
  username,
  content,
  count,
  toid,
  fromid,
  date,
  online,
}) => {
  const [userphoto, setuserphoto] = useState<string>(dodo.src);
  const [creatorid, setcreatorid] = useState<string[]>([]);
  const router = useRouter();

  const myid = useSelector((state: RootState) => state.register.userID);

  const date1 = new Date(Number(date));
  const dates = isToday(date1)
    ? format(date1, 'h:mm a')
    : format(date1, 'MM/dd/yyyy');

  useEffect(() => {
    setcreatorid([fromid, toid]);

    if (photolink) {
      setuserphoto(photolink);
    }
  }, [fromid, toid, photolink]);

  const sliceContent = () => {
    return content ? content.slice(0, 10) + '...' : '';
  };

  return (
    <li
      className="mb-1 cursor-pointer hover:bg-blue-700/30 transition-colors"
      onClick={() => {
        router.push(`/message/${creatorid.toString()}`);
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
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = DummyPics.src;
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
            <p className="text-sm text-blue-200 truncate">
              {sliceContent()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-blue-300 mb-1">{dates}</p>
          <div className="flex items-center justify-end gap-2">
            {online && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {count}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
