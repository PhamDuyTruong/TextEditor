import React from 'react'
import { CustomButton } from '../../common'

const ToolbarButton = ({ icon, onClick, disabled = false, tooltip, selected = false, ...props }) => {
  return (
    <CustomButton
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      tooltipPosition="bottom"
      selected={selected}
      {...props}
    />
  )
}

export default ToolbarButton
