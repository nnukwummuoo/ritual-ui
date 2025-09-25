import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import Providers from "./providers";
import BottomNavBar from "@/components/bottom-navbar";
import { PopUp } from "@/components/popup";
import Navapp from "@/navs/NavApp";
import ShouldRenderPopUp from "@/components/ShouldRenderPopUp";
import { cookies } from "next/headers";
import "react-loading-skeleton/dist/skeleton.css";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("session")?.value;
  const isAuthenticated = !!authToken?.length;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background`}>
        <Providers>
          <main className="flex overflow-hidden h-screen relative">
            <Sidebar />
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="w-full grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden mt-12">
              <div className="scrollbar overflow-y-auto w-full pt-4 grid grid-cols-[60fr_40fr] max-[1200px]:grid-cols-[75fr_25fr] max-[600px]:grid-cols-1 justify-between">
                <div className="w-full max-[1000px]:max-w-[90%]  max-[800px]:max-w-[100%]">
                  {children}
                </div>
                <div className="w-full h-full max-[1000px]:w-0"></div>
              </div>
              {isAuthenticated && <BottomNavBar />}
              {!isAuthenticated && <ShouldRenderPopUp />}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
