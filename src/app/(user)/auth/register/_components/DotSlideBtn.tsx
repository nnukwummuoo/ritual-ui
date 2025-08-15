import React from 'react'

export default function DotSlideBtn({step, setStep, slide}: {step: number, slide: number, setStep: (step: number)=>void}) {
  return <div
              className={step === slide ? "step active" : "step"}
              onClick={() => setStep(slide)}
            ></div>
}
