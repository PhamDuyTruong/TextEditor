import React, { useEffect, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import canvasStore from '../../stores/CanvasStore'
import { getRotatedBoundingBox } from '../../utils/canvasUtils'
import { useThrottledCallback } from '../../hooks'

const HANDLE_SIZE = 8
const ROTATION_HANDLE_DISTANCE = 16

const TransformHandles = observer(({ isEditing }) => {
  const canvasRef = useRef(null)
  const isResizingRef = useRef(false)
  const isRotatingRef = useRef(false)
  const resizeHandleRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const elementStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, rotation: 0 })

  const selectedElement = canvasStore.selectedElement

  // Define resize and rotation handlers
  const handleResize = useCallback((x, y, handle, maintainAspectRatio) => {
    if (!selectedElement) return
    
    const { x: startX, y: startY } = dragStartRef.current
    const { x: elX, y: elY, width: elWidth, height: elHeight } = elementStartRef.current

    const deltaX = x - startX
    const deltaY = y - startY

    let newX = elX
    let newY = elY
    let newWidth = elWidth
    let newHeight = elHeight

    const { position } = handle

    // Calculate new dimensions based on handle position
    if (position.includes('w')) {
      newX = elX + deltaX
      newWidth = elWidth - deltaX
    }
    if (position.includes('e')) {
      newWidth = elWidth + deltaX
    }
    if (position.includes('n')) {
      newY = elY + deltaY
      newHeight = elHeight - deltaY
    }
    if (position.includes('s')) {
      newHeight = elHeight + deltaY
    }

    // Maintain aspect ratio if Shift is pressed
    if (maintainAspectRatio) {
      const aspectRatio = elWidth / elHeight
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio
        if (position.includes('n')) {
          newY = elY + elHeight - newHeight
        }
      } else {
        newWidth = newHeight * aspectRatio
        if (position.includes('w')) {
          newX = elX + elWidth - newWidth
        }
      }
    }

    // Apply minimum size constraints
    if (newWidth < 50) {
      newWidth = 50
      if (position.includes('w')) {
        newX = elX + elWidth - 50
      }
    }
    if (newHeight < 30) {
      newHeight = 30
      if (position.includes('n')) {
        newY = elY + elHeight - 30
      }
    }

    selectedElement.setPosition(newX, newY)
    selectedElement.setSize(newWidth, newHeight)
  }, [selectedElement])

  const handleRotation = useCallback((x, y) => {
    if (!selectedElement) return
    
    const { x: elX, y: elY, width: elWidth, height: elHeight } = elementStartRef.current
    const centerX = elX + elWidth / 2
    const centerY = elY + elHeight / 2

    const angle1 = Math.atan2(dragStartRef.current.y - centerY, dragStartRef.current.x - centerX)
    const angle2 = Math.atan2(y - centerY, x - centerX)
    const deltaAngle = ((angle2 - angle1) * 180) / Math.PI

    let newRotation = elementStartRef.current.rotation + deltaAngle
    newRotation = ((newRotation % 360) + 360) % 360 // Normalize to 0-360

    selectedElement.setRotation(newRotation)
  }, [selectedElement])

  // Throttled mouse move handler using hook
  const handleMouseMoveThrottled = useThrottledCallback((e) => {
    if (!selectedElement) return

    const canvas = document.querySelector('.canvas')
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    // Calculate scale factor
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const canvasPos = {
      x: screenX * scaleX,
      y: screenY * scaleY
    }

    if (isResizingRef.current && resizeHandleRef.current) {
      handleResize(canvasPos.x, canvasPos.y, resizeHandleRef.current, e.shiftKey)
    } else if (isRotatingRef.current) {
      handleRotation(canvasPos.x, canvasPos.y)
    }
  }, 16, [selectedElement, handleResize, handleRotation])

  useEffect(() => {
    if (!selectedElement) return

    const canvas = document.querySelector('.canvas')
    if (!canvas) return

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top

      // Calculate scale factor
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      const canvasPos = {
        x: screenX * scaleX,
        y: screenY * scaleY
      }

      // Check which handle was clicked
      const handle = getHandleAtPoint(canvasPos.x, canvasPos.y, selectedElement)
      if (handle) {
        e.preventDefault()
        e.stopPropagation()

        if (handle.type === 'rotation') {
          isRotatingRef.current = true
        } else {
          isResizingRef.current = true
          resizeHandleRef.current = handle
        }

        dragStartRef.current = { x: canvasPos.x, y: canvasPos.y }
        elementStartRef.current = {
          x: selectedElement.x,
          y: selectedElement.y,
          width: selectedElement.width,
          height: selectedElement.height,
          rotation: selectedElement.rotation,
        }

        canvas.style.cursor = handle.type === 'rotation' ? 'crosshair' : getResizeCursor(handle.position)
      }
    }

    const handleMouseUp = () => {
      if (isResizingRef.current || isRotatingRef.current) {
        canvasStore.saveState()
      }
      isResizingRef.current = false
      isRotatingRef.current = false
      resizeHandleRef.current = null
      if (canvas) {
        canvas.style.cursor = 'default'
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMoveThrottled)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMoveThrottled)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectedElement, handleMouseMoveThrottled])

  const getHandleAtPoint = (x, y, element) => {
    const handles = getHandles(element)
    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2))
      if (distance < HANDLE_SIZE / 2) {
        return handle
      }
    }
    return null
  }

  const getHandles = (element) => {
    if (!element) return []

    const handles = []
    const { x, y, width, height, rotation } = element
    const centerX = x + width / 2
    const centerY = y + height / 2

    // Corner handles
    const positions = [
      { pos: 'nw', x: x, y: y },
      { pos: 'ne', x: x + width, y: y },
      { pos: 'sw', x: x, y: y + height },
      { pos: 'se', x: x + width, y: y + height },
      { pos: 'n', x: centerX, y: y },
      { pos: 's', x: centerX, y: y + height },
      { pos: 'w', x: x, y: centerY },
      { pos: 'e', x: x + width, y: centerY },
    ]

    positions.forEach(({ pos, x: hx, y: hy }) => {
      const rotated = rotatePoint(hx, hy, centerX, centerY, rotation)
      handles.push({
        type: 'resize',
        position: pos,
        x: rotated.x,
        y: rotated.y,
      })
    })

    // Rotation handle
    const rotationHandleY = y - ROTATION_HANDLE_DISTANCE
    const rotatedRotationHandle = rotatePoint(centerX, rotationHandleY, centerX, centerY, rotation)
    handles.push({
      type: 'rotation',
      position: 'rotation',
      x: rotatedRotationHandle.x,
      y: rotatedRotationHandle.y,
    })

    return handles
  }

  const rotatePoint = (px, py, cx, cy, angle) => {
    // angle is in degrees, convert to radians
    const radians = (angle * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    const dx = px - cx
    const dy = py - cy
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    }
  }

  const getResizeCursor = (position) => {
    const cursors = {
      nw: 'nw-resize',
      ne: 'ne-resize',
      sw: 'sw-resize',
      se: 'se-resize',
      n: 'n-resize',
      s: 's-resize',
      w: 'w-resize',
      e: 'e-resize',
    }
    return cursors[position] || 'default'
  }


  // Hide handles when editing text (Canva-like behavior)
  if (!selectedElement || selectedElement.isLocked || isEditing) {
    return null
  }

  const handles = getHandles(selectedElement)
  const canvas = document.querySelector('.canvas')
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 999 }}>
      {handles.map((handle, index) => {
        // Scale canvas coordinates to screen coordinates
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = rect.left + handle.x / scaleX
        const y = rect.top + handle.y / scaleY

        return (
          <div
            key={index}
            style={{
              position: 'fixed',
              left: `${x - HANDLE_SIZE / 2}px`,
              top: `${y - HANDLE_SIZE / 2}px`,
              width: `${HANDLE_SIZE}px`,
              height: `${HANDLE_SIZE}px`,
              backgroundColor: handle.type === 'rotation' ? '#1976d2' : '#fff',
              border: `2px solid ${handle.type === 'rotation' ? '#fff' : '#1976d2'}`,
              borderRadius: handle.type === 'rotation' ? '50%' : '2px',
              pointerEvents: 'auto',
              cursor: handle.type === 'rotation' ? 'crosshair' : getResizeCursor(handle.position),
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        )
      })}
    </div>
  )
})

export default TransformHandles
