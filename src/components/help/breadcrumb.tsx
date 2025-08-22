import React from "react";

const Breadcrumbs = ({ title }: {title: string}) => {
  return (
    <div className="text-sm text-white ">
      <span className="text-white">All Collections</span>{" "}
      <span className="mx-2 text-white">›</span>
      <span className="text-white">{title}</span>
    </div>
  );
};

export default Breadcrumbs;
