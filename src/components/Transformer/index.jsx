import React, { useEffect, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import canvasStore from '../../stores/CanvasStore'
import { measureText } from '../../utils/textUtils'
import { useThrottle } from '../../hooks/useThrottle'

const HANDLE_SIZE = 8
const ROTATION_HANDLE_DISTANCE = 30
const ROTATION_HANDLE_SIZE = 32

const Transformer = observer(({ isEditing }) => {
  const isResizingRef = useRef(false)
  const isRotatingRef = useRef(false)
  const resizeHandleRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const elementStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, rotation: 0 })

  const selectedElement = canvasStore.selectedElement

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

    if (!maintainAspectRatio && (position.includes('e') || position.includes('w'))) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const paddingX = 20
      const paddingY = 4  // Match with measureTextDimensions for consistent height
      const maxWidth = newWidth - paddingX

      const measurements = measureText(
        ctx,
        selectedElement.text,
        selectedElement.fontSize,
        selectedElement.fontFamily,
        maxWidth
      )

      const calculatedHeight = measurements.height + paddingY

      if (calculatedHeight > 30) {
        const heightDelta = calculatedHeight - newHeight
        newHeight = calculatedHeight

        if (position.includes('n')) {
          newY = newY - heightDelta
        }
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
    newRotation = ((newRotation % 360) + 360) % 360

    selectedElement.setRotation(newRotation)
  }, [selectedElement])

  const handleMouseMoveThrottled = useThrottle((e) => {
    if (!selectedElement) return

    const canvas = document.querySelector('.canvas')
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

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

  const handleHandleMouseDown = useCallback((handle, e) => {
    e.preventDefault()
    e.stopPropagation()

    const canvas = document.querySelector('.canvas')
    if (!canvas) return

    if (handle.type === 'rotation') {
      isRotatingRef.current = true
    } else {
      isResizingRef.current = true
      resizeHandleRef.current = handle
    }

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    dragStartRef.current = {
      x: screenX * scaleX,
      y: screenY * scaleY
    }

    elementStartRef.current = {
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height,
      rotation: selectedElement.rotation,
    }

    canvas.style.cursor = handle.type === 'rotation' ? 'grabbing' : getResizeCursor(handle.position)
  }, [selectedElement])

  useEffect(() => {
    if (!selectedElement) return

    const handleMouseUp = () => {
      const canvas = document.querySelector('.canvas')

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

    window.addEventListener('mousemove', handleMouseMoveThrottled)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveThrottled)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectedElement, handleMouseMoveThrottled])

  const getHandles = (element) => {
    if (!element) return []

    const handles = []
    const { x, y, width, height, rotation } = element
    const centerX = x + width / 2
    const centerY = y + height / 2

    // Corner handles and horizontal middle handles (removed vertical middle for better UX)
    const positions = [
      { pos: 'nw', x: x, y: y },
      { pos: 'ne', x: x + width, y: y },
      { pos: 'sw', x: x, y: y + height },
      { pos: 'se', x: x + width, y: y + height },
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

    // Rotation handle - positioned below the element (Canva-style)
    const rotationHandleY = y + height + ROTATION_HANDLE_DISTANCE
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

        // Different styling for rotation handle (Canva-style)
        const isRotation = handle.type === 'rotation'
        const handleSize = isRotation ? ROTATION_HANDLE_SIZE : HANDLE_SIZE

        return (
          <div
            key={index}
            onMouseDown={(e) => handleHandleMouseDown(handle, e)}
            style={{
              position: 'fixed',
              left: `${x - handleSize / 2}px`,
              top: `${y - handleSize / 2}px`,
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              backgroundColor: '#fff',
              border: isRotation ? '1px solid #e0e0e0' : '2px solid #1976d2',
              borderRadius: isRotation ? '50%' : '2px',
              pointerEvents: 'auto',
              cursor: isRotation ? 'grab' : getResizeCursor(handle.position),
              boxShadow: isRotation
                ? '0 2px 8px rgba(0,0,0,0.15)'
                : '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => {
              if (isRotation) {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.cursor = 'grab'
              }
            }}
            onMouseLeave={(e) => {
              if (isRotation) {
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {isRotation && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#666' }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
})

export default Transformer
