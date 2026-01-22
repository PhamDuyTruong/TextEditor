import React from 'react'
import './CustomInput.scss'

const CustomInput = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  autoFocus = false,
  className = ''
}) => {
  return (
    <div className={`custom-input ${className}`}>
      {label && <label className="custom-input__label">{label}</label>}
      <input
        type={type}
        className={`custom-input__field ${disabled ? 'custom-input__field--disabled' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </div>
  )
}

export default CustomInput
