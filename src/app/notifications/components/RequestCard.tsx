import Image from 'next/image';
import React from 'react'
import { BiTimeFive } from 'react-icons/bi'
import { FaCoins } from 'react-icons/fa';

const cardStates = {
  request: "Request sent",
  accepted: "Request accepted",
  declined: "Request declined",
  canceled: "Request canceled",
  expired: "Request expired",
  completed: "Request completed",
}
const ratings = [
  "😞 Disconnected",
  "😐 Decent",
  "😊 Loved It!"
]
const rating = [
  "😑 Dry",
  "😎 Cool",
  "🥰 Sweet",
  ]
const modelContent = {
  accepted: {
    head: "Fan Meet Accepted",
    body: "Please kindly remind your fan to mark as complete during or after the date — it only takes a second. If they don't contact support within 24 hours.",
  },
  completed: {
    head: "Fan Meet Completed",
    body: "You have successfully completed the fan meet with your fan. How do you rate your experience?"
  },
  declined: {
    head: "Fan Meet Declined",
    body: "You have declined the fan-meet request from your fan."
  },
  canceled: {
    head: "Fan Meet Canceled",
    body: "Your fan canceled the request."},
  expired: {
    head: "Fan Meet Expired",
    body: "The fan-meet request has expired. You can ask the fan to renew request."
  },
  request: {
    head: "New Fan Meet Request",
    body: "You've received a fan meet request. Please accept or decline within 24 hours."
  }
  
}
const fanContent = {
  accepted: {
    head: "Fan Meet Accepted",
    body: "By clicking 'Mark as complete' you confirm that your pending gold of 💰20 will be sent to the model."},
  completed: {
    head: "Fan Meet Completed",
    body: "You have successfully completed the fan meet with the model. How do you rate your experience?"},
  declined: {
    head: "Fan Meet Declined",
    body: "Model has declined your request. We are sorry and we hope it works out next time."
  },
  canceled: {
    head: "Fan Meet Canceled",
    body: "You have canceled the fan-meet request. You can renew this request anytime."},
  expired: {
    head: "Fan Meet Expired",
    body: "The fan-meet request has expired. You can renew this request anytime."
  },
  request: {
    head: "Waiting For Model\'s Response",
    body: "Your fan meet request has been sent. The model has 24 hours to respond."
  }
}
const statusArr = ["request", "expired", "completed", "accepted", "declined", "canceled"] 
interface CardProps {
    exp: string;
    children?: React.ReactNode;
    type: "fan" | "model";
    titles?: string[];
    name: string;
    img: string;
    status: "request" | "expired" | "completed" | "accepted" | "declined" | "canceled";
    schedule?: string; 
}

export default function RequestCard({exp, img, name, titles=["fan"], status, type="fan", schedule,}: CardProps) {
const cardBorderVariance = type === "model" ? "border-blue-500" : type === "fan" && ["accepted", "completed"].includes(status) ? "border-green-500" : "border-yellow-500"
const cardTextVariance = type === "model" ? "text-blue-500" : type === "fan" && ["accepted", "completed"].includes(status) ? "text-green-500" : "text-yellow-500"

  return <div className={`w-full flex flex-col gap-8 rounded-lg border-2 ${cardBorderVariance} p-4 mx-auto text-white bg-slate-800`}
  >
      <div className={`flex justify-between text-5xl ${cardTextVariance}`}>
        <div>
          <div className={`size-16 relative rounded-full border-4 overflow-hidden ${cardBorderVariance} bg-gray-900`}>
            <Image src={img} width={100} alt="picture" height={100} className='absolute top-0 left-0 size-full object-cover' />
          </div>
          
            {status === "request" && type === "fan" && schedule && (
             <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
               <BiTimeFive />
               <span>Scheduled: {schedule}</span>
             </div>
           )}
         </div>

        
          <div className='text-sm'>
            <p className='font-bold'>{name}</p>
            <div className='flex gap-1'>{titles?.map((title, i)=> i === titles.length -1 ? <p key={title}>{title}</p> : <p key={title}>{title} &#x2022; </p>)}</div>
          </div>
        </div>
        {status === "accepted" ? <p><FaCoins /> 20</p> : <BiTimeFive />}
      </div>
      <h3 className={`text-4xl ${cardTextVariance}`}>{
       type === "model" ?
        modelContent[status].head 
       : fanContent[status].head 
      }</h3>
      <p>{ type === "model" ?
        modelContent[status].body
        : fanContent[status].body
        }</p>
        {/* RATINGS */}
        <div className='flex gap-4 flex-wrap justify-center'>
        {status === "completed" && (
        type === "model"
       ? rating.map((v, i) => <Rating key={i} label={v} />)
      : ratings.map((v, i) => <Rating key={i} label={v} />)
       )}
      </div>
        <div className={`flex justify-between gap-6 ${type === "model" && "max-[490px]:flex-col"} items-end`}>
        { statusArr.slice(1).includes(status) ? 
        <div className={`flex gap-4 ${type === "model" && "max-[490px]:w-full"}`}>
          <div className='border border-gray-600 text-gray-500 px-6 py-2 rounded-lg text-sm max-[490px]:text-xs'>
            {cardStates[status as keyof typeof cardStates]}
          </div> 
          { type === "model" ? <FanActionBtn label='Chat now' /> :
           type === "fan" && status === "accepted"  ?
          <FanActionBtn label='Mark as complete' />
          : <FanActionBtn label='Renew request' />}
        </div>
          : <>
     <div className="flex-1 flex items-start">
         <div className="flex flex-col min-w-28 text-left">
         <p className="text-xl">Expires in:</p>
         <p className="text-3xl">{exp}</p>
         </div>
     </div>
          <div className={`flex gap-4 ${type === "model" && "max-[490px]:w-full"}`}>
            { type === "model" ?
            <>
            <ModelActionBtn type='accept' />
            <ModelActionBtn type='decline' />
            </>
            : <div className='text-yellow-500 text-2xl flex flex-col items-end gap-4'>
              <BiTimeFive />
              {type === "fan" && status === "request" && <FanActionBtn label='Terminate request' />}
              </div>
            }
          </div>
          </>
        }
    </div>
   </div>
}

function ModelActionBtn({type}: {type: "accept" | "decline"}){
  return <button className={`py-3 w-full px-6 rounded-lg transition-all duration-500 text-white ${type === "accept" ? "hover:bg-green-700  bg-green-600" : "hover:bg-red-700  bg-red-600"}`}>
    {type === "accept" ? "Accept" : "Decline"}
  </button>
};

function FanActionBtn({label}: {label: string}){
  return <button className='border border-gray-500 max-[490px]:text-xs text-sm transition-all duration-500 hover:bg-slate-700 text-gray-300 px-6 py-2 rounded-lg'>{label}</button>
}

function Rating({label}: {label: string}){
  return <div className='py-1 text-sm px-4 rounded-lg border border-gray-500 cursor-pointer bg-gray-800 transition-all duration-500 hover:bg-slate-700'>{label}</div>
}
