'use client'

import { Button } from '@mui/material'
import { usePathname } from 'next/navigation'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import NextLink from '@/components/atoms/NextLink'

import { PortfolioIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

const PortfolioRedirect = () => {
  const path = usePathname()
  const { isAuthenticated } = usePrivyAuthenticated()

  const { isLiteMode } = useLiteModeState()

  if (!isLiteMode || path !== Routes.lending.root.url || !isAuthenticated)
    return null

  return (
    <Button
      sx={{
        mr: 2,
        textTransform: 'unset',
        color: 'gold.dark',
        width: { xs: '100%', sm: 'auto' },
        '.MuiButton-startIcon': {
          bgcolor: 'gold.dark',
          p: 2,
          borderRadius: '50%',
        },
        '&:hover .MuiButton-startIcon': {
          bgcolor: 'gold.extraDark',
        },
      }}
      LinkComponent={NextLink}
      href={Routes.portfolio.root.url}
      startIcon={<PortfolioIcon />}
    >
      My portfolio
    </Button>
  )
}

export default PortfolioRedirect
