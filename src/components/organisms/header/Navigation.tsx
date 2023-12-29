'use client'

import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { usePathname } from 'next/navigation'
import styled from 'styled-components'

import Typography from '@/components/atoms/Typography'

import {
  StyledNavItem,
  StyledNavLink,
  StyledNavList,
  StyledNavRoot,
} from './header.style'

import { MenuItem } from '@/types/menu.items'

styled

const Navigation: React.FC<{ nav: MenuItem[] }> = (props) => {
  const pathName = usePathname()

  const { nav } = props

  return (
    <StyledNavRoot>
      <StyledNavList>
        {nav.map(({ title, href }, index) => (
          <StyledNavItem key={index}>
            <NavigationMenu.Link active={pathName === href} asChild>
              <StyledNavLink href={href}>
                <Typography variant='span'>{title}</Typography>
              </StyledNavLink>
            </NavigationMenu.Link>
          </StyledNavItem>
        ))}
      </StyledNavList>
    </StyledNavRoot>
  )
}

export default Navigation
