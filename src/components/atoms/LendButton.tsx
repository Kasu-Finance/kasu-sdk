'use client'

import React, { PropsWithChildren } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useCurrentEpochFtdAmount from '@/hooks/lending/useCurrentEpochFtdAmount'
import getTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendButtonProps = PropsWithChildren<{
  pool: PoolOverviewWithDelegate
  currentEpoch: string
}>

const LendButton: React.FC<LendButtonProps> = ({
  pool,
  currentEpoch,
  children,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const {
    currentEpochDepositedAmount,
    isLoading: currentEpochDepositedAmountLoading,
  } = useCurrentEpochDepositedAmount(pool.id)

  const { currentEpochFtdAmount, isLoading: currentEpochFtdAmountLoading } =
    useCurrentEpochFtdAmount(pool.id, currentEpoch)

  const handleOpen = () => {
    if (!currentEpochDepositedAmount || !currentEpochFtdAmount) {
      console.error('CurrentEpochAmount is undefined')
      return
    }

    openModal({
      name: ModalsKeys.LEND,
      pool,
      currentEpoch,
      currentEpochDepositedAmount,
      currentEpochFtdAmount,
    })
  }

  return (
    <KycButton
      variant='contained'
      sx={{ pl: 2.25, pr: 2.25, flex: 1, textTransform: 'capitalize' }}
      onKycCompleted={handleOpen}
      disabled={
        pool.isOversubscribed ||
        !pool.enabled ||
        currentEpochDepositedAmountLoading ||
        currentEpochFtdAmountLoading
      }
    >
      {children ?? t('general.lend')}
    </KycButton>
  )
}

export default LendButton
