import { CallProvider } from '@/lib/context/callContext'
import React from 'react'
import { Profile } from '../_components/ProfilePage'
import { cookies } from 'next/headers'
import LoginPromptBanner from '@/components/LoginPromptBanner'


export const metadata = {
  title: "profile account",
  description: "Your profile account"
}
export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('session')?.value;

  return (
    <CallProvider>
      <Profile />
      {!isAuthenticated && <LoginPromptBanner />}
    </CallProvider>
  );
}