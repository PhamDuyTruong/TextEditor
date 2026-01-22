import React, { useState } from 'react'
import Canvas from './Canvas/Canvas'
import EditorHeader from './EditorHeader'
import TextToolbar from './Toolbar/TextToolbar'
import Transformer from './Transformer'
import PageIndicator from '../components/PageIndicator'
import TextMenu from './TopToolset/TextMenu'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import '../styles/App.scss'

const App = () => {
  const [isEditing, setIsEditing] = useState(false)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div className="app-container">
      <div className="app-toolbar-wrapper">
        <EditorHeader />
      </div>
      <div className="app-canvas-wrapper">
        <PageIndicator />
        <TextToolbar />
        <Canvas isEditing={isEditing} setIsEditing={setIsEditing} />
        <TextMenu isEditing={isEditing} />
        <Transformer isEditing={isEditing} />
      </div>
    </div>
  )
}

export default App
