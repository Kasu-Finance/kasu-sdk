'use client'

import { ButtonProps, styled } from '@mui/material'
import Link from 'next/link'

export type NavItemProps = ButtonProps & {
  isActive: boolean
  href: string
}

const NavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<NavItemProps>((props) => ({
  color: props.isActive
    ? props.theme.palette.primary.main
    : props.theme.palette.text.secondary,
  borderRadius: 0,
  borderBottom: props.isActive ? '2px solid currentColor' : 'none',
  padding: props.theme.spacing(1, 2),
  textTransform: 'capitalize',
  fontFamily: 'Noto Sans Khmer,serif',
  fontWeight: 400,
  fontSize: '14px',
  textDecoration: 'none',
}))

export default NavItem
