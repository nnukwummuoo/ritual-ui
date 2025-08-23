import React from 'react'

export default function Input({required, value, name, type, placeholder, id, overide, classNames, checked, onChange }: {
  type: string,
  value?: string,
  name?: string,
  placeholder?: string,
  id?: string,
  overide?: boolean,
  classNames?: string,
  checked?: boolean,
  required?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}) {
  return <input
    type={type}
    className={overide ? classNames : "w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"}
    placeholder={placeholder}
    value={value}
    name={name || type}
    id={id}
    checked={type === "checkbox" ? checked : undefined}
    onChange={onChange}
    required={required}
  />
}
