

import ArticleList from "@/components/help/articlelist";
import Breadcrumbs from "@/components/help/breadcrumb";
import SearchBar from "@/components/help/searchbar";
import SupportButton from "@/components/help/supportButton";
import TitleSection from "@/components/help/titleSection";
import React from "react";
import { FaGraduationCap } from "react-icons/fa";

interface Article {
  title: string;
  ref: string;
}

const FansPage: React.FC = () => {
  const articles: Article[] = [
    { title: "What is a Fan Call?", ref: "/Howdoprivate" },
    { title: "How do Fan meet and Fan date work?", ref: "/Datemeetandfanwork" },
    { title: "What if I get scammed by a creator?", ref: "/ifscammed" },
    {
      title:
        "What’s the difference between a Fan Call and a normal video call?",
      ref: "/Privateshowwork",
    },
  ];

  return (
    <div className="min-h-screen mt-20 text-white bg-black">
      <SearchBar />

      <div className="p-4">
        <Breadcrumbs title="Fans" />
        <TitleSection
          title="Fans"
          article={`${articles.length} articles`}
          icon={<FaGraduationCap size={30} />}
        />

        <ArticleList articles={articles} />
      </div>

      <SupportButton />
    </div>
  );
};

export default FansPage;
