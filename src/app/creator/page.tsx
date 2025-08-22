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

const CreatorsPage: React.FC = () => {
  const articles: Article[] = [
    { title: "How do I verify and become a model?", ref: "/Becomeamodel" },
    { title: "How are models ranked on the Models page?", ref: "/Modelaccount" },
    { title: "How do I earn money as a model?", ref: "/Makeyourfirst" },
    { title: "What if a fan tries to scam or threaten me?", ref: "/Whathappen" },
    { title: "What’s the difference between a Fan Call and a normal video call?", ref: "/Privateshowwork" },
    { title: "How do I make sure I get paid after meeting a fan?", ref: "/Payout" },
    // You can add more articles here if needed
  ];

  return (
    <div className="min-h-screen pt-4 text-white bg-black md:mt-6">
      <SearchBar />

      <div className="p-4">
        <Breadcrumbs title="Creators" />
        <TitleSection
          title="Creators"
          article={`${articles.length} articles`}
          icon={<FaGraduationCap size={30} />}
        />

        <ArticleList articles={articles} />
      </div>

      <SupportButton />
    </div>
  );
};

export default CreatorsPage;
