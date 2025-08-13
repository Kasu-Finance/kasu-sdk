'use client'

import { Button, Grid2 } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'

import LendButton from '@/components/atoms/LendButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendingActionsProps = {
  pools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

const LendingActions: React.FC<LendingActionsProps> = ({
  currentEpoch,
  pools,
}) => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={6}>
        <Button
          variant='outlined'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onClick={handleOpen}
        >
          Withdraw
        </Button>
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
