'use client'

import { useEffect, useState } from 'react'

// Custom hook for delaying execution
const useDelayedExecution = (delay: number): boolean => {
  const [delayed, setDelayed] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayed(true)
    }, delay)

    return () => clearTimeout(timeout)
  }, [delay])

  return delayed
}

export default useDelayedExecution
