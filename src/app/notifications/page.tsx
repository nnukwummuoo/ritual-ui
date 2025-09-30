// const alert = (message, type, close) => {
//     toastId.current = toast(`${message}`, {
//       type: `${type}`,
//       autoClose: close,
//     });
//   };

//   const dismissalert = () => {
//     toast.dismiss(toastId.current);
//   };
export const metadata = {
  title: "Notifications"
}
import React from 'react'
import { Creatornotify } from './Notitification'
import { Allview } from './components/Allview'

export default function Notifications() {
  return <Allview />
}
