"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";

const BlogPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white bg-black px-4 py-8 md:py-12 md:px-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity"
            aria-label="Go back"
          >
            <FaAngleLeft size={30} />
          </button>
          <span className="text-lg font-semibold text-white">Blog</span>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Coming soon
          </h1>
          <p className="text-gray-400 text-lg">
            We&apos;re working on tips, updates, and stories for creators. Check back later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
