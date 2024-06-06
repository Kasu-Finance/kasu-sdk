'use client'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
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

import sdkConfig from '@/config/sdk'
import { capitalize, formatAmount } from '@/utils'

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
      <DialogHeader
        title={`${capitalize(t('general.lock'))}`}
        onClose={handleClose}
      />
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
            {t('modals.lock.completed.description-1')}{' '}
            <Typography variant='h6' component='span'>
              {formatAmount(amount || '0')} KSU
            </Typography>{' '}
            {t('modals.lock.completed.description-2')}
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
              {t('modals.lock.completed.lockingOverview')}
            </Button>
          )}
        </DialogActions>
      )}
    </>
  )
}

export default LockModal
