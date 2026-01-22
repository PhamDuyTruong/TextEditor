import { isPointInRect, getRotatedBoundingBox } from '../utils/canvasUtils'

function throttle(func, delay) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

/**
 * CanvasInteractions
 * Handles all mouse and keyboard interactions with canvas
 * 
 * Note: This class cannot use React hooks like useThrottle
 * because it's a class-based component, not a functional component.
 * Therefore, we use an inline throttle utility function.
 */
class CanvasInteractions {
  constructor(canvas, canvasStore, onElementClick, onElementDrag, onElementDoubleClick, onContextMenu, isEditingChecker, handleTextBlurRef) {
    this.canvas = canvas
    this.canvasStore = canvasStore
    this.onElementClick = onElementClick
    this.onElementDrag = onElementDrag
    this.onElementDoubleClick = onElementDoubleClick
    this.onContextMenu = onContextMenu
    this.isEditingChecker = isEditingChecker || (() => false)
    this.handleTextBlurRef = handleTextBlurRef // Reference to handleTextBlur function

    this.isDragging = false
    this.dragStartX = 0
    this.dragStartY = 0
    this.dragElementId = null
    this.dragOffsetX = 0
    this.dragOffsetY = 0
    
    // Add click delay to distinguish single-click from double-click
    this.clickTimeout = null
    this.lastClickTime = 0
    this.DOUBLE_CLICK_DELAY = 300 // ms

    this.setupEventListeners()
  }

  /**
   * Update isEditingChecker function
   */
  updateIsEditingChecker(isEditingChecker) {
    this.isEditingChecker = isEditingChecker
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', throttle(this.handleMouseMove.bind(this), 16))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this))
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))

    // Prevent context menu on right click (we'll handle it)
    this.canvas.addEventListener('contextmenu', e => e.preventDefault())
  }

  /**
   * Get element at point
   * @param {number} x - X coordinate (screen)
   * @param {number} y - Y coordinate (screen)
   * @returns {TextElement|null} Element at point or null
   */
  getElementAtPoint(x, y) {
    // For page-based canvas, we need to scale coordinates from screen to canvas
    const rect = this.canvas.getBoundingClientRect()
    const screenX = x - rect.left
    const screenY = y - rect.top

    // Calculate scale factor (canvas might be displayed at different size than actual)
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    // Convert screen coordinates to canvas coordinates
    const canvasX = screenX * scaleX
    const canvasY = screenY * scaleY

    // Check elements in reverse order (top to bottom)
    for (let i = this.canvasStore.elements.length - 1; i >= 0; i--) {
      const element = this.canvasStore.elements[i]
      if (element.isLocked) continue

      // Check if point is inside element bounds (considering rotation)
      const bbox = getRotatedBoundingBox(element.x, element.y, element.width, element.height, element.rotation)

      if (isPointInRect(canvasX, canvasY, bbox.x, bbox.y, bbox.width, bbox.height)) {
        return element
      }
    }

    return null
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    // If editing text, check if click is outside the text input
    if (this.isEditingChecker()) {
      console.log('[handleMouseDown] Editing mode detected')
      console.log('[handleMouseDown] Click target:', e.target)
      console.log('[handleMouseDown] Click target tag:', e.target.tagName)
      
      // Check if click is on canvas (to blur the text input)
      const textInput = document.querySelector('.canvas-text-input')
      console.log('[handleMouseDown] Text input found:', textInput)
      console.log('[handleMouseDown] Contains check:', textInput?.contains(e.target))
      
      if (textInput && !textInput.contains(e.target)) {
        console.log('[handleMouseDown] Calling handleTextBlur directly')
        // Call handleTextBlur directly instead of relying on blur event
        if (this.handleTextBlurRef?.current) {
          this.handleTextBlurRef.current()
        } else {
          console.warn('[handleMouseDown] handleTextBlurRef not available, falling back to blur()')
          textInput.blur()
        }
      }
      // Don't handle drag events when editing
      return
    }

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    const element = this.getElementAtPoint(x, y)
    const now = Date.now()
    
    // Check if this might be a double-click (within delay threshold)
    const timeSinceLastClick = now - this.lastClickTime
    const isPotentialDoubleClick = timeSinceLastClick < this.DOUBLE_CLICK_DELAY

    if (element) {
      // If this might be a double-click, don't start dragging yet
      if (isPotentialDoubleClick) {
        // Just select, wait to see if double-click happens
        this.canvasStore.selectElement(element.id)
        this.onElementClick?.(element.id)
        this.lastClickTime = now
        return
      }
      
      // Start dragging only if not a potential double-click
      this.isDragging = true
      this.dragElementId = element.id
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY

      const rect = this.canvas.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      
      // Calculate scale factor
      const scaleX = this.canvas.width / rect.width
      const scaleY = this.canvas.height / rect.height
      
      const canvasX = screenX * scaleX
      const canvasY = screenY * scaleY
      
      this.dragOffsetX = canvasX - element.x
      this.dragOffsetY = canvasY - element.y

      // Select element
      this.canvasStore.selectElement(element.id)
      this.onElementClick?.(element.id)
    } else {
      // Deselect all
      this.canvasStore.deselectAll()
      this.onElementClick?.(null)
    }
    
    this.lastClickTime = now

    this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'default'
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    // Don't handle mouse events when editing text
    if (this.isEditingChecker()) {
      return
    }

    const rect = this.canvas.getBoundingClientRect()

    if (this.isDragging && this.dragElementId) {
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top

      // Calculate scale factor
      const scaleX = this.canvas.width / rect.width
      const scaleY = this.canvas.height / rect.height
      
      const canvasX = screenX * scaleX
      const canvasY = screenY * scaleY

      const element = this.canvasStore.elements.find(el => el.id === this.dragElementId)
      if (element) {
        const newX = canvasX - this.dragOffsetX
        const newY = canvasY - this.dragOffsetY

        element.setPosition(newX, newY)
        this.onElementDrag?.(this.dragElementId, newX, newY)
      }
    } else {
      // Update cursor based on hover
      const element = this.getElementAtPoint(e.clientX, e.clientY)
      this.canvas.style.cursor = element ? 'move' : 'default'
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(e) {
    if (this.isDragging) {
      // Save state after drag ends
      this.canvasStore.saveState()
    }

    this.isDragging = false
    this.dragElementId = null
    this.canvas.style.cursor = 'default'
  }

  /**
   * Handle double click
   */
  handleDoubleClick(e) {
    e.preventDefault() // Prevent any default double-click behavior
    
    // Cancel any pending drag operations
    this.isDragging = false
    this.dragElementId = null
    
    // Use getElementAtPoint which already handles coordinate scaling
    const element = this.getElementAtPoint(e.clientX, e.clientY)
    if (element) {
      this.onElementDoubleClick?.(element.id)
    }
  }

  /**
   * Handle context menu (right click)
   */
  handleContextMenu(e) {
    e.preventDefault()

    const element = this.getElementAtPoint(e.clientX, e.clientY)
    if (element) {
      this.canvasStore.selectElement(element.id)
      this.onContextMenu?.(e.clientX, e.clientY)
    } else {
      this.canvasStore.deselectAll()
      this.onContextMenu?.(e.clientX, e.clientY)
    }
  }

  /**
   * Handle mouse wheel (for zoom)
   */
  handleWheel(e) {
    // Wheel handling removed for fixed-size page canvas
    // Can be re-enabled if zoom functionality is needed
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseup', this.handleMouseUp)
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick)
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu)
    this.canvas.removeEventListener('wheel', this.handleWheel)
  }
}

export default CanvasInteractions
