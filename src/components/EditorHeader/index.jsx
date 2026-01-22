import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
    Undo as UndoIcon,
    Redo as RedoIcon,
    Edit as EditIcon,
    TextFields as TextIcon,
    FormatColorFill as ColorFillIcon,
} from '@mui/icons-material'
import { CustomDivider, CustomButton, CustomColorPicker } from '../../common'
import TextElement from '../../models/TextElement'
import canvasStore from '../../stores/CanvasStore'
import { measureTextDimensions } from '../../utils/textUtils'
import './EditorHeader.scss'

const EditorHeader = observer(() => {
    const [canvasName, setCanvasName] = useState('Untitled Canvas')
    const [isEditingName, setIsEditingName] = useState(false)

    const handleUndo = () => {
        canvasStore.undo()
    }

    const handleRedo = () => {
        canvasStore.redo()
    }

    const handleNameClick = () => {
        setIsEditingName(true)
    }

    const handleNameChange = (e) => {
        setCanvasName(e.target.value)
    }

    const handleNameBlur = () => {
        setIsEditingName(false)
    }

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditingName(false)
        }
        if (e.key === 'Escape') {
            setIsEditingName(false)
        }
    }

    const handleAddText = () => {
        const text = 'New Text'
        const fontSize = 24
        const fontFamily = 'Arial'

        const { width, height } = measureTextDimensions(text, fontSize, fontFamily)

        const newElement = new TextElement({
            x: canvasStore.pageWidth / 2 - width / 2,
            y: canvasStore.pageHeight / 2 - height / 2,
            text,
            fontSize,
            fontFamily,
            width,
            height,
        })
        canvasStore.addElement(newElement)
        canvasStore.selectElement(newElement.id)
    }

    const handleBackgroundColorChange = (color) => {
        canvasStore.setBackgroundColor(color)
    }

    const canUndo = canvasStore.historyStore.canUndo
    const canRedo = canvasStore.historyStore.canRedo

    return (
        <div className="top-toolbar">
            <div className="top-toolbar__content">
                {/* Left: Canvas Name (Editable) */}
                <div className="top-toolbar__left">
                    {isEditingName ? (
                        <input
                            type="text"
                            className="top-toolbar__name-input"
                            value={canvasName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleNameKeyDown}
                            autoFocus
                        />
                    ) : (
                        <div className="top-toolbar__name" onClick={handleNameClick}>
                            <span className="top-toolbar__name-text">{canvasName}</span>
                            <button className="top-toolbar__name-edit">
                                <EditIcon fontSize="small" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Center: Undo/Redo & Add Text & Background Color */}
                <div className="top-toolbar__center">
                    <div className="top-toolbar__actions">
                        <CustomButton
                            icon={<UndoIcon />}
                            onClick={handleUndo}
                            disabled={!canUndo}
                            tooltip="Undo (Ctrl+Z)"
                        />
                        <CustomButton
                            icon={<RedoIcon />}
                            onClick={handleRedo}
                            disabled={!canRedo}
                            tooltip="Redo (Ctrl+Y)"
                        />
                    </div>
                    <CustomDivider />
                    <CustomButton
                        icon={<TextIcon />}
                        onClick={handleAddText}
                        tooltip="Add Text"
                        tooltipPosition='bottom'
                    />
                    <CustomDivider />
                    <div className="top-toolbar__background-color">
                        <div className="top-toolbar__color-wrapper">
                            <input
                                type="color"
                                className="top-toolbar__color-input"
                                value={canvasStore.backgroundColor}
                                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                                title="Change canvas background color"
                            />
                            <div
                                className="top-toolbar__color-preview"
                                style={{ backgroundColor: canvasStore.backgroundColor }}
                            />
                        </div>
                    </div>
                </div>

                <div className="top-toolbar__right">
                </div>
            </div>
        </div>
    )
})

export default EditorHeader
