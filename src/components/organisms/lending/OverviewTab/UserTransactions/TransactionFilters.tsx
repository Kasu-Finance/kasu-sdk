'use client'

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'

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

const TransactionFilters = () => {
  const {
    status,
    trancheType,
    transactionType,
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

  return (
    <Box mt={1} mb={3} px={2}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <FormControl fullWidth={true}>
            <InputLabel
              shrink={true}
              htmlFor='transaction-status-selector'
              sx={(theme) => ({ ...theme.typography.baseMd, ml: 1, mt: '1px' })}
            >
              Status
            </InputLabel>
            <Select
              notched={true}
              value={status}
              inputProps={{
                id: 'transaction-status-selector',
              }}
              onChange={handleStatusChange}
              input={
                <OutlinedInput
                  sx={(theme) => ({
                    borderRadius: 50,
                    '.MuiSelect-select': {
                      pl: 3,
                    },
                    '.MuiOutlinedInput-notchedOutline legend': {
                      ...theme.typography.baseXs,
                      ml: 1.5,
                      span: {
                        px: 0.25,
                      },
                    },
                  })}
                  label='Status'
                />
              }
            >
              {Object.values(TransactionStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth={true}>
            <InputLabel
              shrink={true}
              htmlFor='transaction-type-selector'
              sx={(theme) => ({ ...theme.typography.baseMd, ml: 1, mt: '1px' })}
            >
              Type
            </InputLabel>
            <Select
              notched={true}
              value={transactionType}
              inputProps={{
                id: 'transaction-type-selector',
              }}
              onChange={handleTypeChange}
              input={
                <OutlinedInput
                  label='Type'
                  sx={(theme) => ({
                    borderRadius: 50,
                    '.MuiSelect-select': {
                      pl: 3,
                    },
                    '.MuiOutlinedInput-notchedOutline legend': {
                      ...theme.typography.baseXs,
                      ml: 1.5,
                      span: {
                        px: 0.25,
                      },
                    },
                  })}
                />
              }
            >
              {Object.values(TransactionType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth={true}>
            <InputLabel
              shrink={true}
              htmlFor='transaction-tranche-selector'
              sx={(theme) => ({ ...theme.typography.baseMd, ml: 1, mt: '1px' })}
            >
              Tranche
            </InputLabel>
            <Select
              notched={true}
              value={trancheType}
              inputProps={{
                id: 'transaction-tranche-selector',
              }}
              onChange={handleTrancheChange}
              input={
                <OutlinedInput
                  label='Tranche'
                  sx={(theme) => ({
                    borderRadius: 50,
                    '.MuiSelect-select': {
                      pl: 3,
                    },
                    '.MuiOutlinedInput-notchedOutline legend': {
                      ...theme.typography.baseXs,
                      ml: 1.5,
                      span: {
                        px: 0.25,
                      },
                    },
                  })}
                />
              }
            >
              {Object.values(TransactionTranches).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TransactionFilters
