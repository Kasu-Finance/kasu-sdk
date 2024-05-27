import { useEffect, useRef, useState } from 'react'

import useScrollPosition from '@/hooks/useScrollPosition'

import { throttle } from '@/utils'

interface useIsStickyProps {
  elementRef: React.RefObject<HTMLDivElement>
  threshold?: number
  unstickThreshold?: number
}
const useIsSticky = ({
  elementRef,
  threshold = 0,
  unstickThreshold = 20,
}: useIsStickyProps): { isSticky: boolean } => {
  const [isSticky, setIsSticky] = useState(false)
  const { y: scrollY } = useScrollPosition()
  const prevScrollY = useRef<number>(scrollY)

  useEffect(() => {
    const checkIfShouldStick = () => {
      const element = elementRef.current
      if (!element) return

      const elementOffsetFromTop = element.getBoundingClientRect().top
      const currentScrollY = window.scrollY

      if (!isSticky && elementOffsetFromTop <= threshold) {
        setIsSticky(true)
      } else if (
        isSticky &&
        currentScrollY + unstickThreshold < prevScrollY.current
      ) {
        setIsSticky(false)
      }

      prevScrollY.current = currentScrollY
    }

    const throttledCheckIfShouldStick = throttle(checkIfShouldStick, 10)
    window.addEventListener('scroll', throttledCheckIfShouldStick)

    // Initial check
    checkIfShouldStick()

    return () => {
      window.removeEventListener('scroll', throttledCheckIfShouldStick)
    }
  }, [isSticky, threshold, unstickThreshold, elementRef])

  return { isSticky }
}

export default useIsSticky
