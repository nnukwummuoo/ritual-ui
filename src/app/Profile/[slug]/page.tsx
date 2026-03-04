import { CallProvider } from '@/lib/context/callContext'
import React from 'react'
import { Profile } from '../_components/ProfilePage'

export const metadata = {
    title: "profile account",
    description: "Your profile account"
}
export const dynamic = 'force-dynamic';

export default function Page() {
  return <CallProvider>
    <Profile />
  </CallProvider>
}
