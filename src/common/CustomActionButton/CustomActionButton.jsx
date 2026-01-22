import React from 'react'
import './CustomActionButton.scss'

const CustomActionButton = ({ 
  children,
  onClick,
  variant = 'default', // 'default', 'primary', 'danger'
  disabled = false,
  className = ''
}) => {
  return (
    <button
      className={`custom-action-button custom-action-button--${variant} ${disabled ? 'custom-action-button--disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default CustomActionButton
