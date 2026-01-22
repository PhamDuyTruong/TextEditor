import React, { useState, useRef, useEffect } from 'react'
import './CustomDropdown.scss'

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  disabled = false,
  label,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      {label && <span className="custom-dropdown__label">{label}</span>}
      <button
        className={`custom-dropdown__button ${disabled ? 'custom-dropdown__button--disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="custom-dropdown__value">{value}</span>
        <svg 
          className="custom-dropdown__icon" 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="custom-dropdown__menu">
          {options.map((option) => (
            <div
              key={option}
              className={`custom-dropdown__item ${option === value ? 'custom-dropdown__item--selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
