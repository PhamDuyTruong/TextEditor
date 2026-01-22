import { useState, useEffect, useRef, useCallback } from 'react'

export function useDebounce(valueOrCallback, delay = 500, dependencies = []) {
  const isFunction = typeof valueOrCallback === 'function'

  const [debouncedValue, setDebouncedValue] = useState(
    isFunction ? null : valueOrCallback
  )

  useEffect(() => {
    if (!isFunction) {
      const timeoutId = setTimeout(() => {
        setDebouncedValue(valueOrCallback)
      }, delay)

      // Cleanup function to cancel timeout if value changes
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [valueOrCallback, delay, isFunction])

  const timeoutRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        valueOrCallback(...args)
      }, delay)
    },
    [valueOrCallback, delay, ...dependencies]
  )

  return isFunction ? debouncedCallback : debouncedValue
}

export default useDebounce
