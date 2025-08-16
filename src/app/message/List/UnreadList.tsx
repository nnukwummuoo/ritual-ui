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
  const [modelid, setmodelid] = useState<string[]>([]);
  const router = useRouter();

  const myid = useSelector((state: RootState) => state.register.userID);

  const date1 = new Date(Number(date));
  const dates = isToday(date1)
    ? format(date1, 'h:mm a')
    : format(date1, 'MM/dd/yyyy');

  useEffect(() => {
    setmodelid([fromid, toid]);

    if (photolink) {
      setuserphoto(photolink);
    }
  }, [fromid, toid, photolink]);

  const sliceContent = () => {
    return content ? content.slice(0, 10) + '...' : '';
  };

  return (
    <li
      className="mb-1"
      onClick={() => {
        router.push(`/message/${modelid.toString()}`);
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
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = DummyPics.src;
              }}
            />
            <div className="absolute z-10 w-6 h-6 m-1 top-6 left-6">
              <img
                alt={online ? 'online' : 'offline'}
                src={online ? onlineIcon.src : offlineIcon.src}
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
            <p className="text-sm text-slate-400 sm:text-xs">
              {sliceContent()}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-slate-400">{dates}</h4>
          <div className="pt-1 justify-items-end">
            <h4 className="w-5 h-5 text-sm text-center text-black rounded-full bg-slate-300">
              {count}
            </h4>
          </div>
        </div>
      </div>
    </li>
  );
};
