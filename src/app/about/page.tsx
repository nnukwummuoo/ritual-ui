
import React from "react";
import { FaGraduationCap } from "react-icons/fa";
import SearchBar from "@/components/help/searchbar";
import SupportButton from "@/components/help/supportButton";
import Breadcrumbs from "@/components/help/breadcrumb";
import TitleSection from "@/components/help/titleSection";
import ArticleList from "@/components/help/articlelist";

interface Article {
  title: string;
  ref: string;
}

const AboutPage: React.FC = () => {
  const articles: Article[] = [
    { title: "What is Mmeko?", ref: "/aboutmmeko" },
    { title: "Is the platform free?", ref: "/is-platformfree" },
    { title: "Do you allow explicit content?", ref: "/Explicitcontent" },
    { title: "How do I sell exclusive content?", ref: "/how-do-i-sell" },
    { title: "How do you ensure safety and legitimacy?", ref: "/Whouse" },
  ];

  return (
    <div className="min-h-screen px-1 pt-4 text-white bg-black md:mt-6 md:px-0">
      <SearchBar />

      <div className="p-4">
        <Breadcrumbs title="About" />
        <TitleSection
          title="About"
          article="6 articles"
          icon={<FaGraduationCap size={30} />}
        />

        <ArticleList articles={articles} />
      </div>

      <SupportButton />
    </div>
  );
};

export default AboutPage;
