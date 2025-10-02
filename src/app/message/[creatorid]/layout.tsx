import React from 'react';
import MessageLayoutClient from '../MessageLayoutClient';

export const metadata = {
  title: "Message",
  description: "Direct message conversation",
}

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MessageLayoutClient>
      <div className="h-screen w-full flex flex-col bg-gray-900 pb-safe">
        {children}
      </div>
    </MessageLayoutClient>
  );
}
