import React, { useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import {
  ContentCopy as DuplicateIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material'
import {
  CustomButton,
  CustomModal,
  CustomInput,
  CustomActionButton,
} from '../../common'
import canvasStore from '../../stores/CanvasStore'
import './FloatingToolbar.scss'

const FloatingToolbar = observer(({ isEditing }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const toolbarRef = React.useRef(null)

  const selectedElement = canvasStore.selectedElement

  const updatePosition = useCallback(() => {
    if (!selectedElement) return

    const canvas = document.querySelector('.canvas')
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    
    // Scale from canvas coordinates to screen coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Calculate center X position of the element (on screen)
    const elementCenterX = (selectedElement.x + selectedElement.width / 2) / scaleX
    
    // Position 16px above the element (on screen)
    const elementTopY = selectedElement.y / scaleY
    const gap = 16 // Gap between toolbar and element
    
    // Get actual toolbar dimensions (or use defaults)
    const toolbarWidth = toolbarRef.current?.offsetWidth || 200
    const toolbarHeight = toolbarRef.current?.offsetHeight || 48
    
    // Calculate toolbar position (centered horizontally above element)
    let x = rect.left + elementCenterX - toolbarWidth / 2
    let y = rect.top + elementTopY - toolbarHeight - gap
    
    // Clamp to viewport with padding
    const viewportPadding = 10
    x = Math.max(viewportPadding, Math.min(x, window.innerWidth - toolbarWidth - viewportPadding))
    y = Math.max(viewportPadding, Math.min(y, window.innerHeight - toolbarHeight - viewportPadding))
    
    // If toolbar would be above viewport, position it below the element instead
    if (y < viewportPadding) {
      y = rect.top + (selectedElement.y + selectedElement.height) / scaleY + gap
    }

    setPosition({ x, y })
  }, [selectedElement])

  // Update position when selection changes or element transforms
  useEffect(() => {
    if (selectedElement) {
      updatePosition()
    }
  }, [
    selectedElement,
    selectedElement?.x,
    selectedElement?.y,
    selectedElement?.width,
    selectedElement?.height,
    selectedElement?.rotation,
    updatePosition,
  ])

  // Update position after toolbar is rendered (to get actual dimensions)
  useEffect(() => {
    if (selectedElement && toolbarRef.current) {
      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        updatePosition()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedElement, updatePosition])

  const handleDuplicate = () => {
    if (selectedElement) {
      canvasStore.duplicateElement(selectedElement.id)
    }
  }

  const handleToggleLock = () => {
    if (selectedElement) {
      canvasStore.toggleLockElement(selectedElement.id)
    }
  }

  const handleDelete = () => {
    if (selectedElement) {
      canvasStore.deleteSelectedElement()
    }
  }

  const handleLinkClick = () => {
    if (selectedElement) {
      setLinkValue(selectedElement.link || '')
      setLinkDialogOpen(true)
    }
  }

  const handleLinkSave = () => {
    if (selectedElement) {
      canvasStore.updateElement(selectedElement.id, { link: linkValue || null })
      setLinkDialogOpen(false)
    }
  }

  const handleLinkCancel = () => {
    setLinkDialogOpen(false)
  }

  // Hide toolbar when editing text (Canva-like behavior)
  if (!selectedElement || isEditing) {
    return null
  }

  return (
    <>
      <div
        ref={toolbarRef}
        className="floating-toolbar"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <CustomButton
          icon={<DuplicateIcon />}
          onClick={handleDuplicate}
          tooltip="Duplicate"
        />

        <CustomButton
          icon={selectedElement.isLocked ? <LockIcon /> : <UnlockIcon />}
          onClick={handleToggleLock}
          tooltip={selectedElement.isLocked ? 'Unlock' : 'Lock'}
        />

        <CustomButton
          icon={<DeleteIcon />}
          onClick={handleDelete}
          tooltip="Delete"
          className="floating-toolbar__delete"
        />

        <CustomButton
          icon={<LinkIcon />}
          onClick={handleLinkClick}
          tooltip="Add Link"
          selected={!!selectedElement.link}
        />
      </div>

      <CustomModal
        isOpen={linkDialogOpen}
        onClose={handleLinkCancel}
        title="Add Link"
        footer={
          <>
            <CustomActionButton onClick={handleLinkCancel}>
              Cancel
            </CustomActionButton>
            <CustomActionButton onClick={handleLinkSave} variant="primary">
              Save
            </CustomActionButton>
          </>
        }
      >
        <CustomInput
          type="url"
          label="URL"
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
          placeholder="https://example.com"
          autoFocus
        />
      </CustomModal>
    </>
  )
})

export default FloatingToolbar
