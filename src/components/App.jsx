import React, { useState } from 'react'
import Canvas from './Canvas/Canvas'
import TopToolbar from './Toolbar/TopToolbar'
import FloatingTextToolbar from './Toolbar/FloatingTextToolbar'
import FloatingToolbar from './ContextMenu/FloatingToolbar'
import TransformHandles from './ContextMenu/TransformHandles'
import PageIndicator from './Canvas/PageIndicator'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import '../styles/App.scss'

const App = () => {
  const [isEditing, setIsEditing] = useState(false)
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div className="app-container">
      <div className="app-toolbar-wrapper">
        <TopToolbar />
      </div>
      <div className="app-canvas-wrapper">
        <PageIndicator />
        <FloatingTextToolbar />
        <Canvas isEditing={isEditing} setIsEditing={setIsEditing} />
        <FloatingToolbar isEditing={isEditing} />
        <TransformHandles isEditing={isEditing} />
      </div>
    </div>
  )
}

export default App
