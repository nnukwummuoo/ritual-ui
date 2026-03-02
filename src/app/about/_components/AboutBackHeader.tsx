"use client";

import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";

export default function AboutBackHeader() {
  const router = useRouter();
  return (
    <header className="flex items-center gap-4 mb-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity"
        aria-label="Go back"
      >
        <FaAngleLeft size={30} />
      </button>
      <span className="text-lg font-semibold text-white">About</span>
    </header>
  );
}
