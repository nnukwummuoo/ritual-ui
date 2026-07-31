import React from "react";

type ButtonData = {
  label: string;
  value: string;
};

type Props = {
  buttons: ButtonData[];
  selected: string;
  onButtonClick: (value: string) => void;
};

const CategoryButtonComponent: React.FC<Props> = ({ buttons, selected, onButtonClick }) => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {buttons.map((button) => (
        <button
          key={button.value}
          className={`text-sm md:text-base font-medium px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
            selected === button.value
              ? "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] border-transparent text-white shadow-[0_6px_16px_-6px_rgba(108,99,255,0.6)]"
              : "bg-[#111624] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/15"
          }`}
          onClick={() => onButtonClick(button.value)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryButtonComponent;