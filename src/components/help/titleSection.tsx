import React from "react";

const TitleSection = ({ title, article, icon }: { title : string, article : string, icon: any }) => {
  return (
    <div className=" items-center mt-4">
      <div className="text-primary text-2xl my-4 mx-3">{icon}</div>
      <div className="ml-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-white mt-4">{article}</p>
      </div>
    </div>
  );
};

export default TitleSection;
