'use client'

import { Grid2 } from '@mui/material'
import React from 'react'

import LendButton from '@/components/atoms/LendButton'
import WithdrawButton from '@/components/organisms/lending/OverviewTab/UserLending/WithdrawButton'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendingActionsProps = {
  pools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

const LendingActions: React.FC<LendingActionsProps> = ({
  currentEpoch,
  pools,
}) => {
  return (
    <Grid2 container spacing={3}>
      <Grid2 size={6}>
        <WithdrawButton variant='outlined' pool={pools[0]} pools={pools} />
      </Grid2>
      <Grid2 size={6}>
        <LendButton
          currentEpoch={currentEpoch}
          pool={pools[0]}
          pools={pools}
          fullWidth
        />
      </Grid2>
    </Grid2>
  )
}

export default LendingActions
