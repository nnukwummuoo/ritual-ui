import Link from 'next/link'
import React from 'react'

export default function Profile({name, src, url,gold_balance, onClick}: 
    {name: string, src: string, url: string,gold_balance:number|string, onClick?: () => void}) {
  return <Link href={url} className={`flex gap-4 flex-col w-full`} onClick={(e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  }}>
        <p className='italic'>Welcome back!</p>
        <div className={`flex gap-4 group w-full`}>
        {(() => {
          const profileImage = src;
          const userName = name;
          const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
          
          if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
            return (
              <img
                alt={name}
                src={profileImage}
                style={{
                  display: "block",
                  verticalAlign: "middle"
                }}
                className={`object-cover size-12 bg-slate-900 rounded-full`}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.style.setProperty('display', 'flex');
                }}
              />
            );
          }
          
          return (
            <div className="size-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {initials}
            </div>
          );
        })()}
        <div className='flex flex-col gap-1 font-bold w-full'>
        <p className=" group-hover:text-gray-400 text-xl">{name}</p>
        <p className=" group-hover:text-gray-400 text-blue-400">Basic Mode</p>
        <p ><span>Gold bal:</span> <span className='text-yellow-500 font-bold text-[13px] ml-6'>{gold_balance}</span></p>
        <p className='text-gray-500 italic my-2'>Member since 2021</p>
        </div>
        </div>
    </Link>
}
