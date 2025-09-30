import React from 'react'

export const Bookingsuccess = ({setrequested}: {setrequested : any}) => {
  return (
    <div className='w-48 h-fit bg-gray-800 mx-auto p-5 rounded-lg z-50' style={{width:'95%',maxWidth:500}} >

        <p className='text-center pt-2 text-sm text-white'><span className='text-bold text-green-600'>Request sent, </span>please wait for creator to accept your request</p>

        <div className='flex justify-center'>
            <button className='bg-yellow-600 mr-1 text-sm p-2 ml-1 mt-3 rounded-lg w-1/2 shadow-2xl' onClick={(e)=>{
              setrequested(false)
            }}>
                Ok
            </button>

            
        </div>
        
    </div>
  )
}
