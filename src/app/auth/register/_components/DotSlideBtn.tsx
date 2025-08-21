import React from 'react'

export default function DotSlideBtn({step, setStep, slide}: {step: number, slide: number, setStep: (step: number)=>void}) {
  return <div
    className={step === slide ? "step active bg-gradient-to-r from-blue-500 to-purple-600" : "step"}
    onClick={() => setStep(slide)}
  ></div>
}
