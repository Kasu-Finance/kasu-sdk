'use client'

import { Box, Grid, SelectChangeEvent } from '@mui/material'
import React from 'react'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import useTranslation from '@/hooks/useTranslation'

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
} as const

export const TransactionTranches = {
  ALL: 'All Tranches',
  JUNIOR: 'Junior',
  MEZZANINE: 'Mezzanine',
  SENIOR: 'Senior',
} as const

type TransactionFiltersProps = {
  pools?: {
    id: string
    name: string
  }[]
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ pools }) => {
  const { t } = useTranslation()

  const {
    poolId,
    status,
    trancheType,
    transactionType,
    setPoolId,
    setStatus,
    setTrancheType,
    setTransactionType,
  } = useTransactionHistoryState()

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatus(e.target.value as ValueOf<typeof TransactionStatus>)
  }

  const handleTypeChange = (e: SelectChangeEvent) => {
    setTransactionType(e.target.value as ValueOf<typeof TransactionType>)
  }

  const handleTrancheChange = (e: SelectChangeEvent) => {
    setTrancheType(e.target.value as ValueOf<typeof TransactionTranches>)
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
              maxWidth={256}
              labelKey='name'
              valueKey='id'
            />
          </Grid>
        )}
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
        <Grid item flex={1}>
          <CustomSelect
            label='Type'
            value={transactionType}
            onChange={handleTypeChange}
            options={Object.values(TransactionType).map((val) => ({
              name: val,
              id: val,
            }))}
            labelKey='name'
            valueKey='id'
          />
        </Grid>
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
      </Grid>
    </Box>
  )
}

export default TransactionFilters
