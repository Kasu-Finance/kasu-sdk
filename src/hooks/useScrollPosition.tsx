import { useEffect, useState } from 'react'

import { throttle } from '@/utils'

const useScrollPosition = (throttleLimit = 100) => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = throttle(() => {
      setScrollPosition({ x: window.scrollX, y: window.scrollY })
    }, throttleLimit)

    window.addEventListener('scroll', updatePosition)
    updatePosition()

    return () => window.removeEventListener('scroll', updatePosition)
  }, [throttleLimit])

  return scrollPosition
}

export default useScrollPosition
