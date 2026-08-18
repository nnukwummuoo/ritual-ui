"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

const SupportButton = () => {
  const router = useRouter();

  return (
    <button
      className="w-12 h-12 rounded-full shadow fixed bottom-20 z-40 right-4 md:right-[36rem] bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] flex items-center justify-center"
      onClick={() => router.push("/speaker")}
    >
      <MessageCircle className="w-6 h-6 text-white" fill="white" fillOpacity={0.15} />
    </button>
  );
};

export default SupportButton;
