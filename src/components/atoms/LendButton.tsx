'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk'
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
    enabled?: boolean
  }>

const LendButton: React.FC<LendButtonProps> = ({
  pools,
  pool,
  currentEpoch,
  children,
  enabled = true,
  ...rest
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const {
    currentEpochDepositedAmount,
    isLoading: currentEpochDepositedAmountLoading,
  } = useCurrentEpochDepositedAmount(
    pools ? pools.map((pool) => pool.id) : pool.id,
    { enabled }
  )

  const { currentEpochFtdAmount, isLoading: currentEpochFtdAmountLoading } =
    useCurrentEpochFtdAmount(
      pools ? pools.map((pool) => pool.id) : pool.id,
      currentEpoch,
      { enabled }
    )

  // Check if data is ready (not loading AND has data)
  const isDataReady =
    !currentEpochDepositedAmountLoading &&
    !currentEpochFtdAmountLoading &&
    currentEpochDepositedAmount !== undefined &&
    currentEpochFtdAmount !== undefined

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
      disabled={pool.isOversubscribed || !pool.enabled || !isDataReady}
      {...rest}
    >
      {children ?? t('general.lend')}
    </KycButton>
  )
}

export default LendButton
