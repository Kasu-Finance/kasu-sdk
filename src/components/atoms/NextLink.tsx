import { SxProps, Typography, TypographyProps } from '@mui/material'
import Link from 'next/link'
import React from 'react'

interface NextLinkProps extends TypographyProps {
  href: string
  asPath?: string
  sx?: SxProps
}

const NextLink: React.FC<NextLinkProps> = ({
  href,
  asPath,
  children,
  sx,
  ...typographyProps
}) => (
  <Link href={href} as={asPath} passHref style={{ textDecoration: 'none' }}>
    <Typography component='a' variant='body2' sx={sx} {...typographyProps}>
      {children}
    </Typography>
  </Link>
)

export default NextLink
