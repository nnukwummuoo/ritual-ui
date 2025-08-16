import { Gennavigation } from '../../_components/Gennav'
import HeaderBackNav from '../../_components/HeaderBackNav'

// import TawkMessengerReact from "@tawk.to/tawk-messenger-react"
// import { useLocation } from 'react-router-dom'
// import JsCrypto from "jscrypto"
// import { useSelector } from 'react-redux'
// import { tawkapi_key } from '../../../../api/config'
// import CryptoJS from "crypto-js"
// import { useNavigate } from 'react-router-dom'

const Speaktohelp = () => {
  // const tawkMessagerRef = useRef()
  // const email = useSelector((state) => state.profile.email);
  // const firstname = useSelector((state) => state.profile.firstname);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const navigate = useNavigate()

  // useEffect(()=>{
  //   if(!email){
  //     navigate("/")
  //   }
  // },[])
  
  // const onloadchat = ()=>{
  //  console.log("load method")
  //   if(email){
  //    let hash = makehash(email,tawkapi_key)
  //     console.log("attribute set "+hash)
  //     tawkMessagerRef.current.setAttributes({
  //       name:firstname,
  //       email:email,
  //       hash:hash
  //     }, function(error){
  //       console.log("attribute fialed "+error)
  //     })
  //   }
   
  //   //tawkMessagerRef.current.showWidget()

  
  // }

  // const beforeLoad = ()=>{
  //   console.log("before load called")
  // }

  // const showchat = ()=>{
  //   if(tawkMessagerRef.current){
  //     if(tawkMessagerRef.current.isChatHidden()){
  //        tawkMessagerRef.current.showWidget()
  //     }
  //   }
   
  // }


  // const chathide = ()=>{
  //   console.log("chat minimized")
  //  if(tawkMessagerRef.current){
  //     if(tawkMessagerRef.current.isChatHidden()  === false){
  //         tawkMessagerRef.current?.hideWidget()
  //     }
  //   }
    
  // }

  // const makehash = (message,key)=>{
  //   //let hash = JsCrypto.HmacSHA256(email,tawkapi_key)
  //   //console.log("hashed "+hash)
  //   const hash = CryptoJS.HmacSHA256(message,key)
  //   return CryptoJS.enc.Hex.stringify(hash)
  // }

 


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
