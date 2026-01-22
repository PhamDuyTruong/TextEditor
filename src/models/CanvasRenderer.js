import { measureText, getTextAlign } from '../utils/textUtils'
import { getRotatedBoundingBox } from '../utils/canvasUtils'

/**
 * CanvasRenderer
 * Handles all canvas rendering operations
 */
class CanvasRenderer {
  constructor(canvas, context) {
    this.canvas = canvas
    this.ctx = context
    this.setupContext()
  }

  /**
   * Setup canvas context with optimal settings
   */
  setupContext() {
    // Optimize for performance
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
    // Don't read pixels frequently for better performance
    // willReadFrequently is false by default
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw background (grid or solid color)
   * @param {string} backgroundColor - Background color
   * @param {boolean} showGrid - Whether to show grid
   * @param {number} gridSize - Grid size in pixels
   */
  drawBackground(backgroundColor = '#ffffff', showGrid = false, gridSize = 20) {
    // Draw solid background
    this.ctx.fillStyle = backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw grid if enabled
    if (showGrid) {
      this.ctx.strokeStyle = '#e0e0e0'
      this.ctx.lineWidth = 1

      for (let x = 0; x <= this.canvas.width; x += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.canvas.height)
        this.ctx.stroke()
      }

      for (let y = 0; y <= this.canvas.height; y += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.canvas.width, y)
        this.ctx.stroke()
      }
    }
  }

  /**
   * Render a text element
   * @param {TextElement} element - Text element to render
   * @param {number} zoom - Current zoom level (not used for page-based, kept for compatibility)
   * @param {number} panX - Pan X offset (not used for page-based, kept for compatibility)
   * @param {number} panY - Pan Y offset (not used for page-based, kept for compatibility)
   */
  renderTextElement(element, zoom, panX, panY) {
    const ctx = this.ctx

    // Save context state
    ctx.save()

    // For page-based canvas, use direct coordinates
    const screenX = element.x
    const screenY = element.y
    const screenWidth = element.width
    const screenHeight = element.height

    // Apply rotation
    if (element.rotation !== 0) {
      const centerX = screenX + screenWidth / 2
      const centerY = screenY + screenHeight / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((element.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    // Set text properties
    ctx.font = `${element.fontSize}px ${element.fontFamily}`
    ctx.fillStyle = element.color
    ctx.textAlign = getTextAlign(element.alignment)
    ctx.textBaseline = 'top'

    // Calculate text position based on alignment
    let textX = screenX
    if (element.alignment === 'center') {
      textX = screenX + screenWidth / 2
    } else if (element.alignment === 'right') {
      textX = screenX + screenWidth
    }

    // Handle text wrapping
    const maxWidth = screenWidth
    const textMetrics = measureText(ctx, element.text, element.fontSize, element.fontFamily, maxWidth)

    // Draw text lines
    const lineHeight = element.fontSize * 1.2
    textMetrics.lines.forEach((line, index) => {
      const lineY = screenY + index * lineHeight
      ctx.fillText(line, textX, lineY, maxWidth)
    })

    // Draw selection border if selected
    if (element.selected) {
      ctx.strokeStyle = '#1976d2'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(screenX, screenY, screenWidth, screenHeight)
    }

    // Draw locked indicator if locked
    if (element.isLocked) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(screenX, screenY, screenWidth, screenHeight)
    }

    // Restore context state
    ctx.restore()
  }

  /**
   * Render all elements
   * @param {Array<TextElement>} elements - Array of text elements
   * @param {number} zoom - Current zoom level
   * @param {number} panX - Pan X offset
   * @param {number} panY - Pan Y offset
   * @param {string} backgroundColor - Background color
   * @param {boolean} showGrid - Whether to show grid
   */
  render(elements, zoom, panX, panY, backgroundColor = '#ffffff', showGrid = false) {
    // Note: zoom and pan are not used for page-based canvas, but kept for compatibility
    // Clear canvas
    this.clear()

    // Draw background
    this.drawBackground(backgroundColor, showGrid)

    // Render all elements
    elements.forEach(element => {
      this.renderTextElement(element, zoom, panX, panY)
    })
  }
}

export default CanvasRenderer
