"use client"
import React, { useEffect, useRef, useState } from "react";
import notifymeIcon from "../../icons/notifymeIcon.svg";
// import { Meetupview } from "./modelnotifyviews/Meetupview";
// import { Allview } from "./modelnotifyviews/Allview";
// import { Requestview } from "./modelnotifyviews/Requestview";
// import { Acceptedview } from "./modelnotifyviews/Acceptedview";
import { FaAngleLeft } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Allview } from "./components/Allview";

const style =
  " hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:bg-clip-text hover:text-transparent";

export const Modelnotify = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [all, setall] = useState("#292d31");
  const [meetup, setmeetup] = useState("");
  const [request, setrequest] = useState("");
  const [accepted, setaccepted] = useState("");
  const divFocusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divFocusRef.current && divFocusRef.current.focus();
  }, []);

  return (
    <div className="w-full px-4 pt-0 h-screen flex flex-col contain-content">
      <div className="md:w-4/5 md:mx-auto">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <FaAngleLeft
              color="white"
              size={30}
              onClick={() => {
                router.push("/");
              }}
            />
            <h4 className="text-lg font-bold text-white">Notifications</h4>
          </div>
          <div className="flex gap-2 mb-8">
            <HeadBtn label="All" route="/notifications?id=randomid" />
            <HeadBtn label="Activity" route="/notifications/activity" />
          </div>
        </header>
        <div
          ref={divFocusRef}
          className="cstm-height focus:outline-none focus:border-dashed focus:border-gray-600 pb-12 flex-col items-center w-full overflow-y-auto scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

function HeadBtn({ label, route }: { label: string; route: string }) {
  const pathname = usePathname();
  const endpoint: boolean = route.split("?").includes(pathname);
  return (
    <Link
      href={route}
      className={`w-full font-bold transition-all duration-500 p-2 border border-gray-800 text-center text-slate-400 rounded-2xl hover:bg-gray-900 ${
        endpoint ? "bg-gray-800" : "bg-transparent"
      }`}
    >
      {label}
    </Link>
  );
}
