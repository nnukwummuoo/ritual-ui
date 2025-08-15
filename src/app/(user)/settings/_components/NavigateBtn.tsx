"use client"
import { useRouter } from 'next/navigation';
import { FaAngleLeft } from "react-icons/fa";
import React from 'react'
import useNavigateBack from '@/hooks/usenavigateBack';

export default function NavigateBack() {
    const router = useRouter()
    const prev = useNavigateBack()
  return <FaAngleLeft
          color="white"
          size={30}
          onClick={() => router.push(prev) }
        />
}
