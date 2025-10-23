import React from 'react'

export default function DotSlideBtn({step, setStep, slide, disabled}: {step: number, slide: number, setStep: (step: number)=>void, disabled?: boolean}) {
  return <div
    className={`${step === slide ? "step active bg-gradient-to-r from-blue-500 to-purple-600" : "step"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    onClick={disabled ? undefined : () => setStep(slide)}
  ></div>
}
