import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cookies } from "next/headers";
import 'react-loading-skeleton/dist/skeleton.css';
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  weight: ["100", "300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "Mmeko | %s",
    default: "Mmeko - Welcome",
  },
  description: "",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: "/manifest.json",
  themeColor: "#00A86B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mmeko",
  },
  icons: {
    icon: "/icons/icon.png",
    apple: "/icons/icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Mmeko",
    "application-name": "Mmeko",
    "msapplication-TileColor": "#00A86B",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('session')?.value;
  const isAuthenticated = !!authToken?.length;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00A86B" />
        <link rel="apple-touch-icon" href="/icons/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mmeko" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Mmeko" />
        <meta name="msapplication-TileColor" content="#00A86B" />
        <meta name="msapplication-TileImage" content="/icons/icon.png" />
      </head>
      <body className={`${inter.className} antialiased bg-background`}>
        <Providers>
          <ConditionalLayout isAuthenticated={isAuthenticated}>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
