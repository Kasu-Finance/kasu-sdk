'use client'

import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useLockKSU from '@/hooks/locking/useLockKSU'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import LockModalEdit from '@/components/organisms/modals/LockModal/LockModalEdit'
import LockModalReview from '@/components/organisms/modals/LockModal/LockModalReview'

import { LockProgress } from '@/context/lockModal/lockModal.types'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { amount, selectedLockPeriod, lockProgress, setLockProgress } =
    useLockModalState()

  const { isApproved, approve } = useApproveToken(
    sdkConfig.contracts.KSUToken,
    sdkConfig.contracts.IKSULocking,
    amount
  )

  const { balance, decimals } = useUserBalance(sdkConfig.contracts.KSUToken)

  const lockKSU = useLockKSU()

  return (
    <>
      <DialogHeader title='Lock' onClose={handleClose} />
      <DialogContent>
        {lockProgress === LockProgress.REVIEWING ? (
          <LockModalReview
            lockAmount={amount}
            selectedLockPeriod={selectedLockPeriod}
          />
        ) : lockProgress === LockProgress.EDITING ? (
          <LockModalEdit userBalance={formatUnits(balance ?? '0', decimals)} />
        ) : (
          <Typography variant='body1' component='p' display='block' px={1}>
            You have successfully queued{' '}
            <Typography variant='h6' component='span'>
              {amount} KSU
            </Typography>{' '}
            to be locked in the next Epoch.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {lockProgress === LockProgress.REVIEWING ? (
          <>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={() => setLockProgress(LockProgress.EDITING)}
            >
              {t('general.adjust')}
            </Button>
            <Button
              variant='contained'
              endIcon={<ChevronRightIcon />}
              onClick={() =>
                isApproved
                  ? lockKSU(
                      parseUnits(amount, decimals),
                      selectedLockPeriod.lockPeriod
                    )
                  : approve(amount)
              }
            >
              {isApproved ? t('general.confirm') : t('general.approve')}
            </Button>
          </>
        ) : lockProgress === LockProgress.COMPLETED ? (
          <Button variant='contained' sx={{ width: 191 }} onClick={handleClose}>
            LOCKING OVERVIEW
          </Button>
        ) : null}
      </DialogActions>
    </>
  )
}

export default LockModal
