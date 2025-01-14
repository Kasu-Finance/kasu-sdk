'use client'

import { Box, Grid, SelectChangeEvent } from '@mui/material'
import React from 'react'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { PoolIdFilters } from '@/context/transactionHistory/transactionHistory.types'

import { capitalize } from '@/utils'

import { ValueOf } from '@/types/utils'

export const TransactionStatus = {
  ALL: 'All',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  REQUESTED: 'Requested',
} as const

export const TransactionType = {
  ALL: 'All Transactions',
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdrawal',
  REALLOCATION: 'Reallocation',
} as const

export const TransactionTranches = {
  ALL: 'All Tranches',
  SENIOR: 'Senior',
  MEZZANINE: 'Mezzanine',
  JUNIOR: 'Junior',
} as const

export const TranasctionDecisions = {
  ALL: 'All',
  CONSENT_REQUIRED: 'Opt in / Out',
}

type TransactionFiltersProps = {
  pools?: {
    id: string
    name: string
  }[]
  withReallocation?: boolean
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ pools }) => {
  const { t } = getTranslation()

  const {
    poolId,
    // status,
    trancheType,
    pendingDecision,
    setPoolId,
    // setStatus,
    setTrancheType,
    setTransactionDecisons,
  } = useTransactionHistoryState()

  // const handleStatusChange = (e: SelectChangeEvent) => {
  //   setStatus(e.target.value as ValueOf<typeof TransactionStatus>)
  // }

  const handleTrancheChange = (e: SelectChangeEvent) => {
    setTrancheType(e.target.value as ValueOf<typeof TransactionTranches>)
  }

  const handleDecisionChange = (e: SelectChangeEvent) => {
    setTransactionDecisons(
      e.target.value as ValueOf<typeof TranasctionDecisions>
    )
  }

  const handlePoolChange = (e: SelectChangeEvent) => {
    setPoolId(e.target.value as PoolIdFilters)
  }

  return (
    <Box mt={4} mb={3} px={2}>
      <Grid container spacing={4}>
        {pools && poolId && (
          <Grid item flex={1}>
            <CustomSelect
              label={capitalize(t('general.lendingStrategy'))}
              value={poolId}
              onChange={handlePoolChange}
              options={[{ id: 'All', name: 'All' }, ...pools]}
              maxWidth={544}
              labelKey='name'
              valueKey='id'
            />
          </Grid>
        )}
        {/* {!pendingDecision && (
          <Grid item flex={1}>
            <CustomSelect
              label='Status'
              value={status}
              onChange={handleStatusChange}
              options={Object.values(TransactionStatus).map((val) => ({
                name: val,
                id: val,
              }))}
              labelKey='name'
              valueKey='id'
            />
          </Grid>
        )} */}
        <Grid item flex={1}>
          <CustomSelect
            label='Tranche'
            value={trancheType}
            onChange={handleTrancheChange}
            options={Object.values(TransactionTranches).map((val) => ({
              name: val,
              id: val,
            }))}
            labelKey='name'
            valueKey='id'
          />
        </Grid>
        {pendingDecision && (
          <Grid item flex={1}>
            <CustomSelect
              label='Pending Decisions'
              value={pendingDecision}
              onChange={handleDecisionChange}
              options={Object.values(TranasctionDecisions).map((val) => ({
                name: val,
                id: val,
              }))}
              labelKey='name'
              valueKey='id'
            />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default TransactionFilters
