"use client"
import { useRouter } from 'next/navigation'
import React from 'react'
import { FaAngleRight } from 'react-icons/fa'

export default function NavigateForward({to, name, icon}: {to: string, name: string, icon: React.ReactNode}) {
    const router = useRouter()
  return <div
        className="flex items-center justify-between mb-6 "
        onClick={() => router.push(`/settings/${to}`)}
        >
        <div className="flex items-center gap-2">
            <div>{icon}</div>
            <h4 className="text-lg font-semibold text-white">{name}</h4>
        </div>
        <div>
            <FaAngleRight color="white" />
        </div>
    </div>
}
