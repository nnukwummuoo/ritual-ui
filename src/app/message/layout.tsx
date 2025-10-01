import type { Metadata } from "next";
import MessageLayoutClient from "./MessageLayoutClient";

export const metadata: Metadata = {
  title: "Messages - Mmeko",
  description: "Chat and messaging platform",
};

export default function MessageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MessageLayoutClient>
      <div className="h-screen w-full overflow-hidden">
        {children}
      </div>
    </MessageLayoutClient>
  );
}
