import React, { useEffect } from 'react'
import './CustomModal.scss'

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = '500px'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div 
        className="custom-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        {title && (
          <div className="custom-modal__header">
            <h2 className="custom-modal__title">{title}</h2>
            <button className="custom-modal__close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="custom-modal__content">
          {children}
        </div>

        {footer && (
          <div className="custom-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomModal
