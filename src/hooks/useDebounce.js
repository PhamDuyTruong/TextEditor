import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce a value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} Debounced value
 * 
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * 
 * useEffect(() => {
 *   // This will only run 500ms after user stops typing
 *   fetchSearchResults(debouncedSearchTerm)
 * }, [debouncedSearchTerm])
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function to cancel timeout if value changes
    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
