import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import Providers from "./providers";
import BottomNavBar from "@/components/bottom-navbar";
import { PopUp } from "@/components/popup";
import Navapp from "@/navs/NavApp";
import ShouldRenderPopUp from "@/components/ShouldRenderPopUp";
import { cookies } from "next/headers";
import { ToastContainer } from "react-toastify";



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('session')?.value;
  const isAuthenticated = !!authToken?.length; 
  
  return (
    <main >
      <ToastContainer />
      <Providers>
        <section className="flex overflow-hidden h-screen relative">
          <Sidebar />
          <Navbar isAuthenticated={isAuthenticated} />
          <div className="w-full grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden">
            <div className="scrollbar overflow-y-auto w-full pb-16 pt-4 grid justify-between">
              <div className="w-full">
                {children}
              </div>
              {/* <div className="w-full h-full max-[600px]:w-0"></div> */}
            </div>
            {isAuthenticated && <BottomNavBar />}
            {!isAuthenticated && <ShouldRenderPopUp />}
          </div>
        </section>
      </Providers>
    </main>
  );
}
