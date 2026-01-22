import React, { useState, useRef, useEffect } from 'react'
import './CustomColorPicker.scss'

const CustomColorPicker = ({
  value,
  onChange,
  disabled = false,
  presetColors = [],
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  const handleColorSelect = (color) => {
    onChange(color)
  }

  return (
    <div className="custom-color-picker" ref={pickerRef}>
      <p className="custom-color-picker__label">Text Color</p>
      <button
        className={`custom-color-picker__button ${disabled ? 'custom-color-picker__button--disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div
          className="custom-color-picker__preview"
          style={{ backgroundColor: value }}
        />
      </button>

      {isOpen && !disabled && (
        <div className="custom-color-picker__panel">
          <div className="custom-color-picker__input-wrapper">
            <label className="custom-color-picker__label">Text Color</label>
            <input
              type="color"
              className="custom-color-picker__input"
              value={value}
              onChange={(e) => handleColorSelect(e.target.value)}
            />
            <input
              type="text"
              className="custom-color-picker__text-input"
              value={value}
              onChange={(e) => handleColorSelect(e.target.value)}
              placeholder="#000000"
            />
          </div>

          {presetColors.length > 0 && (
            <div className="custom-color-picker__presets">
              {presetColors.map((color) => (
                <div
                  key={color}
                  className="custom-color-picker__preset"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomColorPicker
