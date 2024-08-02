'use client'

import { Box } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { usePathname } from 'next/navigation'

import NavItem from '@/components/organisms/header/NavItem'

import { NAV_ITEMS } from '@/config/navigation'

const DesktopNavigation = () => {
  const pathName = usePathname()

  const { account } = useWeb3React()

  return (
    <Box>
      {NAV_ITEMS.map((link) =>
        link.accountRequired && !account ? null : (
          <NavItem
            key={link.label}
            isActive={pathName === link.to || pathName.includes(link.to)}
            href={link.to}
            prefetch
          >
            {link.label}
          </NavItem>
        )
      )}
    </Box>
  )
}

export default DesktopNavigation
