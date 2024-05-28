import { useCallback, useEffect, useRef, useState } from 'react'

type Timer = ReturnType<typeof setTimeout>
type SomeFunction = (...args: any[]) => void
/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delayMs The delay (in ms) for the function to return
 * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
 */

const useDebounce = <Func extends SomeFunction>(func: Func, delayMs = 1000) => {
  const timer = useRef<Timer>()

  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    return () => {
      if (!timer.current) return
      clearTimeout(timer.current)
    }
  }, [])

  // eslint-disable-next-line
  const debouncedFunction = useCallback(
    ((...args) => {
      setIsDebouncing(true)

      const newTimer = setTimeout(() => {
        func(...args)

        setIsDebouncing(false)
      }, delayMs)
      clearTimeout(timer.current)
      timer.current = newTimer
    }) as Func,
    [func]
  )

  return { debouncedFunction, isDebouncing }
}

export default useDebounce
