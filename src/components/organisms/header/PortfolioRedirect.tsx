'use client'

import WorkIcon from '@mui/icons-material/Work'
import { IconButton } from '@mui/material'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import NextLink from '@/components/atoms/NextLink'

import { Routes } from '@/config/routes'

const PortfolioRedirect = () => {
  const path = usePathname()

  const { isLiteMode } = useLiteModeState()

  const [initialDeposit, setInitialDeposit] = useState<boolean | undefined>()

  useEffect(() => {
    if (
      typeof localStorage !== 'undefined' &&
      typeof initialDeposit === 'undefined'
    ) {
      const initialState = localStorage.getItem('KASU_INITIAL_DEPOSIT')

      if (!initialState) {
        localStorage.setItem('KASU_INITIAL_DEPOSIT', 'false')
        setInitialDeposit(false)
        return
      }

      setInitialDeposit(initialState === 'true')
    }
  }, [initialDeposit])

  if (!initialDeposit || !isLiteMode || path !== Routes.lending.root.url)
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
      <WorkIcon />
    </IconButton>
  )
}

export default PortfolioRedirect
