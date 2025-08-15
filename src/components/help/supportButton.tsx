"use client"

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cusmericon from "../../icons/icons8-message.png"; // Ensure it's in /public or set up for static import

const SupportButton = () => {
  const router = useRouter();

  return (
    <button
      className="w-12 h-12 rounded-full shadow fixed bottom-20 z-40 right-4 md:right-[36rem]"
      onClick={() => router.push("/speaker")}
    >
      <Image
        alt="customer-support"
        src={cusmericon}
        className="object-cover rounded-full"
        width={48}
        height={48}
      />
    </button>
  );
};

export default SupportButton;
