import React,{useState} from 'react'
import { FiAlertCircle } from 'react-icons/fi'
import PacmanLoader from "react-spinners/CircleLoader";

export default function Notifybuy({price, buy, cancel}: {price: number, buy: ()=> void, cancel: ()=> void}) {
    const [buyclick, setbuyclick] = useState(true)
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#0000FF");
    let [disable,setdisable] = useState(false)
  return (
    <div className='w-72 h-fit bg-slate-400 flex flex-col p-2' >
        <div className='flex flex-row w-full justify-center mt-1'>
            <FiAlertCircle size={20}/>
            <p className='text-center mb-2 ml-1 font-bold'>Notification</p>

        </div>

        <div className='w-full bg-teal-600 rounded-md p-1'>
            <p className='text-sm font-bold text-white'>{price} <span className='text-yellow-600'>Gold</span> will be Deducted from your Gold Account!</p>
            <p className='text-xs font-bold text-red-600'>Do you wish to continue ?</p>

        </div>

        <div className='w-full flex flex-row justify-between mt-2'>
           {buyclick ? ( <button className="font-bold text-green-950" onClick={(e)=>{
                buy()
               setbuyclick(false)
               setLoading(true)
               setdisable(true)
              }}>Continue</button>) :
              ( <PacmanLoader
                color={color}
                loading={loading}
                size={20}
                aria-label="Loading Spinner"
                data-testid="loader"
                // margin={"auto"}
                />)
            }
            <button className="font-bold text-red-950" onClick={(e)=>{cancel()}} disabled={disable}>Cancel</button>
        </div>

    </div>
  )
}
