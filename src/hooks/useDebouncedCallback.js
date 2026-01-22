import { useRef, useCallback, useEffect } from 'react'

export function useDebouncedCallback(callback, delay = 500, dependencies = []) {
  const timeoutRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...dependencies]
  )
}

export default useDebouncedCallback
