'use client'

import { useRouter } from 'next/navigation'
import { Gennavigation } from '../../_components/Gennav'
import HeaderBackNav from '../../_components/HeaderBackNav'

const Speaktohelp = () => {
  const router = useRouter()

  return (
    <div className="w-screen pt-6 mx-auto md:pt-0 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      <div className="chat_nav">
        <Gennavigation click={false} />
      </div>

      <HeaderBackNav title="Help" />

      <div className="flex flex-col w-full">
        <p className="text-xl font-bold text-center text-white">
          Chat with our Customer Assistant
        </p>

        <button
          className="font-bold text-white mt-7"
          onClick={() => router.push('/message/supportchat')}
        >
          Show Live Chat
        </button>
      </div>
    </div>
  )
}

export default Speaktohelp