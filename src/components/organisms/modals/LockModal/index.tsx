'use client'

import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import React, { useState } from 'react'

import useLockToken from '@/hooks/locking/useLockToken'
import useApproveToken from '@/hooks/web3/useApproveToken'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositInput from '@/components/molecules/lockModal/DepositInput'
import EstimatedReturns from '@/components/molecules/lockModal/EstimatedReturns'
import LockDurationInput from '@/components/molecules/lockModal/LockDurationInput'
import LockModalOverview from '@/components/molecules/lockModal/LockModalOverview'
import LockModalConfirmation from '@/components/organisms/modals/LockModal/LockModalConfirmation'

import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'

import LOCK_PERIODS from '@/config/lockPeriod'

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState<number>(LOCK_PERIODS[2])
  const [isFinalized, setIsFinalized] = useState(false)

  const { isApproved, approve } = useApproveToken(
    'tokenAddress',
    'spender',
    '10'
  )

  const lockToken = useLockToken()

  return (
    <>
      <DialogHeader title='Lock' onClose={handleClose} />
      <DialogContent sx={{ px: 3, py: 1 }}>
        {isFinalized ? (
          <LockModalConfirmation />
        ) : (
          <>
            <Box display='grid' gap={2}>
              <LockModalOverview />
              <DepositInput amount={amount} setAmount={setAmount} />
              <LockDurationInput
                duration={duration}
                setDuration={setDuration}
              />
              <EstimatedReturns />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        {isFinalized ? (
          <>
            <Button
              variant='outlined'
              startIcon={<ChevronLeftIcon />}
              onClick={() => setIsFinalized(false)}
            >
              ADJUST LOCK
            </Button>
            <Button
              variant='contained'
              endIcon={<ChevronRightIcon />}
              onClick={() =>
                isApproved
                  ? lockToken(amount, duration.toString())
                  : approve('')
              }
            >
              {isApproved ? 'CONFIRM' : 'APPROVE'}
            </Button>
          </>
        ) : (
          <Button
            variant='contained'
            sx={{ width: 157, display: 'block', textTransform: 'uppercase' }}
            onClick={() => setIsFinalized(true)}
          >
            Review Lock
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default LockModal
