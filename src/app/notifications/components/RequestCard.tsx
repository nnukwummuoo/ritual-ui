import Image from 'next/image';
import React from 'react'
import { BiTimeFive } from 'react-icons/bi'
import { FaCoins } from 'react-icons/fa';

const cardStates = {
  request: "Request sent",
  accepted: "Request accepted",
  declined: "Request declined",
  cancelled: "Request cancelled",
  expired: "Request expired",
  completed: "Request completed"
}
const ratings = [
  "😍 Loved it",
  "🙂 Decent",
  "😐 Disconnected",
  
]
const creatorContent = {
  accepted: {
    head: "Fan Meet Accepted",
    body: "Please kindly remind your fan to mark as complete during or after the date — it only takes a second. If they don't, contact support within 24 hours.",
  },
  completed: {
    head: "Fan Meet Completed",
    body: "How do you rate your experience?"
  },
  declined: {
    head: "Fan Meet Declined",
    body: "You have declined the fan-meet request from your fan."
  },
  cancelled: {
    head: "Fan Meet Cancelled",
    body: "Your fan cancelled the request."},
  expired: {
    head: "Fan Meet Expired",
    body: "You can ask the fan to renew request."
  },
  request: {
    head: "New Fan Meet Request",
    body: "You have 24 hours to accept or decline."
  }
  
}
const fanContent = {
  accepted: {
    head: "Fan Meet Accepted",
    body: "By clicking 'Mark as complete' you confirm that your pending gold of 💰20 will be sent to the creator."},
  completed: {
    head: "Fan Meet Completed",
    body: "How do you rate your experience?"},
  declined: {
    head: "Fan Meet Declined",
    body: "Creator declined your request."
  },
  cancelled: {
    head: "Fan Meet Cancelled",
    body: "You have cancelled the request. You can renew this request anytime."},
  expired: {
    head: "Fan Meet Expired",
    body: "Your request has expired. You can renew this request anytime."
  },
  request: {
    head: "Waiting For Creator\'s Response",
    body: "Your fan meet request has been sent. The creator has 24 hours to respond."
  }
}
const statusArr = ["request", "expired", "completed", "accepted", "declined", "cancelled"] 
interface CardProps {
    exp: string;
    children?: React.ReactNode;
    type: "fan" | "creator";
    titles?: string[];
    name: string;
    img: string;
    status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
}

export default function RequestCard({exp, img, name, titles=["fan"], status, type="fan"}: CardProps) {
  const cardBorderVariance = type === "creator" ? "border-blue-500" : type === "fan" && ["accepted", "completed"].includes(status) ? "border-green-500" : "border-yellow-500"
  const cardTextVariance = type === "creator" ? "text-blue-500" : type === "fan" && ["accepted", "completed"].includes(status) ? "text-green-500" : "text-yellow-500"

  // shared action button base so buttons have same size / height
  const actionBtnBase = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-sm flex items-center justify-center';
  // Fan action style (uses base for consistent sizing)
  const fanActionClass = `${actionBtnBase} border border-gray-500 max-[490px]:text-xs text-gray-300 hover:bg-slate-700 bg-transparent`;

  return (
    <div className={`w-full flex flex-col gap-6 rounded-lg border-2 ${cardBorderVariance} p-4 mx-auto text-white bg-slate-800`}>
      <div className={`flex justify-between items-start gap-4 ${cardTextVariance}`}>
        <div className="flex gap-4">
          <div className={`size-16 relative rounded-full border-4 overflow-hidden ${cardBorderVariance} bg-gray-900`}>
            <Image src={img} width={100} alt="picture" height={100} className='absolute top-0 left-0 size-full object-cover' />
          </div>
          <div className='text-sm'>
            <p className='font-bold'>{name}</p>
            <div className='flex gap-1'>{titles?.map((title, i)=> i === titles.length -1 ? <p key={title}>{title}</p> : <p key={title}>{title} &#x2022; </p>)}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {status === "accepted" ? <p className="flex items-center gap-2 text-xl"><FaCoins /> 20</p> : <BiTimeFive className="text-2xl" />}
        </div>
      </div>

      <h3 className={`text-3xl md:text-4xl ${cardTextVariance}`}>{
        type === "creator" ? creatorContent[status].head : fanContent[status].head
      }</h3>

      <p className="text-sm md:text-base">{ type === "creator" ? creatorContent[status].body : fanContent[status].body }</p>

      {/* RATINGS */}
      <div className='flex gap-4 flex-wrap justify-center'>
        {status === "completed" && ratings.map((v,i) => <Rating key={i} label={v} />)}
      </div>

      <div className={`flex flex-col gap-4 items-end`}>
        { statusArr.slice(1).includes(status) ? (
// keep this row horizontal and make buttons equal width
<div className="flex w-full items-stretch gap-3">
  <div className="flex-1 flex">
    <div className="w-full border border-gray-600 text-gray-500 px-3 py-2 rounded-lg text-xs md:text-sm flex items-center justify-center">
      {cardStates[status as keyof typeof cardStates]}
    </div>
  </div>

  <div className="flex-1">
    { type === "creator" && status === "accepted" ? (
      // Creator accepted → Renew + View details
      <div className="flex gap-3">
        <div className="flex-1">
          <FanActionBtn label="Chat Now" className={fanActionClass} />
        </div>
        <div className="flex-1">
          <button className={fanActionClass}>View details</button>
        </div>
      </div>
    ) : type === "fan" && status === "accepted" ? (
      // Fan accepted → Mark complete + View details
      <div className="flex gap-3">
        <div className="flex-1">
          <FanActionBtn label="Mark as complete" className={fanActionClass} />
        </div>
        <div className="flex-1">
          <button className={fanActionClass}>View details</button>
        </div>
      </div>
    ) : type === "creator" ? (
      <FanActionBtn label="Chat Now" className={fanActionClass} />
    ) : (
      <FanActionBtn label="Renew request" className={fanActionClass} />
    )}
  </div>
</div>

        ) : (
          <>
            {/* ---------- UPDATED EXPIRY ROW: now a bordered, padded full-width element ---------- */}
            <div className='w-full'>
              <div className='w-full flex justify-center'>
                {/* full width button-like row with border, padding and rounded corners */}
                <div className='w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 flex flex-col items-center justify-center'>
                  <p className='text-lg md:text-xl text-gray-300 font-normal mb-1'>Expires in:</p>
                  <p className='text-2xl md:text-3xl font-normal'>{exp}</p>
                </div>
              </div>
            </div>

            {/* Action buttons row: ALWAYS horizontal (no stacked layout) */}
            <div className='w-full flex flex-row gap-4 items-center'>
              { type === "creator" ? (
                // Creator: Accept | Decline | View details (equal widths)
                <>
                  <div className='flex-1'>
                    <CreatorActionBtn type='accept' />
                  </div>
                  <div className='flex-1'>
                    <CreatorActionBtn type='decline' />
                  </div>
                  <div className='flex-1'>
                    <button className={fanActionClass}>View details</button>
                  </div>
                </>
              ) : (
                // Fan: Cancel request | View details side-by-side
                <>
                  <div className='flex-1'>
                    {type === "fan" && status === "request" && <FanActionBtn label='Cancel request' className={fanActionClass} />}
                  </div>
                  <div className='flex-1'>
                    <button className={fanActionClass}>View details</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreatorActionBtn({type}: {type: "accept" | "decline"}){
  // Use same base sizing so heights match
  const base = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-white flex items-center justify-center';
  return <button className={`${base} ${type === "accept" ? "hover:bg-green-700 bg-green-600" : "hover:bg-red-700 bg-red-600"}`}>
    {type === "accept" ? "Accept" : "Decline"}
  </button>
};

function FanActionBtn({label, className}: {label: string, className?: string}){
  // allow overriding/using shared class; default uses the same base so sizing is consistent
  const defaultClass = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-sm flex items-center justify-center border border-gray-500 max-[490px]:text-xs text-gray-300 hover:bg-slate-700 bg-transparent';
  return <button className={ className ? className : defaultClass }>{label}</button>
}

function Rating({label}: {label: string}){
  return <div className='py-1 text-sm px-4 rounded-lg border border-gray-500 cursor-pointer bg-gray-800 transition-all duration-500 hover:bg-slate-700'>{label}</div>
}
