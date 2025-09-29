import React from 'react'
import Tick from './Tick'

export default function Processing({status, isLoggedIn}: {isLoggedIn: boolean, status: string}) {
  return <div className={`w-full bg-gray-500/30 transition-all duration-500 ${status === "checking" ? "h-[25rem]" : "h-0 opacity-0"} flex items-center justify-center absolute bottom-0 left-0 z-[1000]`}>
    <Tick loading={isLoggedIn}>
        <span className='text-2xl text-center w-full'>{status === "checking" && !isLoggedIn ? "Just a moment!" : "You are signed in!"}</span>
    </Tick>
  </div>

}
