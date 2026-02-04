'use client'

import { Box } from '@mui/material'
import { usePathname } from 'next/navigation'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import NavItem from '@/components/organisms/header/NavItem'

import { NAV_ITEMS } from '@/config/navigation'

const DesktopNavigation = () => {
  const pathName = usePathname()
  const { address } = usePrivyAuthenticated()
  const { isLiteDeployment } = useChain()

  return (
    <Box>
      {NAV_ITEMS.map((link) => {
        // Hide account-required items if not logged in
        if (link.accountRequired && !address) return null
        // Hide Full deployment items on Lite chains
        if (link.requiresFullDeployment && isLiteDeployment) return null

        return (
          <NavItem
            key={link.label}
            isActive={pathName === link.to || pathName.includes(link.to)}
            href={link.to}
          >
            {link.label}
          </NavItem>
        )
      })}
    </Box>
  )
}

export default DesktopNavigation
