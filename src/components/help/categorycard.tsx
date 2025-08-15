import React from "react";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  articles: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, articles }) => {
  return (
    <div className="flex items-center p-4 bg-gray-800 rounded-lg my-2">
      <div className="text-primary text-2xl">{icon}</div>
      <div className="ml-4">
        <h2 className="font-bold">{title}</h2>
        <p className="text-gray-400">{articles} articles</p>
      </div>
    </div>
  );
};

export default CategoryCard;
