import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import {
  ContentCopy as DuplicateIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material'
import { CustomDivider } from '../../common'
import canvasStore from '../../stores/CanvasStore'
import './ContextMenu.scss'

const ContextMenu = observer(({ anchorPosition, onClose, onElementClick }) => {
  const [menuPosition, setMenuPosition] = useState(anchorPosition)
  const menuRef = React.useRef(null)

  useEffect(() => {
    setMenuPosition(anchorPosition)
  }, [anchorPosition])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    // Add a small delay to prevent immediate close from the right-click event
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  if (!menuPosition || !menuPosition.x || !menuPosition.y) {
    return null
  }

  const selectedElement = canvasStore.selectedElement

  const handleDuplicate = () => {
    if (selectedElement) {
      canvasStore.duplicateElement(selectedElement.id)
    }
    onClose()
  }

  const handleToggleLock = () => {
    if (selectedElement) {
      canvasStore.toggleLockElement(selectedElement.id)
    }
    onClose()
  }

  const handleDelete = () => {
    if (selectedElement) {
      canvasStore.removeElement(selectedElement.id)
    }
    onClose()
  }

  const handleLink = () => {
    // Link functionality handled by FloatingToolbar
    if (selectedElement) {
      onElementClick?.(selectedElement.id)
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={`context-menu ${!selectedElement ? 'isHidden' : ''}`}
      style={{
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
      }}
    >
      {selectedElement ? (
        <>
          <div className="context-menu__item" onClick={handleDuplicate}>
            <DuplicateIcon className="context-menu__icon" />
            <span>Duplicate</span>
          </div>

          <div className="context-menu__item" onClick={handleToggleLock}>
            {selectedElement.isLocked ? (
              <>
                <UnlockIcon className="context-menu__icon" />
                <span>Unlock</span>
              </>
            ) : (
              <>
                <LockIcon className="context-menu__icon" />
                <span>Lock</span>
              </>
            )}
          </div>

          <CustomDivider orientation="horizontal" />

          <div className="context-menu__item" onClick={handleLink}>
            <LinkIcon className="context-menu__icon" />
            <span>Add Link</span>
          </div>

          <CustomDivider orientation="horizontal" />

          <div className="context-menu__item context-menu__item--danger" onClick={handleDelete}>
            <DeleteIcon className="context-menu__icon" />
            <span>Delete</span>
          </div>
        </>
      ) : <></>}
    </div>
  )
})

export default ContextMenu
