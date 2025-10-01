import React from 'react';
import { QuickChatConversation } from '../_components/QuickChatConversation';

export const metadata = {
  title: "QuickChat Conversation",
  description: "Fast messaging with last 3 messages",
}

export default function QuickChatConversationPage() {
  return <QuickChatConversation />;
}
