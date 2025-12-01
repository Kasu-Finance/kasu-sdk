'use client'

import { IconButton } from '@mui/material'
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
    <IconButton
      sx={{
        borderRadius: 30,
        height: 48,
        width: 48,
        mr: 2,
        bgcolor: 'gold.dark',
        transition: 'width 1s ease',
        'svg path': {
          color: 'white',
        },
        '&:hover': {
          bgcolor: 'gold.extraDark',
        },
        '&:focus:before': {
          borderRadius: '50%',
          width: 'calc(100% + 6px)',
          height: 'calc(100% + 6px)',
        },
      }}
      LinkComponent={NextLink}
      href={Routes.portfolio.root.url}
    >
      <PortfolioIcon />
    </IconButton>
  )
}

export default PortfolioRedirect
