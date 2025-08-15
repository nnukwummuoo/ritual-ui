import Input from '@/components/Input';
import React from 'react'
import NextSlide, { NextSlideBtnProps } from './NextSlideBtn';

export default function Step({children, step, slide}: {children: React.ReactNode, step: number, slide: number}) {
  return <div className={step === slide ? "form active" : "form"}>
             {children} 
        </div>
}
