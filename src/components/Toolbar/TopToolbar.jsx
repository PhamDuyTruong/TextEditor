import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  Edit as EditIcon,
  TextFields as TextIcon,
} from '@mui/icons-material'
import ToolbarButton from './ToolbarButton'
import { CustomDivider } from '../../common'
import TextElement from '../../models/TextElement'
import canvasStore from '../../stores/CanvasStore'
import './TopToolbar.scss'

const TopToolbar = observer(() => {
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
    const newElement = new TextElement({
      x: canvasStore.pageWidth / 2 - 100,
      y: canvasStore.pageHeight / 2 - 25,
      text: 'New Text',
      fontSize: 24,
    })
    canvasStore.addElement(newElement)
    canvasStore.selectElement(newElement.id)
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

        {/* Center: Undo/Redo & Add Text */}
        <div className="top-toolbar__center">
          <div className="top-toolbar__actions">
            <ToolbarButton
              icon={<UndoIcon />}
              onClick={handleUndo}
              disabled={!canUndo}
              tooltip="Undo (Ctrl+Z)"
            />
            <ToolbarButton
              icon={<RedoIcon />}
              onClick={handleRedo}
              disabled={!canRedo}
              tooltip="Redo (Ctrl+Y)"
            />
          </div>
          <CustomDivider />
          <ToolbarButton
            icon={<TextIcon />}
            onClick={handleAddText}
            tooltip="Add Text"
          />
        </div>

        {/* Right: Placeholder for future actions */}
        <div className="top-toolbar__right">
          {/* Reserved for Share, Export, etc. */}
        </div>
      </div>
    </div>
  )
})

export default TopToolbar
