/**
 * Throttles a function. Returns a new throttled version of the
 * function that, when invoked repeatedly, will only actually
 * call the original function at most once per every `limit`
 * milliseconds.
 *
 * @param func - The function to throttle.
 * @param limit - The throttle limit in milliseconds.
 */

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export default throttle
