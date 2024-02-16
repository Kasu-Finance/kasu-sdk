'use client'

import { Box, useTheme } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV_ITEMS } from '@/config/navigation'

import NavItem from '../../organisms/header/NavItem'

const Navigation: React.FC = () => {
  const pathName = usePathname()

  const theme = useTheme()

  const isActiveLink = (href: string) =>
    pathName === href || pathName.includes(href)

  return (
    <Box sx={{ display: 'flex', ml: theme.spacing(3) }}>
      {NAV_ITEMS.map((link) => (
        <NavItem
          key={link.label}
          isActive={isActiveLink(link.to)}
          href={link.to}
          disableElevation
          variant='text'
          component={Link}
        >
          {link.label}
        </NavItem>
      ))}
    </Box>
  )
}

export default Navigation
