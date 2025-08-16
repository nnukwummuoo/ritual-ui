import { JSX } from "react";

 const Switch = ({ isOn, handleToggle }: { isOn: boolean; handleToggle: () => void }): JSX.Element => {
  return (
    <div
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
        isOn ? "bg-green-500" : "bg-gray-500"
      }`}
      onClick={handleToggle}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
          isOn ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
};

export default Switch