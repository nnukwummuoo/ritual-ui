'use client';

import React, { useEffect, useRef, useState } from 'react';
// import { UnreadList } from './List/UnreadList';
import PacmanLoader from 'react-spinners/DotLoader';
import { useSelector, useDispatch } from 'react-redux';
import {
  getmsgnitify,
  reset_recent,
  changemessagestatus,
} from '@/store/messageSlice';
import { RootState, AppDispatch } from '@/store/store'; // Adjust according to your store path
import { RecentList } from '../List/RecentList';
import { UnreadList } from '../List/UnreadList';

// Define TypeScript types
interface MessageItem {
  content: string;
  photolink: string;
  username: string;
  name?: string;
  messagecount: number;
  toid: string;
  fromid: string;
  date: string | number;
  online: boolean;
  value: 'recent' | 'unread' | string;
}

export const Recentmessage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [color] = useState<string>('#c2d0e1');
  const [Chatmessage, setChatmessage] = useState<string>('');
  const ref = useRef(true);

  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const messageList = useSelector((state: RootState) => state.message.recentmsg) as MessageItem[];
  const modelID = useSelector((state: RootState) => state.profile.modelID);
  const userid = useSelector((state: RootState) => state.register.userID);

  useEffect(() => {
    if (msgnotifystatus !== 'loading' && userid && token) {
      setLoading(true);
      // dispatch(reset_recent());
      dispatch(getmsgnitify({ userid, token }));
    }
  }, [userid, token, msgnotifystatus, dispatch]);

  useEffect(() => {
    if (msgnotifystatus === 'succeeded') {
      dispatch(changemessagestatus('idle'));
      setLoading(false);
      setChatmessage('No! recent messages');
    }
  }, [msgnotifystatus]);

  const checkMessageList = () => {
    if (!loading) {
      if (messageList.length > 0) {
        const sortedMessages = [...messageList].sort((a, b) => {
          return Number(b.date) - Number(a.date);
        });

        return (
          <ul className="mt-2 overflow-auto mb-8">
            {sortedMessages.map((value, index) => {
              if (value.value === 'unread') {
                return (
                  <UnreadList
                    key={index}
                    content={value.content}
                    photolink={value.photolink}
                    username={value.username}
                    count={value.messagecount}
                    toid={value.toid}
                    fromid={value.fromid}
                    date={value.date as any}
                    online={value.online}
                  />
                );
              } else if (value.value === 'recent') {
                return (
                  <RecentList
                    key={index}
                    photolink={value.photolink}
                    username={value.name || value.username}
                    content={value.content}
                    fromid={value.fromid}
                    toid={value.toid}
                    date={value.date}
                    online={value.online}
                  />
                );
              } else {
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-center items-center overflow-hidden"
                  >
                    <p className="text-slate-400 mt-16">no recent message!!</p>
                  </div>
                );
              }
            })}
          </ul>
        );
      } else {
        return (
          <div className="flex flex-col justify-center items-center overflow-hidden">
            <p className="text-slate-400 mt-16">no recent message!!</p>
          </div>
        );
      }
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center mt-5">
          <PacmanLoader
            color={color}
            loading={loading}
            size={35}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <p className="text-center text-slate-400 text-xs">getting recent chats...</p>
        </div>
      )}
      {checkMessageList()}
    </div>
  );
};
