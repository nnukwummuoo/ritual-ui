import React from "react";

export const NavButton = ({ name, icon }: { name: string, icon: React.ReactNode }) => {
  return (
    <div>
      <div>
        <div>{icon}</div>
        <h4 className="font-bold text-lg text-white">{name}</h4>
      </div>
      <div></div>
    </div>
  );
};
