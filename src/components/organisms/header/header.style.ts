'use client'

import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import Link from 'next/link'
import styled from 'styled-components'

import Button from '@/components/atoms/Button'

export const StyledHeader = styled.header`
  background: black;
  height: 97px;
  display: flex;
  align-items: center;
`

export const StyledNavRoot = styled(NavigationMenu.Root)`
  height: 100%;
  display: flex;
  align-items: center;

  & > div {
    height: 100%;
  }
`

export const StyledNavList = styled(NavigationMenu.List)`
  display: flex;
  align-items: center;
  color: white;
  list-style-type: none;
  height: 100%;
  margin: 0;
  padding: 0;
`

export const StyledNavItem = styled(NavigationMenu.Item)`
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 1rem;
`

export const StyledNavLink = styled(Link)`
  text-decoration: none;
  color: white;
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 0%;
    background: #3276cf;
    height: 4px;
    left: 0;
    transition: width 0.3s ease;
  }
  &[data-active]::after {
    width: 100%;
  }
`

export const StyledConnectWalletButton = styled(Button)`
  background-color: #3276cf;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 187px;
  height: 48px;
  border-radius: 4px;
  border: none;

  svg {
    margin-right: 0.5rem;
  }
`
