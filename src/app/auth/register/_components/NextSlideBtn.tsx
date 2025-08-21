import React from 'react';
import "../styles.css"

export type NextSlideBtnProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export default function NextSlide({ setStep }: NextSlideBtnProps) {
  return (
    <button className='btn bg-gradient-to-r from-blue-500 to-purple-600' type="button" onClick={() => setStep(prev => ++prev)}>
      Next
    </button>
  );
}
