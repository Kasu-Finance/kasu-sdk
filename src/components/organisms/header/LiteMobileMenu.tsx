'use client'

import MenuIcon from '@mui/icons-material/Menu'
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import NextLink from '@/components/atoms/NextLink'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PortfolioIcon, ReferralIcon } from '@/assets/icons'

import { BaseRoutesPaths, Routes } from '@/config/routes'

const LiteMobileMenu = () => {
  const { isLiteMode, toggleLiteMode } = useLiteModeState()
  const { address, isAuthenticated } = usePrivyAuthenticated()
  const { openModal } = useModalState()
  const pathName = usePathname()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const showRefer = useMemo(() => {
    if (!address) return false
    if (!isLiteMode) return false
    return pathName !== Routes.lending.root.url
  }, [address, isLiteMode, pathName])

  if (!isLiteMode) return null

  return (
    <>
      <IconButton
        aria-label='Open menu'
        color='primary'
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          bgcolor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
        }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            bgcolor: 'rgba(11, 11, 13, 0.72)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            '& .MuiMenuItem-root': {
              color: 'gold.dark',
              '&:hover': {
                bgcolor: 'rgba(196, 153, 108, 0.12)',
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: 36,
              color: 'gold.dark',
              '& svg path': {
                fill: 'currentColor',
              },
            },
          },
        }}
      >
        <MenuItem
          component={NextLink}
          href={BaseRoutesPaths.LENDING}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemText primary='Lending' />
        </MenuItem>
        {isAuthenticated && (
          <MenuItem
            component={NextLink}
            href={Routes.portfolio.root.url}
            onClick={() => setAnchorEl(null)}
          >
            <ListItemIcon>
              <PortfolioIcon />
            </ListItemIcon>
            <ListItemText primary='My portfolio' />
          </MenuItem>
        )}
        {showRefer && (
          <MenuItem
            onClick={() => {
              openModal({ name: ModalsKeys.REFERRAL })
              setAnchorEl(null)
            }}
          >
            <ListItemIcon>
              <ReferralIcon color='currentColor' />
            </ListItemIcon>
            <ListItemText primary='Refer to earn' />
          </MenuItem>
        )}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <MenuItem
          onClick={() => {
            toggleLiteMode()
            setAnchorEl(null)
          }}
        >
          <ListItemText primary='Switch to Kasu Pro' />
        </MenuItem>
      </Menu>
    </>
  )
}

export default LiteMobileMenu
