import React from 'react'

export default function Input({placeholder, type = "text", name}: {placeholder: string, type?: string, name?: string}) {
  return <input type={type} placeholder={placeholder} name={name || type} className='w-full p-2 mb-4 border border-[#12141f] rounded bg-[#0c0f27] focus:outline-none focus:ring-2 focus:ring-blue-500' />

}
