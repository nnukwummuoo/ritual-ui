import Link from 'next/link'
import React from 'react'
import { useMenuContext } from '@/lib/context/MenuContext'
import { usePathname } from 'next/navigation'

export default function MenuIconImg({name, src, url, itc="items-center", rounded=""}: 
    {name: string, src: string, url: string, itc?: string, rounded?: string}) {
 
  const { toggleMenu: handleMenubar } = useMenuContext();
  const pathname = usePathname();
  
  // Check if current route matches the link
  const isActive = pathname === url;

  return <Link href={url} className={`flex flex-col ${itc} group hover:bg-gray-700/50 ${isActive ? 'bg-gray-700/50' : ''} rounded-md p-2`} onClick={(e) => {
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
        className={`object-cover w-12 h-12  ${rounded}`}
        />
        <p className={`mt-1 text-center group-hover:text-gray-400 ${isActive ? 'text-gray-400' : ''}`}>{name}</p>
    </Link>
}