'use client'

import { useEffect, useState } from 'react'

const useImageError = (src: string | undefined) => {
  const [imgError, setImgError] = useState<boolean>(false)

  useEffect(() => {
    if (src) {
      const img = new Image()
      img.src = src
      img.onload = () => setImgError(false)
      img.onerror = () => setImgError(true)
    } else {
      setImgError(true)
    }
  }, [src])

  return imgError
}

export default useImageError
