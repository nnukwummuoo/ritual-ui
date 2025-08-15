import React from "react";
export const Header = ({name}: {name: string}) => {
  return (
    <div>
      <header>
        <h4 className="font-bold text-lg text-white">{name}</h4>
      </header>
    </div>
  );
};
