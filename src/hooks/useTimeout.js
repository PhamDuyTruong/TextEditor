import { useEffect, useRef } from 'react'

/**
 * Custom hook for setTimeout with proper cleanup
 * @param {Function} callback - Callback function to run after delay
 * @param {number} delay - Delay in milliseconds (null to cancel)
 * 
 * @example
 * const [showMessage, setShowMessage] = useState(false)
 * 
 * useTimeout(() => {
 *   setShowMessage(false)
 * }, showMessage ? 3000 : null) // Hide after 3 seconds
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      const id = setTimeout(tick, delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

export default useTimeout
