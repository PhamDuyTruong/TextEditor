import React, { useState } from 'react'
import './CustomTooltip.scss'

const CustomTooltip = ({ 
  children, 
  content, 
  position = 'top', // 'top', 'bottom', 'left', 'right'
  delay = 300,
  disabled = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)

  const handleMouseEnter = () => {
    if (disabled || !content) return
    
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  if (!content) {
    return children
  }

  return (
    <div 
      className={`custom-tooltip-wrapper ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && !disabled && (
        <div className={`custom-tooltip custom-tooltip--${position}`}>
          <div className="custom-tooltip__content">
            {content}
          </div>
          <div className="custom-tooltip__arrow" />
        </div>
      )}
    </div>
  )
}

export default CustomTooltip
