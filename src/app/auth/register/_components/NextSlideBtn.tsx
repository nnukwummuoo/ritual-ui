import React from 'react';
import "../styles.css";

export type NextSlideBtnProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onClick?: () => void; // Add optional onClick prop
};

export default function NextSlide({ setStep, onClick }: NextSlideBtnProps) {
  const handleClick = () => {
    setStep(prev => prev + 1); // Increment step
    if (onClick) {
      onClick(); // Call the custom onClick handler if provided
    }
  };

  return (
    <button
      className="btn bg-gradient-to-r from-blue-500 to-purple-600"
      type="button"
      onClick={handleClick}
    >
      Next
    </button>
  );
}