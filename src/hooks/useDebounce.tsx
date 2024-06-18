import { useCallback, useEffect, useRef, useState } from 'react'

type Timer = ReturnType<typeof setTimeout>
type SomeFunction = (...args: any[]) => void
/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delayMs The delay (in ms) for the function to return
 * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
 */

const useDebounce = (
  func: SomeFunction,
  delayMs = 1000,
  memoize: boolean = false
) => {
  const timer = useRef<Timer>()

  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    return () => {
      if (!timer.current) return
      clearTimeout(timer.current)
    }
  }, [])

  const dependency = [memoize ? func : undefined, delayMs]

  // eslint-disable-next-line
  const debouncedFunction = useCallback(
    // @ts-ignore ignore args as any
    (...args) => {
      setIsDebouncing(true)

      const newTimer = setTimeout(() => {
        func(...args)

        setIsDebouncing(false)
      }, delayMs)
      clearTimeout(timer.current)
      timer.current = newTimer
    },
    // eslint-disable-next-line
    dependency
  )

  return {
    debouncedFunction,
    isDebouncing,
  }
}

export default useDebounce
