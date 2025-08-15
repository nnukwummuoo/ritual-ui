import { CallProvider } from '@/lib/context/callContext'
import React from 'react'
import { Profile } from '../_components/ProfilePage'

export const metadata = {
    title: "profile account",
    description: "Your profile account"
}
// export const dynamic = 'force-dynamic';
// export async function generateStaticParams() {
//   const res = await fetch('https://api.example.com/users');
//   const users = await res.json();

//   return users.map((user: any) => ({
//     userid: user.id,
//   }));
// }

export function generateStaticParams() {
  return [
    { userid: 'user_1' },
    { userid: 'randomuserid_123456789' },
  ];
}

export default function Page() {
  return <CallProvider>
    <Profile />
  </CallProvider>
  
}
