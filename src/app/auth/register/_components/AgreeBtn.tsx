import React from 'react'
import "../styles.css"

export default function Agree({agree, toThe, setAgree, id}: {agree: boolean, toThe: React.ReactNode, setAgree: ()=>void, id: string}) {
  return <label className="custom-checkbox">
    <input
      id={id}
      name={id}
      type="checkbox"
      checked={agree}
      onChange={setAgree} />
  
    <span className="checkmark"></span>
    <span>
      I read and agree to{" "}
      {toThe}
    </span>
  </label>
}
