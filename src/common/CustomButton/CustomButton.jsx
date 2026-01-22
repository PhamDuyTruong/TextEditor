import React from 'react'
import CustomTooltip from '../CustomTooltip/CustomTooltip'
import './CustomButton.scss'

const CustomButton = ({ 
  icon, 
  onClick, 
  disabled = false, 
  tooltip,
  tooltipPosition = 'top',
  selected = false,
  className = ''
}) => {
  return (
    <CustomTooltip content={tooltip} position={tooltipPosition} disabled={disabled}>
      <button
        className={`custom-button ${selected ? 'custom-button--selected' : ''} ${disabled ? 'custom-button--disabled' : ''} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </button>
    </CustomTooltip>
  )
}

export default CustomButton
