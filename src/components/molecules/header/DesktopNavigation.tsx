'use client'

import { Box } from '@mui/material'
import { usePathname } from 'next/navigation'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import NavItem from '@/components/organisms/header/NavItem'

import { NAV_ITEMS } from '@/config/navigation'

const DesktopNavigation = () => {
  const pathName = usePathname()

  const { address } = usePrivyAuthenticated()

  return (
    <Box>
      {NAV_ITEMS.map((link) =>
        link.accountRequired && !address ? null : (
          <NavItem
            key={link.label}
            isActive={pathName === link.to || pathName.includes(link.to)}
            href={link.to}
          >
            {link.label}
          </NavItem>
        )
      )}
    </Box>
  )
}

export default DesktopNavigation
