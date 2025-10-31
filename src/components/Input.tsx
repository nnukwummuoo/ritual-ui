import React from 'react'

export default function Input({required, value, name, type, placeholder, id, overide, classNames, checked, onChange, maxLength, pattern, title }: {
  type: string;
  value?: string;
  name?: string;
  placeholder?: string;
  id?: string;
  overide?: boolean;
  classNames?: string;
  checked?: boolean;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  maxLength?: number;
  pattern?: string;
  title?: string;
}) {
  // For text inputs with onChange, ensure value is always defined to keep it controlled
  // For checkboxes, use checked prop instead of value
  const isCheckbox = type === "checkbox";
  // If onChange is provided for non-checkbox inputs, ensure value is always defined (controlled)
  // Otherwise, only set value if explicitly provided
  const inputValue = isCheckbox 
    ? undefined 
    : (value !== undefined ? value : (onChange ? "" : undefined));
  
  return <input
    type={type}
    className={overide ? classNames : "w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"}
    placeholder={placeholder}
    value={inputValue}
    name={name || type}
    id={id}
    checked={isCheckbox ? checked : undefined}
    onChange={onChange}
    required={required}
    maxLength={maxLength}
    pattern={pattern}
    title={title}
  />
}