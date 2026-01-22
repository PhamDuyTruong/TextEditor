import { useEffect } from 'react'
import canvasStore from '../stores/CanvasStore'

/**
 * Custom hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input or contentEditable element
      const target = e.target
      const isEditing = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.hasAttribute('contenteditable')

      // Undo: Ctrl+Z or Cmd+Z (always active)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        canvasStore.undo()
        return
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z (always active)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        canvasStore.redo()
        return
      }

      // Skip other shortcuts if user is editing text
      if (isEditing) {
        return
      }

      // Delete: Delete or Backspace (only when not editing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvasStore.hasSelection) {
        e.preventDefault()
        canvasStore.deleteSelectedElement()
        return
      }

      // Duplicate: Ctrl+D or Cmd+D (only when not editing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && canvasStore.hasSelection) {
        e.preventDefault()
        if (canvasStore.selectedElement) {
          canvasStore.duplicateElement(canvasStore.selectedElement.id)
        }
        return
      }

      // Copy: Ctrl+C or Cmd+C (only when not editing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && canvasStore.hasSelection) {
        e.preventDefault()
        // Copy functionality can be added here
        return
      }

      // Paste: Ctrl+V or Cmd+V (only when not editing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        // Paste functionality can be added here
        return
      }

      // Escape: Deselect (only when not editing)
      if (e.key === 'Escape' && canvasStore.hasSelection) {
        e.preventDefault()
        canvasStore.deselectAll()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
