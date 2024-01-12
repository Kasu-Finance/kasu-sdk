'use client'

import Typography from '@mui/material/Typography'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { usePathname } from 'next/navigation'
import styled from 'styled-components'

import {
  StyledNavItem,
  StyledNavLink,
  StyledNavList,
  StyledNavRoot,
} from './header.style'

export type NavigationProps = {
  links: {
    to: string
    label: string
  }[]
}

styled

const Navigation: React.FC<NavigationProps> = ({ links }) => {
  const pathName = usePathname()

  return (
    <StyledNavRoot>
      <StyledNavList>
        {links.map(({ to, label }, index) => (
          <StyledNavItem key={index}>
            <NavigationMenu.Link active={pathName === to} asChild>
              <StyledNavLink href={to}>
                <Typography variant='body2'>{label}</Typography>
              </StyledNavLink>
            </NavigationMenu.Link>
          </StyledNavItem>
        ))}
      </StyledNavList>
    </StyledNavRoot>
  )
}

export default Navigation
