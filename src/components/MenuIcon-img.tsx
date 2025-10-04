import Link from 'next/link'
import React from 'react'
import { useMenuContext } from '@/lib/context/MenuContext'

export default function MenuIconImg({name, src, url, itc="items-center", rounded=""}: 
    {name: string, src: string, url: string, itc?: string, rounded?: string}) {
 
  const { toggleMenu: handleMenubar } = useMenuContext();

  return <Link href={url} className={`flex flex-col ${itc} group`} onClick={(e) => {
    e.stopPropagation();
    handleMenubar();
  }}>
     <img
        alt={name}
        src={src}
        style={{
            display: "block",
            verticalAlign: "middle"
        }}
        className={`object-cover w-12 h-12 bg-slate-900 ${rounded}`}
        />
        <p className="mt-1 text-center group-hover:text-gray-400">{name}</p>
    </Link>
}