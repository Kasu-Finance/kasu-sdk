import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { useState } from 'react'

import { ValueOf } from '@/types/utils'

const TransactionStatus = {
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  REQUESTED: 'Requested',
  ALL: 'All',
} as const

const TransactionType = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdrawal',
  ALL: 'All Transactions',
} as const

const TransactionTranches = {
  JUNIOR: 'Junior',
  MEZZANINE: 'Mezzanine',
  SENIOR: 'Senior',
  ALL: 'All Tranches',
} as const

const TransactionHistoryFilters = () => {
  const [status, setStatus] = useState<ValueOf<typeof TransactionStatus>>(
    TransactionStatus.ALL
  )

  const [type, setType] = useState<ValueOf<typeof TransactionType>>(
    TransactionType.ALL
  )

  const [trancheType, setTrancheType] = useState<
    ValueOf<typeof TransactionTranches>
  >(TransactionTranches.ALL)

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatus(e.target.value as ValueOf<typeof TransactionStatus>)
  }

  const handleTypeChange = (e: SelectChangeEvent) => {
    setType(e.target.value as ValueOf<typeof TransactionType>)
  }

  const handleTrancheChange = (e: SelectChangeEvent) => {
    setTrancheType(e.target.value as ValueOf<typeof TransactionTranches>)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControl fullWidth={true}>
          <InputLabel shrink={true} htmlFor='transaction-status-selector'>
            Status
          </InputLabel>
          <Select
            notched={true}
            value={status}
            inputProps={{
              id: 'transaction-status-selector',
            }}
            onChange={handleStatusChange}
            input={<OutlinedInput label='Status' />}
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
          <InputLabel shrink={true} htmlFor='transaction-type-selector'>
            Type
          </InputLabel>
          <Select
            notched={true}
            value={type}
            inputProps={{
              id: 'transaction-type-selector',
            }}
            onChange={handleTypeChange}
            input={<OutlinedInput label='Type' />}
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
          <InputLabel shrink={true} htmlFor='transaction-tranche-selector'>
            Tranche
          </InputLabel>
          <Select
            notched={true}
            value={trancheType}
            inputProps={{
              id: 'transaction-tranche-selector',
            }}
            onChange={handleTrancheChange}
            input={<OutlinedInput label='Tranche' />}
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
  )
}

export default TransactionHistoryFilters
