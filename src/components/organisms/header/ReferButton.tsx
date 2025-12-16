'use client'

import { Button } from '@mui/material'
import { usePathname } from 'next/navigation'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ReferralIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

const ReferButton = () => {
  const { address } = usePrivyAuthenticated()

  const pathName = usePathname()

  const { openModal } = useModalState()

  const { isLiteMode } = useLiteModeState()

  if (!address || (isLiteMode && pathName === Routes.lending.root.url)) {
    return null
  }

  const handleOpen = () => openModal({ name: ModalsKeys.REFERRAL })

  return (
    <Button
      variant='text'
      sx={{
        '.MuiButton-startIcon': {
          bgcolor: isLiteMode ? 'gold.dark' : 'gray.extraLight',
          p: 2,
          borderRadius: '50%',
        },
        textTransform: 'unset',
        mr: 2,
        width: { xs: '100%', sm: 'auto' },
      }}
      startIcon={<ReferralIcon color={isLiteMode ? 'white' : undefined} />}
      onClick={handleOpen}
    >
      Refer to earn
    </Button>
  )
}

export default ReferButton
