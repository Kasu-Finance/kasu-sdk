'use client'

import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useLockKSU from '@/hooks/locking/useLockKSU'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import LockModalEdit from '@/components/organisms/modals/LockModal/LockModalEdit'
import LockModalReview from '@/components/organisms/modals/LockModal/LockModalReview'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { amount, selectedLockPeriod } = useLockModalState()

  const { modalStatusAction, setModalStatusAction } = useModalStatusState()

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
        {modalStatusAction === ModalStatusAction.REVIEWING ? (
          <LockModalReview
            lockAmount={amount}
            selectedLockPeriod={selectedLockPeriod}
          />
        ) : modalStatusAction === ModalStatusAction.EDITING ? (
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
      {modalStatusAction !== ModalStatusAction.EDITING && (
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          {modalStatusAction === ModalStatusAction.REVIEWING ? (
            <>
              <Button
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={() => setModalStatusAction(ModalStatusAction.EDITING)}
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
          ) : (
            <Button
              variant='contained'
              sx={{ width: 191 }}
              onClick={handleClose}
            >
              LOCKING OVERVIEW
            </Button>
          )}
        </DialogActions>
      )}
    </>
  )
}

export default LockModal
