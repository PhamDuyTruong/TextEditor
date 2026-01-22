import { useEffect, useRef } from 'react'

/**
 * Custom hook to use requestAnimationFrame for smooth animations
 * @param {Function} callback - Callback function to run on each frame
 * @param {boolean} isRunning - Whether the animation should be running (default: true)
 * 
 * @example
 * const [position, setPosition] = useState(0)
 * 
 * useAnimationFrame(() => {
 *   setPosition(prev => prev + 1)
 * })
 */
export function useAnimationFrame(callback, isRunning = true) {
  const requestRef = useRef(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const animate = () => {
      callbackRef.current()
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isRunning])
}

/**
 * Custom hook to use requestAnimationFrame with delta time
 * @param {Function} callback - Callback function (receives deltaTime in ms)
 * @param {boolean} isRunning - Whether the animation should be running (default: true)
 * 
 * @example
 * useAnimationFrameWithDelta((deltaTime) => {
 *   // deltaTime is in milliseconds
 *   setPosition(prev => prev + (speed * deltaTime / 1000))
 * })
 */
export function useAnimationFrameWithDelta(callback, isRunning = true) {
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const animate = (time) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current
        callbackRef.current(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      previousTimeRef.current = null
    }
  }, [isRunning])
}

export default useAnimationFrame
