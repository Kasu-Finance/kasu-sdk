import { Box, Button } from '@mui/material'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import EstimatedReturns from '@/components/molecules/locking/LockModal/EstimatedReturns'
import LockAmountInput from '@/components/molecules/locking/LockModal/LockAmountInput'
import LockDurationInput from '@/components/molecules/locking/LockModal/LockDurationInput'
import LockModalOverview from '@/components/molecules/locking/LockModal/LockModalOverview'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { ChevronRightIcon } from '@/assets/icons'

type LockModalEditProps = {
  userBalance: string
}

const LockModalEdit: React.FC<LockModalEditProps> = ({ userBalance }) => {
  const { t } = useTranslation()

  const { amount } = useLockModalState()

  const { modalStatus, setModalStatusAction } = useModalStatusState()

  return (
    <Box
      sx={{
        backgroundColor: modalStatus.bgColor,
        transition: 'background-color 0.3s ease',
        p: 1,
      }}
    >
      <Box display='grid' gap={2}>
        <LockModalOverview balance={userBalance} />
        <LockAmountInput balance={userBalance} />
        <LockDurationInput />
        <Button
          variant='contained'
          sx={{
            width: 170,
            textTransform: 'uppercase',
            mx: 'auto',
            '& .MuiButton-endIcon': {
              ml: 1.5,
            },
            '&:disabled .MuiButton-endIcon svg path': {
              fill: 'rgba(0, 0, 0, 0.26)',
            },
          }}
          endIcon={<ChevronRightIcon />}
          onClick={() => setModalStatusAction(ModalStatusAction.REVIEWING)}
          disabled={Boolean(!amount || modalStatus.type === 'error')}
        >
          {t('modals.lock.buttons.reviewLock')}
        </Button>
        <EstimatedReturns />
      </Box>
    </Box>
  )
}

export default LockModalEdit
