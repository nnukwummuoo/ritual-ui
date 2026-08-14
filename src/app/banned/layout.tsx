import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Banned - Mmeko",
  description: "This account has been banned for violating our rules",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function BannedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="antialiased bg-background">{children}</div>;
}



