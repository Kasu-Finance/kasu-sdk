'use client'

import { Button, ButtonProps, styled } from '@mui/material'
import Link from 'next/link'

type NavItemProps = ButtonProps & {
  isActive: boolean
  href: string
}

const NavItem = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<NavItemProps>((props) => ({
  color: props.isActive
    ? props.theme.palette.primary.main
    : props.theme.palette.text.secondary,
  borderRadius: 0,
  borderBottom: props.isActive ? '2px solid currentColor' : 'none',
  padding: props.theme.spacing(1, 2),
  textTransform: 'uppercase',
}))

NavItem.defaultProps = {
  disableElevation: true,
  variant: 'text',
  component: Link,
}

export default NavItem
