import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cookies } from "next/headers";
import 'react-loading-skeleton/dist/skeleton.css';
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import StorageCleanup from "@/components/StorageCleanup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ConditionalLayoutWrapper from "@/components/ConditionalLayoutWrapper";
import { VideoProvider } from "@/contexts/VideoContext";
import GlobalBanChecker from "@/components/GlobalBanChecker";
import ReduxHydrator from "@/components/ReduxHydrator";
import ScrollToTopAdvanced from "@/components/ScrollToTopAdvanced";
import GlobalVisitorTracker from "@/components/GlobalVisitorTracker";
import { ContentFilterProvider } from "@/lib/context/content-filter-context";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import ReferralTracker from "@/components/ReferralTracker";
import UpdateNotification from "@/components/UpdateNotification";


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
  manifest: "/manifest.json",
  themeColor: "#00A86B",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mmeko" />
      </head>
      <body className={`${inter.className} antialiased bg-background`}>
        <ServiceWorkerProvider />
        <StorageCleanup />
        <PWAInstallPrompt />
        <Providers>
          <ContentFilterProvider>
            <VideoProvider>
              <ReduxHydrator />
              <GlobalBanChecker />
              <ScrollToTopAdvanced
                smooth={true}
                delay={100}
                preserveScrollRoutes={[
                  "/message",
                  "/settings",
                  "/profile"
                ]}
                scrollOnSearchChange={false}
                scrollOnPopState={true}
                debug={process.env.NODE_ENV === "development"}
              />
              <GlobalVisitorTracker />
              <ReferralTracker />
              <UpdateNotification />
              <MaintenanceBanner />
              <ConditionalLayoutWrapper ssrAuth={isAuthenticated}>
                {children}
              </ConditionalLayoutWrapper>
            </VideoProvider>
          </ContentFilterProvider>
        </Providers>
      </body>
    </html>
  );
}
