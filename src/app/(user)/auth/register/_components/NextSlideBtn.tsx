import React from 'react';
import "../styles.css"

export type NextSlideBtnProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export default function NextSlide({ setStep }: NextSlideBtnProps) {
  return (
    <button className='btn' type="button" onClick={() => setStep(prev => ++prev)}>
      Next
    </button>
  );
}
