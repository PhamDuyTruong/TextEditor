import { makeObservable, observable, action } from 'mobx'

/**
 * TextElement Model
 * Represents a text element on the canvas
 */
class TextElement {
  id
  type = 'text'
  x = 0
  y = 0
  width = 200
  height = 50
  text = 'Text'
  fontSize = 24
  color = '#000000'
  fontFamily = 'Arial'
  alignment = 'left'
  isLocked = false
  link = null
  rotation = 0
  selected = false

  constructor(data = {}) {
    makeObservable(this, {
      x: observable,
      y: observable,
      width: observable,
      height: observable,
      text: observable,
      fontSize: observable,
      color: observable,
      fontFamily: observable,
      alignment: observable,
      isLocked: observable,
      link: observable,
      rotation: observable,
      selected: observable,
      update: action,
      setPosition: action,
      setSize: action,
      setText: action,
      setFontSize: action,
      setColor: action,
      setAlignment: action,
      setLocked: action,
      setLink: action,
      setRotation: action,
      setSelected: action,
    })

    // Initialize with provided data
    Object.assign(this, {
      id: data.id || `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: data.x ?? this.x,
      y: data.y ?? this.y,
      width: data.width ?? this.width,
      height: data.height ?? this.height,
      text: data.text ?? this.text,
      fontSize: data.fontSize ?? this.fontSize,
      color: data.color ?? this.color,
      fontFamily: data.fontFamily ?? this.fontFamily,
      alignment: data.alignment ?? this.alignment,
      isLocked: data.isLocked ?? this.isLocked,
      link: data.link ?? this.link,
      rotation: data.rotation ?? this.rotation,
      selected: data.selected ?? this.selected,
    })
  }

  /**
   * Update multiple properties at once
   */
  update(updates) {
    Object.assign(this, updates)
  }

  /**
   * Set position
   */
  setPosition(x, y) {
    this.x = x
    this.y = y
  }

  /**
   * Set size
   */
  setSize(width, height) {
    this.width = width
    this.height = height
  }

  /**
   * Set text content
   */
  setText(text) {
    this.text = text
  }

  /**
   * Set font size
   */
  setFontSize(fontSize) {
    this.fontSize = fontSize
  }

  /**
   * Set text color
   */
  setColor(color) {
    this.color = color
  }

  /**
   * Set text alignment
   */
  setAlignment(alignment) {
    this.alignment = alignment
  }

  /**
   * Set locked state
   */
  setLocked(isLocked) {
    this.isLocked = isLocked
  }

  /**
   * Set link
   */
  setLink(link) {
    this.link = link
  }

  /**
   * Set rotation
   */
  setRotation(rotation) {
    this.rotation = rotation
  }

  /**
   * Set selected state
   */
  setSelected(selected) {
    this.selected = selected
  }

  /**
   * Create a copy of this element
   */
  clone() {
    return new TextElement({
      ...this,
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: this.x + 20,
      y: this.y + 20,
      selected: false,
    })
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      text: this.text,
      fontSize: this.fontSize,
      color: this.color,
      fontFamily: this.fontFamily,
      alignment: this.alignment,
      isLocked: this.isLocked,
      link: this.link,
      rotation: this.rotation,
      selected: this.selected,
    }
  }
}

export default TextElement
