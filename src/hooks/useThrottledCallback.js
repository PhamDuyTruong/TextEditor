import { useRef, useCallback } from 'react'

/**
 * Custom hook to create a throttled callback function
 * @param {Function} callback - Callback function to throttle
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @param {Array} dependencies - Dependencies array for useCallback
 * @returns {Function} Throttled callback function
 * 
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scrolling...', window.scrollY)
 * }, 200)
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll)
 *   return () => window.removeEventListener('scroll', handleScroll)
 * }, [handleScroll])
 */
export function useThrottledCallback(callback, delay = 500, dependencies = []) {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef(null)

  return useCallback(
    (...args) => {
      const now = Date.now()
      const timeSinceLastRan = now - lastRan.current

      if (timeSinceLastRan >= delay) {
        callback(...args)
        lastRan.current = now
      } else {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set new timeout to run at the end of the delay period
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRan.current = Date.now()
        }, delay - timeSinceLastRan)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...dependencies]
  )
}

export default useThrottledCallback
