import React from 'react'
import './CustomDivider.scss'

const CustomDivider = ({ orientation = 'vertical', className = '' }) => {
  return (
    <div className={`custom-divider custom-divider--${orientation} ${className}`} />
  )
}

export default CustomDivider
