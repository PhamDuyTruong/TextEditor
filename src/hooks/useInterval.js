import { useEffect, useRef } from 'react'

/**
 * Custom hook for setInterval with proper cleanup
 * @param {Function} callback - Callback function to run on interval
 * @param {number} delay - Delay in milliseconds (null to stop)
 * 
 * @example
 * const [count, setCount] = useState(0)
 * 
 * useInterval(() => {
 *   setCount(count + 1)
 * }, 1000) // Runs every 1 second
 * 
 * // To stop: useInterval(callback, null)
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export default useInterval
