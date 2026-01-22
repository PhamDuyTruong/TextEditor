import { makeObservable, observable, action, computed } from 'mobx'

/**
 * HistoryStore
 * Manages undo/redo functionality
 */
class HistoryStore {
  history = []
  currentIndex = -1
  maxHistorySize = 50

  constructor() {
    makeObservable(this, {
      history: observable,
      currentIndex: observable,
      canUndo: computed,
      canRedo: computed,
      pushState: action,
      undo: action,
      redo: action,
      clear: action,
    })
  }

  /**
   * Check if undo is possible
   */
  get canUndo() {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is possible
   */
  get canRedo() {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Push a new state to history
   * @param {Object} state - State snapshot to save
   */
  pushState(state) {
    // Remove any states after current index (when undoing then making new changes)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(state))) // Deep clone

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  /**
   * Undo last action
   * @returns {Object|null} Previous state or null if can't undo
   */
  undo() {
    if (!this.canUndo) {
      return null
    }

    this.currentIndex--
    return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
  }

  /**
   * Redo last undone action
   * @returns {Object|null} Next state or null if can't redo
   */
  redo() {
    if (!this.canRedo) {
      return null
    }

    this.currentIndex++
    return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
  }

  /**
   * Clear history
   */
  clear() {
    this.history = []
    this.currentIndex = -1
  }
}

export default HistoryStore
