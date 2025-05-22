'use client'

import { Button } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ReferralIcon } from '@/assets/icons'

const ReferButton = () => {
  const { account } = useWeb3React()

  const { openModal } = useModalState()

  if (!account) return null

  const handleOpen = () => openModal({ name: ModalsKeys.REFERRAL })

  return (
    <Button
      variant='text'
      sx={{
        '.MuiButton-startIcon': {
          bgcolor: 'gray.extraLight',
          p: 2,
          borderRadius: '50%',
        },
        textTransform: 'unset',
        mr: 2,
      }}
      startIcon={<ReferralIcon />}
      onClick={handleOpen}
    >
      Refer to earn
    </Button>
  )
}

export default ReferButton
