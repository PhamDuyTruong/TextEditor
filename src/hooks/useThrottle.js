import { useState, useEffect, useRef, useCallback } from 'react'

export function useThrottle(valueOrCallback, delay = 500, dependencies = []) {
  const isFunction = typeof valueOrCallback === 'function'

  const [throttledValue, setThrottledValue] = useState(
    isFunction ? null : valueOrCallback
  )
  const lastRanValue = useRef(Date.now())

  useEffect(() => {
    if (!isFunction) {
      const now = Date.now()
      const timeSinceLastRan = now - lastRanValue.current

      if (timeSinceLastRan >= delay) {
        setThrottledValue(valueOrCallback)
        lastRanValue.current = now
      } else {
        const timeoutId = setTimeout(() => {
          setThrottledValue(valueOrCallback)
          lastRanValue.current = Date.now()
        }, delay - timeSinceLastRan)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [valueOrCallback, delay, isFunction])

  const lastRanCallback = useRef(Date.now())
  const timeoutRef = useRef(null)

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now()
      const timeSinceLastRan = now - lastRanCallback.current

      if (timeSinceLastRan >= delay) {
        valueOrCallback(...args)
        lastRanCallback.current = now
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          valueOrCallback(...args)
          lastRanCallback.current = Date.now()
        }, delay - timeSinceLastRan)
      }
    },
    [valueOrCallback, delay, ...dependencies]
  )

  return isFunction ? throttledCallback : throttledValue
}

export default useThrottle
