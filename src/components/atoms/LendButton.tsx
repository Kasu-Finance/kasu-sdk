'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { ButtonProps } from '@mui/material'
import React, { PropsWithChildren } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useCurrentEpochFtdAmount from '@/hooks/lending/useCurrentEpochFtdAmount'
import getTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendButtonProps = ButtonProps &
  PropsWithChildren<{
    pools?: PoolOverview[]
    pool: PoolOverviewWithDelegate
    currentEpoch: string
  }>

const LendButton: React.FC<LendButtonProps> = ({
  pools,
  pool,
  currentEpoch,
  children,
  ...rest
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const {
    currentEpochDepositedAmount,
    isLoading: currentEpochDepositedAmountLoading,
  } = useCurrentEpochDepositedAmount(
    pools ? pools.map((pool) => pool.id) : pool.id
  )

  const { currentEpochFtdAmount, isLoading: currentEpochFtdAmountLoading } =
    useCurrentEpochFtdAmount(
      pools ? pools.map((pool) => pool.id) : pool.id,
      currentEpoch
    )

  const handleOpen = () => {
    if (!currentEpochDepositedAmount || !currentEpochFtdAmount) {
      console.error('CurrentEpochAmount is undefined')
      return
    }

    openModal({
      name: ModalsKeys.LEND,
      pool,
      pools,
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
      {...rest}
    >
      {children ?? t('general.lend')}
    </KycButton>
  )
}

export default LendButton
