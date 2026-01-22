import { makeObservable, observable, action, computed, runInAction } from 'mobx'
import TextElement from '../models/TextElement'
import HistoryStore from './HistoryStore'

/**
 * CanvasStore
 * Manages canvas state and text elements
 */
class CanvasStore {
  elements = []
  selectedElementId = null
  zoom = 1
  panX = 0
  panY = 0
  historyStore = new HistoryStore()
  // Canvas page settings - Fixed size
  pageWidth = 1080
  pageHeight = 1080
  backgroundColor = '#ffffff'

  constructor() {
    makeObservable(this, {
      elements: observable,
      selectedElementId: observable,
      zoom: observable,
      panX: observable,
      panY: observable,
      backgroundColor: observable,
      pageWidth: observable,
      pageHeight: observable,
      selectedElement: computed,
      hasSelection: computed,
      addElement: action,
      removeElement: action,
      updateElement: action,
      selectElement: action,
      deselectAll: action,
      duplicateElement: action,
      toggleLockElement: action,
      deleteSelectedElement: action,
      setZoom: action,
      setPan: action,
      setBackgroundColor: action,
      setPageSize: action,
      saveState: action,
      restoreState: action,
      undo: action,
      redo: action,
    })

    // Initialize with a default text element for testing
    this.addElement(new TextElement({ x: 100, y: 100, text: 'Double click to edit' }))
  }

  /**
   * Get currently selected element
   */
  get selectedElement() {
    return this.elements.find(el => el.id === this.selectedElementId) || null
  }

  /**
   * Check if any element is selected
   */
  get hasSelection() {
    return this.selectedElementId !== null
  }

  /**
   * Add a new element to canvas
   * @param {TextElement} element - Element to add
   */
  addElement(element) {
    this.elements.push(element)
    this.saveState()
  }

  /**
   * Remove an element from canvas
   * @param {string} elementId - ID of element to remove
   */
  removeElement(elementId) {
    const index = this.elements.findIndex(el => el.id === elementId)
    if (index !== -1) {
      this.elements.splice(index, 1)
      if (this.selectedElementId === elementId) {
        this.selectedElementId = null
      }
      this.saveState()
    }
  }

  /**
   * Update an element
   * @param {string} elementId - ID of element to update
   * @param {Object} updates - Properties to update
   */
  updateElement(elementId, updates) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      element.update(updates)
      this.saveState()
    }
  }

  /**
   * Select an element
   * @param {string|null} elementId - ID of element to select, or null to deselect
   */
  selectElement(elementId) {
    // Deselect all elements first
    this.elements.forEach(el => el.setSelected(false))

    if (elementId) {
      const element = this.elements.find(el => el.id === elementId)
      if (element && !element.isLocked) {
        element.setSelected(true)
        this.selectedElementId = elementId
      }
    } else {
      this.selectedElementId = null
    }
  }

  /**
   * Deselect all elements
   */
  deselectAll() {
    this.elements.forEach(el => el.setSelected(false))
    this.selectedElementId = null
  }

  /**
   * Duplicate selected element
   */
  duplicateElement(elementId) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      const clone = element.clone()
      this.addElement(clone)
      this.selectElement(clone.id)
    }
  }

  /**
   * Toggle lock state of an element
   * @param {string} elementId - ID of element
   */
  toggleLockElement(elementId) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      element.setLocked(!element.isLocked)
      if (element.isLocked) {
        element.setSelected(false)
        if (this.selectedElementId === elementId) {
          this.selectedElementId = null
        }
      }
      this.saveState()
    }
  }

  /**
   * Delete selected element
   */
  deleteSelectedElement() {
    if (this.selectedElementId) {
      this.removeElement(this.selectedElementId)
    }
  }

  /**
   * Set zoom level
   * @param {number} zoom - Zoom level (1 = 100%)
   */
  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(5, zoom))
  }

  /**
   * Set pan offset
   * @param {number} panX - X offset
   * @param {number} panY - Y offset
   */
  setPan(panX, panY) {
    this.panX = panX
    this.panY = panY
  }

  /**
   * Set background color
   * @param {string} color - Background color (hex)
   */
  setBackgroundColor(color) {
    this.backgroundColor = color
    this.saveState()
  }

  /**
   * Set page size
   * @param {number} width - Page width
   * @param {number} height - Page height
   */
  setPageSize(width, height) {
    this.pageWidth = width
    this.pageHeight = height
    this.saveState()
  }

  /**
   * Save current state to history
   */
  saveState() {
    const state = {
      elements: this.elements.map(el => el.toJSON()),
      selectedElementId: this.selectedElementId,
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY,
      backgroundColor: this.backgroundColor,
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
    }
    this.historyStore.pushState(state)
  }

  /**
   * Restore state from snapshot
   * @param {Object} state - State to restore
   */
  restoreState(state) {
    runInAction(() => {
      this.elements = state.elements.map(elData => new TextElement(elData))
      this.selectedElementId = state.selectedElementId
      this.zoom = state.zoom
      this.panX = state.panX
      this.panY = state.panY
      this.backgroundColor = state.backgroundColor ?? this.backgroundColor
      this.pageWidth = state.pageWidth ?? this.pageWidth
      this.pageHeight = state.pageHeight ?? this.pageHeight
    })
  }

  /**
   * Undo last action
   */
  undo() {
    const state = this.historyStore.undo()
    if (state) {
      this.restoreState(state)
    }
  }

  /**
   * Redo last undone action
   */
  redo() {
    const state = this.historyStore.redo()
    if (state) {
      this.restoreState(state)
    }
  }
}

// Create singleton instance
const canvasStore = new CanvasStore()

export default canvasStore
