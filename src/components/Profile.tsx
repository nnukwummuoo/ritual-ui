import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import VIPBadge from './VIPBadge'

export default function Profile({name, firstname, lastname, src, url,gold_balance, isVip, vipEndDate, onClick}: 
    {name: string, firstname?: string, lastname?: string, src: string, url: string,gold_balance:number|string, isVip?: boolean, vipEndDate?: string, onClick?: () => void}) {
  
  return <Link href={url} className={`flex gap-4 flex-col w-full`} onClick={(e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  }}>
        <p className='italic'>Welcome back!</p>
        <div className={`flex gap-4 group w-full`}>
        <div className="relative w-12 h-12 flex-shrink-0">
          {(() => {
            const profileImage = src;
            const displayName = firstname && lastname ? `${firstname} ${lastname}` : name;
            const userName = displayName;
            const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
            
            if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
              return (
                <Image
                  alt={displayName}
                  src={profileImage}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover bg-slate-900 rounded-full"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.setProperty('display', 'flex');
                    }
                  }}
                />
              );
            }
            
            return (
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {initials}
              </div>
            );
          })()}
          
          {/* VIP Lion Badge */}
          <VIPBadge size="xl" className='-top-5 -right-5' isVip={isVip} vipEndDate={vipEndDate} />
        </div>
        <div className='flex flex-col gap-1 font-bold w-full'>
        <p className=" group-hover:text-gray-400 text-xl">{firstname && lastname ? `${firstname} ${lastname}` : name}</p>
        <p className=" group-hover:text-gray-400 text-blue-400">{isVip ? "VIP" : "Basic Member"}</p>
        <p ><span>Gold bal:</span> <span className='text-yellow-500 font-bold text-[13px] ml-6'>{gold_balance}</span></p>
      
        </div>
        </div>
    </Link>
}
