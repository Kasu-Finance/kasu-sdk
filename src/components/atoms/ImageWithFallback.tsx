'use client'

import { SxProps, Theme } from '@mui/material'
import Image from 'next/image'
import { useState } from 'react'

import ImageCover from '@/components/atoms/ImageCover'

import ImagePlaceholderIcon from '@/assets/icons/general/ImagePlaceholderIcon'

const ImageWithFallback: React.FC<{
  src?: string
  alt?: string
  coverProps?: SxProps<Theme>
}> = ({ src, alt = 'Pool Image', coverProps }) => {
  const [imageError, setImageError] = useState<boolean>(false)

  return (
    <ImageCover className='image-cover' sx={coverProps}>
      {!imageError && src ? (
        <Image
          fill
          src={src}
          alt={alt}
          style={{ objectFit: 'cover' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <ImagePlaceholderIcon />
      )}
    </ImageCover>
  )
}

export default ImageWithFallback
