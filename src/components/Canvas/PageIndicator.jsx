import React from 'react'
import { observer } from 'mobx-react-lite'
import './PageIndicator.scss'

const PageIndicator = observer(() => {
  const currentPage = 1
  const totalPages = 1

  return (
    <div className="page-indicator">
      <div className="page-indicator__text">
        Page {currentPage}/{totalPages}
      </div>
    </div>
  )
})

export default PageIndicator
