"use client";

import Link from "next/link";

export default function LoginPromptBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080b14] border-t border-gray-700 shadow-2xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-white text-sm">
          Join to interact with creators
        </p>
        <p className="text-gray-400 text-xs">
          Book, follow, message, like posts and more
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Link
          href="/auth/login"
          className="flex-1 sm:flex-none text-center border border-gray-600 rounded-full px-5 py-2 text-sm font-medium text-gray-300 hover:bg-[#111624] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="flex-1 sm:flex-none text-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-all"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}