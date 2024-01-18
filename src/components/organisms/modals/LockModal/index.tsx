'use client'

import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import React, { useState } from 'react'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositInput from '@/components/molecules/lockModal/DepositInput'
import EstimatedReturns from '@/components/molecules/lockModal/EstimatedReturns'
import LockDurationInput from '@/components/molecules/lockModal/LockDurationInput'
import LockModalOverview from '@/components/molecules/lockModal/LockModalOverview'
import LockModalConfirmation from '@/components/organisms/modals/LockModal/LockModalConfirmation'

import { ChevronRightIcon } from '@/assets/icons'

import LOCK_PERIODS from '@/config/lockPeriod'

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState<number>(LOCK_PERIODS[2])
  const [isFinalized, setIsFinalized] = useState(false)

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
            <Button variant='outlined' onClick={() => setIsFinalized(false)}>
              ADJUST
            </Button>
            <Button variant='contained' endIcon={<ChevronRightIcon />}>
              CONFIRM
            </Button>
          </>
        ) : (
          <Button
            variant='contained'
            sx={{ width: 157, display: 'block' }}
            onClick={() => setIsFinalized(true)}
          >
            APPROVE LOCK
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default LockModal
