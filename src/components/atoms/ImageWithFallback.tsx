'use client'

import { SxProps, Theme } from '@mui/material'
import Image from 'next/image'
import { memo, useCallback, useState } from 'react'

import ImageCover from '@/components/atoms/ImageCover'

import ImagePlaceholderIcon from '@/assets/icons/general/ImagePlaceholderIcon'

const ImageWithFallback: React.FC<{
  src?: string
  alt?: string
  coverProps?: SxProps<Theme>
}> = ({ src, alt = 'Pool Image', coverProps }) => {
  const [imageError, setImageError] = useState<boolean>(false)

  const handleError = useCallback(() => {
    setImageError(true)
  }, [])

  return (
    <ImageCover className='image-cover' sx={coverProps}>
      {!imageError && src ? (
        <Image
          fill
          src={src}
          alt={alt}
          quality={85}
          style={{ objectFit: 'cover' }}
          onError={handleError}
        />
      ) : (
        <ImagePlaceholderIcon />
      )}
    </ImageCover>
  )
}

export default memo(ImageWithFallback)
