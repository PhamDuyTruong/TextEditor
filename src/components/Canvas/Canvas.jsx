import React, { useEffect, useRef, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import canvasStore from '../../stores/CanvasStore'
import CanvasRenderer from '../../models/CanvasRenderer'
import CanvasInteractions from '../../models/CanvasInteractions'
import ContextMenu from '../ContextMenu'
import { useAnimationFrame } from '../../hooks'
import '../Canvas/Canvas.scss'

const Canvas = observer(({ isEditing, setIsEditing }) => {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const interactionsRef = useRef(null)
  const [editingElementId, setEditingElementId] = useState(null)
  const [contextMenuPosition, setContextMenuPosition] = useState(null)
  const inputRef = useRef(null)
  const handleTextBlurRef = useRef(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = canvasStore.pageWidth
      canvas.height = canvasStore.pageHeight
    }

    resizeCanvas()

    // Initialize renderer
    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    rendererRef.current = new CanvasRenderer(canvas, ctx)

    // Initialize interactions
    interactionsRef.current = new CanvasInteractions(
      canvas,
      canvasStore,
      handleElementClick,
      handleElementDrag,
      handleElementDoubleClick,
      handleContextMenu,
      () => isEditing,
      handleTextBlurRef
    )

    return () => {
      if (interactionsRef.current) {
        interactionsRef.current.cleanup()
      }
    }
  }, [])

  // Render loop using useAnimationFrame hook
  useAnimationFrame(() => {
    if (rendererRef.current) {
      rendererRef.current.render(
        canvasStore.elements,
        canvasStore.zoom,
        canvasStore.panX,
        canvasStore.panY,
        canvasStore.backgroundColor
      )
    }
  })

  // Update isEditingChecker when isEditing changes
  useEffect(() => {
    if (interactionsRef.current) {
      interactionsRef.current.updateIsEditingChecker(() => isEditing)
    }
  }, [isEditing])

  const handleElementClick = (id) => {
    // Handled by CanvasInteractions
  }

  const handleElementDrag = (id, newX, newY) => {
    // Handled by CanvasInteractions
  }

  const handleElementDoubleClick = (elementId) => {
    const element = canvasStore.elements.find(el => el.id === elementId)
    if (element && !element.isLocked) {
      setIsEditing(true)
      setEditingElementId(elementId)

      // Focus input after a short delay and set initial content
      setTimeout(() => {
        if (inputRef.current) {
          // Set initial text content directly, converting \n to <br> for contentEditable
          const textToDisplay = element.text || ''
          inputRef.current.innerHTML = textToDisplay.replace(/\n/g, '<br>')
          inputRef.current.focus()

          // Place cursor at end
          const range = document.createRange()
          const sel = window.getSelection()

          // Make sure there's content to select
          if (inputRef.current.childNodes.length > 0) {
            range.selectNodeContents(inputRef.current)
            range.collapse(false) // Collapse to end
          } else {
            // If empty, just set range at the start
            range.setStart(inputRef.current, 0)
            range.setEnd(inputRef.current, 0)
          }

          sel.removeAllRanges()
          sel.addRange(range)
        }
      }, 10)
    }
  }

  const handleContextMenu = (clientX, clientY) => {
    setContextMenuPosition({ x: clientX, y: clientY })
  }

  const handleContextMenuClose = () => {
    setContextMenuPosition(null)
  }

  // Handle text input change (inline editing with contentEditable)
  const handleTextInput = (e) => {
    if (editingElementId && canvasRef.current) {
      const element = canvasStore.elements.find(el => el.id === editingElementId)
      if (element) {
        // Save original position to prevent any accidental movement
        const originalX = element.x
        const originalY = element.y

        // Get text from contentEditable HTML, converting to plain text with line breaks
        const htmlContent = e.currentTarget.innerHTML

        let newText = htmlContent
          .replace(/<div><br><\/div>/gi, '\n')
          .replace(/<div>/gi, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/div>/gi, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/<[^>]*>/g, '')

        // Only trim leading newline if there's actual text content
        newText = newText.replace(/^\n/, '')

        // Safety: ensure we don't save empty/whitespace-only text
        if (!newText || newText.trim().length === 0) {
          console.warn('[handleTextInput] Text is empty, keeping original:', element.text)
          return
        }

        element.setText(newText)

        // Measure text and update element size
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.font = `${element.fontSize}px ${element.fontFamily}`

        // Split by lines
        const lines = newText.split('\n')
        let maxWidth = 0

        lines.forEach(line => {
          const metrics = ctx.measureText(line || ' ')
          maxWidth = Math.max(maxWidth, metrics.width)
        })

        // Calculate new dimensions
        const newWidth = Math.max(100, maxWidth + 20)
        const lineHeight = element.fontSize * 1.1  // Match with measureText for consistent height
        const newHeight = Math.max(element.fontSize + 4, lines.length * lineHeight + 4)  // Reduced padding for tighter fit

        element.setSize(newWidth, newHeight)

        if (element.x !== originalX || element.y !== originalY) {
          element.setPosition(originalX, originalY)
        }
      }
    }
  }

  // Handle text blur (finish editing)
  const handleTextBlur = React.useCallback(() => {
    if (editingElementId && inputRef.current) {
      const element = canvasStore.elements.find(el => el.id === editingElementId)
      if (element) {
        // Get text from contentEditable, preserving line breaks
        // contentEditable uses <br> or <div> for line breaks, need to convert to \n
        const htmlContent = inputRef.current.innerHTML

        // Convert HTML to text with line breaks preserved
        let finalText = htmlContent
          .replace(/<div><br><\/div>/gi, '\n') // Empty line
          .replace(/<div>/gi, '\n') // New line
          .replace(/<br\s*\/?>/gi, '\n') // Line break
          .replace(/<\/div>/gi, '') // Remove closing div
          .replace(/&nbsp;/gi, ' ') // Non-breaking space
          .replace(/<[^>]*>/g, '') // Remove any other HTML tags

        // Trim only trailing newlines, keep intentional ones
        finalText = finalText.replace(/^\n/, '') // Remove leading newline if any

        // Safety: ensure we don't save empty/whitespace-only text
        if (!finalText || finalText.trim().length === 0) {
          console.warn('[handleTextBlur] Text is empty after conversion, keeping original:', element.text)
          // Don't save, just exit editing mode
          setIsEditing(false)
          setEditingElementId(null)
          return
        }

        element.setText(finalText)
        canvasStore.saveState()
      }
    }
    setIsEditing(false)
    setEditingElementId(null)
  }, [editingElementId, setIsEditing])

  // Store handleTextBlur in ref so CanvasInteractions can call it
  React.useEffect(() => {
    handleTextBlurRef.current = handleTextBlur
  }, [handleTextBlur])

  // Handle text edit key down
  const handleTextKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      // Cancel editing and restore original text
      if (editingElementId && inputRef.current) {
        const element = canvasStore.elements.find(el => el.id === editingElementId)
        if (element && inputRef.current) {
          inputRef.current.innerHTML = element.text.replace(/\n/g, '<br>')
        }
      }
      setIsEditing(false)
      setEditingElementId(null)
    }
  }

  const getInlineEditorStyle = () => {
    if (!canvasStore.selectedElement || !canvasRef.current) return {}

    const element = canvasStore.selectedElement
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height

    return {
      position: 'absolute',
      left: `${element.x * scaleX}px`,
      top: `${element.y * scaleY}px`,
      width: `${element.width * scaleX}px`,
      minHeight: `${element.height * scaleY}px`,
      fontSize: `${element.fontSize * scaleX}px`,
      fontFamily: element.fontFamily,
      color: element.color,
      textAlign: element.alignment,
      lineHeight: '1',
      padding: '4px',
      border: '2px solid #1976d2',
      outline: 'none',
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflow: 'hidden',
      zIndex: 1001,
      cursor: 'text',
      transformOrigin: 'top left',
      transform: `rotate(${element.rotation}rad)`,
    }
  }

  return (
    <div className="canvas-container" style={{ width: canvasStore.pageWidth, height: canvasStore.pageHeight }}>
      <canvas ref={canvasRef} className="canvas" />
      {isEditing && canvasStore.selectedElement && (
        <div
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextInput}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          className="canvas-text-input"
          style={getInlineEditorStyle()}
        />
      )}
      {contextMenuPosition && (
        <ContextMenu
          anchorPosition={contextMenuPosition}
          onClose={handleContextMenuClose}
          onElementClick={(elementId) => {
            if (elementId) {
              canvasStore.selectElement(elementId)
            }
            handleContextMenuClose()
          }}
        />
      )}
    </div>
  )
})

export default Canvas
