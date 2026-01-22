import { useState, useEffect, useRef } from 'react'

export function useThrottle(value, delay = 500) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRan = now - lastRan.current

    if (timeSinceLastRan >= delay) {
      setThrottledValue(value)
      lastRan.current = now
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }, delay - timeSinceLastRan)

      return () => clearTimeout(timeoutId)
    }
  }, [value, delay])

  return throttledValue
}

export default useThrottle
