"use client";
import React, { useState, useEffect } from 'react'
import Tick from './Tick'

export default function Processing({status, isLoggedIn}: {isLoggedIn: boolean, status: string}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return <div className="w-full bg-gray-500/30 h-0 opacity-0 flex items-center justify-center fixed inset-0 z-[1000]">
      <Tick loading={false}>
        <span className='text-2xl text-center w-full'>Just a moment!</span>
      </Tick>
    </div>;
  }

  return <div className={`w-full bg-gray-500/30 transition-all duration-500 ${status === "checking" ? "h-screen" : "h-0 opacity-0"} flex items-center justify-center fixed inset-0 z-[1000]`}>
    <Tick loading={isLoggedIn}>
        <span className='text-2xl text-center w-full'>{status === "checking" && !isLoggedIn ? "Just a moment!" : "You are signed in!"}</span>
    </Tick>
  </div>

}
