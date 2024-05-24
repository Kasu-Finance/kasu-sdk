import { Box } from '@mui/material'
import Link from 'next/link'
import React from 'react'

import NavItem from '@/components/organisms/header/NavItem'

import { NAV_ITEMS } from '@/config/navigation'

interface DesktopNavigationProps {
  account: string | null
  isActiveLink: (href: string) => boolean
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  account,
  isActiveLink,
}) => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
      {NAV_ITEMS.map((link) =>
        link.accountRequired && !account ? null : (
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
        )
      )}
    </Box>
  )
}

export default DesktopNavigation
