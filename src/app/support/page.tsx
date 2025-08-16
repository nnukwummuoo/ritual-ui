"use client";

import React from "react";
import { FaGraduationCap, FaStar, FaUser } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cusmericon from "../../icons/icons8-message.png";
import HeaderBackNav from "@/components/navs/HeaderBackNav";
import SearchBar from "@/components/help/searchbar";
import CategoryCard from "@/components/help/categorycard";
import SupportButton from "@/components/help/supportButton";

const Support = () => {
  const router = useRouter();

  const categories = [
    {
      icon: <FaGraduationCap />,
      title: "About Mmeko",
      articles: 6,
      link: "about",
    },
    { icon: <FaStar />, title: "For Creators", articles: 11, link: "creator" },
    { icon: <FaUser />, title: "For Fans", articles: 4, link: "fans" },
    {
      icon: <GiGoldBar />,
      title: "Golds",
      articles: 2,
      link: "gold",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* <HeaderBackNav title="Help & Support" /> */}

      <div className="mx-auto text-white p-4 md:mr-auto md:ml-0">
        <div className="md:mx-auto mb-20">
          <div className="sm:mt-12">
            <h1 className="mb-12 ml-4 text-lg font-bold text-center">
              HOW CAN WE HELP?
            </h1>

            <SearchBar />

            <div className="m-auto mt-6 space-y-4">
              {categories.map((category, index) => (
                <Link href={`/${category.link}`} key={index}>
                  <CategoryCard {...category} />
                </Link>
              ))}
            </div>

            <SupportButton />

            {/* Uncomment if needed */}
            {/* 
            <button
              className="w-12 h-12 rounded-full shadow fixed bottom-20 z-40 right-4 md:right-[36rem]"
              onClick={() => router.push("/speaker")}
            >
              <img
                alt="customerimg"
                src={cusmericon.src}
                className="object-cover w-12 h-12 rounded-full"
              />
            </button> 
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
