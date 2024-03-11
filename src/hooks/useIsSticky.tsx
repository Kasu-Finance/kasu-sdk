import { useEffect, useState } from 'react'

import useScrollPosition from '@/hooks/useScrollPosition'

import { throttle } from '@/utils'

interface useIsStickyProps {
  elementRef: React.RefObject<HTMLDivElement>
  threshold?: number
  scrollAwayBuffer?: number
}

const useIsSticky = ({
  elementRef,
  threshold = 0,
  scrollAwayBuffer = 20,
}: useIsStickyProps): {
  isSticky: boolean
  elementRef: React.RefObject<HTMLDivElement>
} => {
  const [isSticky, setIsSticky] = useState(false)
  const scrollPosition = useScrollPosition()
  const [stickyPosition, setStickyPosition] = useState(scrollPosition.y)

  useEffect(() => {
    const checkIfShouldStick = () => {
      const distance = elementRef.current
        ? elementRef.current.getBoundingClientRect().top
        : 0
      const currentScrollY = window.scrollY

      if (!isSticky && distance <= threshold) {
        setIsSticky(true)
        setStickyPosition(currentScrollY)
      } else if (isSticky) {
        // Buffer to the stickyPosition to unstick sooner
        if (currentScrollY + scrollAwayBuffer < stickyPosition) {
          setIsSticky(false)
        }
      }
    }

    const throttledCheckIfShouldStick = throttle(checkIfShouldStick, 25)
    window.addEventListener('scroll', throttledCheckIfShouldStick)

    // Initial check
    checkIfShouldStick()

    return () => {
      window.removeEventListener('scroll', throttledCheckIfShouldStick)
    }
  }, [isSticky, stickyPosition, threshold, scrollAwayBuffer, elementRef])

  return { isSticky, elementRef }
}
export default useIsSticky
