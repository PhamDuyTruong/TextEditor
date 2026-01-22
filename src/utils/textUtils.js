/**
 * Measure text dimensions
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size
 * @param {string} fontFamily - Font family
 * @param {number} maxWidth - Maximum width (for wrapping)
 * @returns {{width: number, height: number, lines: string[]}} Text dimensions and lines
 */
export function measureText(ctx, text, fontSize, fontFamily, maxWidth = Infinity) {
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'top'

  const lines = []
  let maxLineWidth = 0

  // First, split by explicit line breaks (\n)
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    // Handle empty lines (from multiple \n or just \n alone)
    if (!paragraph || paragraph.trim() === '') {
      lines.push('') // Empty line
      continue
    }

    if (maxWidth === Infinity) {
      // No wrapping needed
      const metrics = ctx.measureText(paragraph)
      lines.push(paragraph)
      maxLineWidth = Math.max(maxLineWidth, metrics.width)
    } else {
      // Word wrap within this paragraph
      const words = paragraph.split(' ')
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine)
          maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }

      if (currentLine) {
        lines.push(currentLine)
        maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width)
      }
    }
  }

  return {
    width: maxLineWidth || 0,
    height: Math.max(lines.length * fontSize * 1.2, fontSize * 1.2),
    lines,
  }
}

/**
 * Get text alignment value for canvas
 * @param {string} alignment - Text alignment ('left', 'center', 'right', 'justify')
 * @returns {string} Canvas textAlign value
 */
export function getTextAlign(alignment) {
  switch (alignment) {
    case 'center':
      return 'center'
    case 'right':
      return 'right'
    case 'justify':
      return 'left' // Canvas doesn't support justify, use left
    default:
      return 'left'
  }
}
