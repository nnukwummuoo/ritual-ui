import Link from 'next/link'
import React from 'react'

export default function MenuIconImg({name, src, url, itc="items-center", rounded=""}: 
    {name: string, src: string, url: string, itc?: string, rounded?: string}) {
 
  return <Link href={url} className={`flex flex-col ${itc} group`} onClick={(e) => e.stopPropagation()}>
     <img
        alt={name}
        src={src}
        style={{
            display: "block",
            verticalAlign: "middle"
        }}
        className={`object-cover w-7 h-7 bg-slate-900 ${rounded}`}
        // onError={function (e){
        //   e.target.onerror = null;
        //   e.target.src = "/icons/icons8-profile_Icon1.png";
        // }}
        />
        <p className="mt-1 text-center group-hover:text-gray-400">{name}</p>
    </Link>
}
