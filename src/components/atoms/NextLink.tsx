import {
  Link as MuiLink,
  LinkProps as MUILinkProps,
  SxProps,
} from '@mui/material'
import Link, { LinkProps } from 'next/link'
import React from 'react'

interface NextLinkProps extends MUILinkProps, LinkProps {
  href: string
  asPath?: string
  sx?: SxProps
}

const NextLink: React.FC<NextLinkProps> = ({
  href,
  children,
  sx,
  ...linkProps
}) => (
  <MuiLink
    href={href}
    variant='body2'
    component={Link}
    sx={[{ textDecoration: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
    {...linkProps}
  >
    {children}
  </MuiLink>
)

export default NextLink
