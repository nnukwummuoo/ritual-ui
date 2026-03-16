import Image from "next/image";
import React from "react";

export default function ImagePostCard() {
  return (
    <div className="h-[400px] mx-auto max-w-[30rem] overflow-y-hidden bg-[#111624] p-3 rounded-md">
      <div className="flex items-center gap-x-3">
        <div className="size-10 rounded-full overflow-hidden">
          <Image
            src={"/icons/profile.png"}
            alt="profile"
            width={100}
            height={100}
            className="object-cover object-center size-full"
          />
        </div>
        <div>
          <p>John Doe</p>
          <span className="text-gray-400">@super</span>
        </div>
      </div>
      <p className="my-3">Posted 07/13/2025</p>
      <div className="h-[480px] my-3 overflow-hidden w-full">
        <Image
          src={"/register.png"}
          alt="profile"
          width={1200}
          height={1200}
          className="object-cover object-top h-full  w-full"
        />
      </div>
    </div>
  );
}
