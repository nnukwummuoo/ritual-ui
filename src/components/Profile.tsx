import Link from 'next/link'
import { StringifyOptions } from 'node:querystring'
import React from 'react'

export default function Profile({name, src, url}: 
    {name: string, src: string, url: string}) {
  return <Link href={url} className={`flex gap-4 flex-col w-full`} onClick={(e) => e.stopPropagation()}>
        <p className='italic'>Welcome back!</p>
        <div className={`flex gap-4 group w-full`}>
     <img
        alt={name}
        src={src}
        style={{
            display: "block",
            verticalAlign: "middle"
        }}
        className={`object-cover size-12 bg-slate-900 rounded-full`}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.currentTarget as HTMLImageElement;
          target.onerror = null;
          target.src = "/icons/icons8-profile_user.png";
        }}
        />
        <div className='flex flex-col gap-1 font-bold w-full'>
        <p className=" group-hover:text-gray-400 text-xl">{name}</p>
        <p className=" group-hover:text-gray-400 text-blue-400">Basic Mode</p>
        <p ><span>Gold bal:</span> <span className='text-yellow-500 font-bold text-[13px] ml-6'>0</span></p>
        <p className='text-gray-500 italic my-2'>Member since 2021</p>
        </div>
        </div>
    </Link>
}
