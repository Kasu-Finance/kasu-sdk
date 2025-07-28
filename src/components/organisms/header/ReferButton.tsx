'use client'

import { Button } from '@mui/material'
import { useAccount } from 'wagmi'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ReferralIcon } from '@/assets/icons'

const ReferButton = () => {
  const { address } = useAccount()

  const { openModal } = useModalState()

  const { isLiteMode } = useLiteModeState()

  if (!address) return null

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
      }}
      startIcon={<ReferralIcon color={isLiteMode ? 'white' : undefined} />}
      onClick={handleOpen}
    >
      Refer to earn
    </Button>
  )
}

export default ReferButton
