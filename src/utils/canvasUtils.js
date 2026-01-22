/**
 * Convert screen coordinates to canvas coordinates
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {number} zoom - Current zoom level
 * @param {number} panX - Pan X offset
 * @param {number} panY - Pan Y offset
 * @returns {{x: number, y: number}} Canvas coordinates
 */
export function screenToCanvas(screenX, screenY, zoom, panX, panY) {
  return {
    x: (screenX - panX) / zoom,
    y: (screenY - panY) / zoom,
  }
}

/**
 * Convert canvas coordinates to screen coordinates
 * @param {number} canvasX - Canvas X coordinate
 * @param {number} canvasY - Canvas Y coordinate
 * @param {number} zoom - Current zoom level
 * @param {number} panX - Pan X offset
 * @param {number} panY - Pan Y offset
 * @returns {{x: number, y: number}} Screen coordinates
 */
export function canvasToScreen(canvasX, canvasY, zoom, panX, panY) {
  return {
    x: canvasX * zoom + panX,
    y: canvasY * zoom + panY,
  }
}

/**
 * Check if a point is inside a rectangle
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {number} rectX - Rectangle X
 * @param {number} rectY - Rectangle Y
 * @param {number} rectWidth - Rectangle width
 * @param {number} rectHeight - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight
}

/**
 * Calculate distance between two points
 * @param {number} x1 - Point 1 X
 * @param {number} y1 - Point 1 Y
 * @param {number} x2 - Point 2 X
 * @param {number} y2 - Point 2 Y
 * @returns {number} Distance
 */
export function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Rotate a point around a center
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {number} centerX - Center X
 * @param {number} centerY - Center Y
 * @param {number} angle - Rotation angle in degrees
 * @returns {{x: number, y: number}} Rotated point
 */
export function rotatePoint(x, y, centerX, centerY, angle) {
  const radians = (angle * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = x - centerX
  const dy = y - centerY

  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  }
}

/**
 * Get bounding box of rotated rectangle
 * @param {number} x - Rectangle X
 * @param {number} y - Rectangle Y
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {number} rotation - Rotation angle in degrees
 * @returns {{x: number, y: number, width: number, height: number}} Bounding box
 */
export function getRotatedBoundingBox(x, y, width, height, rotation) {
  if (rotation === 0) {
    return { x, y, width, height }
  }

  const corners = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height },
  ]

  const centerX = x + width / 2
  const centerY = y + height / 2

  const rotatedCorners = corners.map(corner =>
    rotatePoint(corner.x, corner.y, centerX, centerY, rotation)
  )

  const minX = Math.min(...rotatedCorners.map(p => p.x))
  const minY = Math.min(...rotatedCorners.map(p => p.y))
  const maxX = Math.max(...rotatedCorners.map(p => p.x))
  const maxY = Math.max(...rotatedCorners.map(p => p.y))

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
