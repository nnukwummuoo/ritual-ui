import React from 'react';
import QuickChatLayoutClient from '../QuickChatLayoutClient';

export const metadata = {
  title: "QuickChat",
  description: "Fast messaging without navigation bars",
}

export default function QuickChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuickChatLayoutClient>
      <div className="h-screen w-full overflow-hidden bg-gray-900">
        {children}
      </div>
    </QuickChatLayoutClient>
  );
}
