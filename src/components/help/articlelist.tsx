import React from "react";
import { FaChevronRight } from "react-icons/fa";

const ArticleList = ({ articles }: { articles: any }) => {
  return (
    <div className="mt-4 space-y-4 rounded-md p-4 bg-black text-white border-2 border-slate-400">
      {articles.map((article : any , index : number ) => (
        <div
          key={index}
          className="flex items-center justify-between  cursor-pointer"
        >
          <a href={article.ref}>
          <span>{article.title}</span>
          <FaChevronRight className="text-green-600" />
          </a>
         
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
