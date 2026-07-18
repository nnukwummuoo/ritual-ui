import { Gennavigation } from '../../_components/Gennav'
import HeaderBackNav from '../../_components/HeaderBackNav'

const Speaktohelp = () => {


  return (
    <div className="w-screen pt-6 mx-auto md:pt-0 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      <div className="chat_nav"> <Gennavigation click={false} /></div>
      <HeaderBackNav title="Help"/>
        <div className='flex flex-col w-full'>
          <p className='text-xl font-bold text-center text-white'>Chat with our Customer Assistant</p>
          <button className="font-bold text-white mt-7">Show live Chat</button> {/*onClick={showchat}*/}
            {/* <TawkMessengerReact
            propertyId="67c61ba77e5f89190a52ce3b"
            widgetId="1ileto1h1"
            ref={tawkMessagerRef}
            onLoad={onloadchat}
            onChatMinimized={chathide}
            onBeforeLoad={beforeLoad}
            /> */}
        </div>
    </div>
  )
}

export default Speaktohelp
