export function screenToCanvas(screenX, screenY, zoom, panX, panY) {
  return {
    x: (screenX - panX) / zoom,
    y: (screenY - panY) / zoom,
  }
}

export function canvasToScreen(canvasX, canvasY, zoom, panX, panY) {
  return {
    x: canvasX * zoom + panX,
    y: canvasY * zoom + panY,
  }
}

export function isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight
}

export function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

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
