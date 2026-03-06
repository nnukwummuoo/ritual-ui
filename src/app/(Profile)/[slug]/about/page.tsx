"use client";
import dynamic from 'next/dynamic'

const AboutPage = dynamic(
  () => import('@/app/(Profile)/_components/AboutPage'),
  { ssr: false }
)

const page = () => {
  return (
    <div><AboutPage /></div>
  )
}
export default page