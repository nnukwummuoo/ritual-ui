import React from 'react'
import { MessageView } from './Message'

export const metadata = {
  title: "Messages",
  description: "View your messages here",
}
export default function page() {
    return <MessageView />
}
