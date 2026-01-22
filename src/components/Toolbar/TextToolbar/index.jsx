import React from 'react'
import { observer } from 'mobx-react-lite'
import {
    FormatAlignLeft as AlignLeftIcon,
    FormatAlignCenter as AlignCenterIcon,
    FormatAlignRight as AlignRightIcon,
    FormatAlignJustify as AlignJustifyIcon,
} from '@mui/icons-material'
import FontSizeDropdown from '../../Toolbar/ToolbarActions/FontSizeDropdown'
import { CustomButton, CustomColorPicker, CustomDivider } from '../../../common'
import canvasStore from '../../../stores/CanvasStore'
import { measureTextDimensions } from '../../../utils/textUtils'
import './TextToolbar.scss'

const FloatingTextToolbar = observer(() => {
    const selectedElement = canvasStore.selectedElement

    // Only show if element is selected
    if (!selectedElement) {
        return null
    }

    const handleFontSizeChange = (fontSize) => {
        if (selectedElement) {
            // Recalculate text dimensions with new font size
            const { width, height } = measureTextDimensions(
                selectedElement.text,
                fontSize,
                selectedElement.fontFamily
            )

            // Update element with new fontSize and recalculated dimensions
            canvasStore.updateElement(selectedElement.id, {
                fontSize,
                width,
                height
            })
        }
    }

    const handleColorChange = (color) => {
        if (selectedElement) {
            canvasStore.updateElement(selectedElement.id, { color })
        }
    }

    const handleAlignmentChange = (alignment) => {
        if (selectedElement) {
            canvasStore.updateElement(selectedElement.id, { alignment })
        }
    }

    const handleDropdownOpenChange = (isOpen) => {
        canvasStore.setDropdownOpen(isOpen)
    }

    const hasSelection = canvasStore.hasSelection

    // Common colors palette
    const presetColors = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000',
        '#008000', '#000080', '#808000', '#800080', '#008080',
    ]

    return (
        <div className="floating-text-toolbar">
            <div className="floating-text-toolbar__content">
                {/* Font Size */}
                <FontSizeDropdown
                    value={selectedElement?.fontSize || 24}
                    onChange={handleFontSizeChange}
                    disabled={!hasSelection}
                    onOpenChange={handleDropdownOpenChange}
                />

                <CustomDivider />

                {/* Text Color */}
                <CustomColorPicker
                    value={selectedElement?.color || '#000000'}
                    onChange={handleColorChange}
                    disabled={!hasSelection}
                    presetColors={presetColors}
                    onOpenChange={handleDropdownOpenChange}
                />

                <CustomDivider />

                {/* Text Alignment */}
                <div className="floating-text-toolbar__alignment-container">
                    <p className="floating-text-toolbar__label">Text Alignment</p>
                    <div className="floating-text-toolbar__alignment">
                        <CustomButton
                            icon={<AlignLeftIcon />}
                            onClick={() => handleAlignmentChange('left')}
                            disabled={!hasSelection}
                            selected={selectedElement?.alignment === 'left'}
                            tooltip="Align Left"
                        />
                        <CustomButton
                            icon={<AlignCenterIcon />}
                            onClick={() => handleAlignmentChange('center')}
                            disabled={!hasSelection}
                            selected={selectedElement?.alignment === 'center'}
                            tooltip="Align Center"
                        />
                        <CustomButton
                            icon={<AlignRightIcon />}
                            onClick={() => handleAlignmentChange('right')}
                            disabled={!hasSelection}
                            selected={selectedElement?.alignment === 'right'}
                            tooltip="Align Right"
                        />
                        <CustomButton
                            icon={<AlignJustifyIcon />}
                            onClick={() => handleAlignmentChange('justify')}
                            disabled={!hasSelection}
                            selected={selectedElement?.alignment === 'justify'}
                            tooltip="Align Justify"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
})

export default FloatingTextToolbar
