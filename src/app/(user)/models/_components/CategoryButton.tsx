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
          className={`border border-slate p-2 rounded-lg bg-slate-400 text-blue-600
            ${selected === button.value ? "border-green-500 text-white" : ""}`}
          onClick={() => onButtonClick(button.value)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryButtonComponent;
