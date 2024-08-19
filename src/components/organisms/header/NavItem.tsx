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
    ? props.theme.palette.gold.dark
    : props.theme.palette.gray.extraDark,
  borderRadius: 0,
  borderBottom: props.isActive ? '2px solid currentColor' : 'none',
  padding: props.theme.spacing(1, 2),
  textTransform: 'capitalize',
  textDecoration: 'none',
  ...props.theme.typography.baseMd,
}))

export default NavItem
