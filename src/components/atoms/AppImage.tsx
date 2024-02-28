import Image, { ImageProps as NextImageProps } from 'next/image'
import { CSSProperties, FC } from 'react'

interface ImageProps extends NextImageProps {
  src: string
  alt: string
  style?: CSSProperties
}

const AppImage: FC<ImageProps> = ({ src, alt, style, ...props }) => (
  <Image src={src} alt={alt} style={style} {...props} />
)

export default AppImage
