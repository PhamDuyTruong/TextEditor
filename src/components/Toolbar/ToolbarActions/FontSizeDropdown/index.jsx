import React from 'react'
import { CustomDropdown } from '../../../../common'

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 144]

const FontSizeDropdown = ({ value, onChange, disabled = false, onOpenChange }) => {
  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      options={FONT_SIZES}
      disabled={disabled}
      label="Size"
      onOpenChange={onOpenChange}
    />
  )
}

export default FontSizeDropdown