
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

const AccountGoldPage: React.FC = () => {
  const articles: Article[] = [
    { title: "How do I buy Golds?", ref: "/Buygold" },
    { title: "Conversion Rates:", ref: "/Converterate" },
  ];

  return (
    <div className="min-h-screen mt-20 text-white bg-black md:mt-6">
      <SearchBar />

      <div className="p-4">
        <Breadcrumbs title="Golds" />
        <TitleSection
          title="Golds"
          article={`${articles.length} articles`}
          icon={<FaGraduationCap size={30} />}
        />

        <ArticleList articles={articles} />
      </div>

      <SupportButton />
    </div>
  );
};

export default AccountGoldPage;
