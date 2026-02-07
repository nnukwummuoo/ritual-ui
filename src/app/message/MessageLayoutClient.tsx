"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MessageLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Check if it's a chat route (/message/[id]) vs message list (/message)
    const isChatRoute = pathname?.includes('/message/') && pathname.split('/').length > 2;

    if (isChatRoute) {
      // Chat route: Lock scroll
      document.body.classList.add("message-route");
      document.body.classList.add("message-chat-route");
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100vh";
    } else {
      // Message list route: Enable scroll
      document.body.classList.remove("message-route");
      document.body.classList.remove("message-chat-route");
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.height = "auto";
    }

    // Cleanup function
    return () => {
      document.body.classList.remove("message-route");
      document.body.classList.remove("message-chat-route");
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [pathname]);

  return <>{children}</>;
}
