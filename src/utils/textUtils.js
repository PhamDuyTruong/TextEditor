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
    height: Math.max(lines.length * fontSize * 1.1, fontSize * 1.1),  // Reduced from 1.2 to 1.15 for tighter fit
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
      return 'left'
    default:
      return 'left'
  }
}

export function measureTextDimensions(text, fontSize, fontFamily = 'Arial') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const measurements = measureText(ctx, text, fontSize, fontFamily, Infinity)
  
  // Minimal padding for tight fit
  const paddingX = 20
  const paddingY = 4  // Reduced from 10 to 4 for tighter height fit
  
  return {
    width: Math.max(100, measurements.width + paddingX),
    height: measurements.height + paddingY
  }
}
