import { useEffect, useState } from 'react'

interface useDistanceFromTop {
  elementRef: React.RefObject<HTMLDivElement>
}

const useDistanceFromTop = ({ elementRef }: useDistanceFromTop) => {
  const [distanceFromTop, setDistanceFromTop] = useState(0)

  useEffect(() => {
    const calculateDistance = () => {
      if (elementRef.current) {
        const topDistance =
          elementRef.current.getBoundingClientRect().top + window.scrollY
        setDistanceFromTop(topDistance)
      } else {
        // Log or handle the case where elementRef.current is null
        console.warn('elementRef.current is null')
        setDistanceFromTop(0)
      }
    }

    window.addEventListener('scroll', calculateDistance)
    calculateDistance()

    return () => window.removeEventListener('scroll', calculateDistance)
  }, [elementRef])

  return distanceFromTop
}

export default useDistanceFromTop
