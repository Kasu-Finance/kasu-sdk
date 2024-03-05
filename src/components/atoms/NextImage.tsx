import Image, { ImageProps as NextImageProps } from 'next/image'
import React, { CSSProperties } from 'react'

interface ImageProps extends NextImageProps {
  src: string
  alt: string
  style?: CSSProperties
}

const NextImage: React.FC<ImageProps> = ({ src, alt, style, ...props }) => (
  <Image src={src} alt={alt} style={style} {...props} />
)

export default NextImage
