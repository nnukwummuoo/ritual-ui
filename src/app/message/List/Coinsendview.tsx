import React from 'react'
import { format } from "date-fns";

export const Coinsendview = ({name,price,date}: {name: string, price: string, date: string}) => { // price: should be a number but is referencing content
  let date1 = new Date(Number(date)).toString();
  //console.log('post date '+ date)
  const dates = format(date1, "MM/dd/yyyy 'at' h:mm a");
  return (
    <div>
        <div className='rounded-lg h-24 flex flex-col items-center justify-center border bg-black border-blue-500 '>
        <p className='bg-yellow-400 text-sm text-black pr-16 pl-2 font-bold'><span className="text-slate-300">{name}</span> tipped {price} golds</p>
        
    </div>

     <div className="flex justify-center">
     <p className="text-xs text-green-800">{dates}</p>
   </div>
    </div>
  
  )
}
