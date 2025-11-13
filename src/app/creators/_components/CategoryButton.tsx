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
    <div className="flex gap-4">
      {buttons.map((button) => (
        <button
          key={button.value}
          className={` text-sm md:text-xl bg-gray-800 p-2 rounded-lg
            ${selected === button.value ? "bg-gray-700" : ""}`}
          onClick={() => onButtonClick(button.value)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryButtonComponent;
