'use client'

import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useState } from 'react'

import useLockToken from '@/hooks/locking/useLockToken'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositInput from '@/components/molecules/lockModal/DepositInput'
import EstimatedReturns from '@/components/molecules/lockModal/EstimatedReturns'
import LockDurationInput from '@/components/molecules/lockModal/LockDurationInput'
import LockModalOverview from '@/components/molecules/lockModal/LockModalOverview'
import LockModalConfirmation from '@/components/organisms/modals/LockModal/LockModalConfirmation'

import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'

import LOCK_PERIODS from '@/config/lockPeriod'
import sdkConfig from '@/config/sdk'

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState<number>(LOCK_PERIODS[2])
  const [isFinalized, setIsFinalized] = useState(false)

  const { isApproved, approve } = useApproveToken(
    sdkConfig.contracts.KSUToken,
    sdkConfig.contracts.IKSULocking,
    amount
  )

  const { balance, decimals } = useUserBalance(sdkConfig.contracts.KSUToken)
  const userBalance = formatUnits(balance ?? '0', decimals)
  const lockToken = useLockToken()
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader title='Lock' onClose={handleClose} />
      <DialogContent sx={{ px: 3, py: 1 }}>
        {isFinalized ? (
          <LockModalConfirmation lockAmount={amount} />
        ) : (
          <>
            <Box display='grid' gap={2}>
              <LockModalOverview balance={userBalance} />
              <DepositInput
                balance={userBalance}
                amount={amount}
                setAmount={setAmount}
              />
              <LockDurationInput
                duration={duration}
                setDuration={setDuration}
              />
              <EstimatedReturns amount={amount} />
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
              {t('modals.lock.buttons.adjustLock')}
            </Button>
            <Button
              variant='contained'
              endIcon={<ChevronRightIcon />}
              onClick={() =>
                isApproved
                  ? lockToken(parseUnits(amount, decimals), duration.toString())
                  : approve('')
              }
            >
              {isApproved ? t('general.confirm') : t('general.approve')}
            </Button>
          </>
        ) : (
          <Button
            variant='contained'
            sx={{ width: 157, display: 'block', textTransform: 'uppercase' }}
            onClick={() => setIsFinalized(true)}
          >
            {t('modals.lock.buttons.reviewLock')}
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default LockModal
