import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

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

const TransactionHistoryFilters = () => {
  const currentDevice = useDeviceDetection()

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
    <Grid
      container
      spacing={2}
      columns={currentDevice === Device.MOBILE ? 4 : 12}
      mt={currentDevice === Device.MOBILE ? 1 : 0}
    >
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
            size={currentDevice === Device.MOBILE ? 'small' : undefined}
          >
            {Object.values(TransactionStatus).map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{
                  minHeight: currentDevice === Device.MOBILE ? 30 : undefined,
                }}
              >
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
            value={transactionType}
            inputProps={{
              id: 'transaction-type-selector',
            }}
            onChange={handleTypeChange}
            input={<OutlinedInput label='Type' />}
            size={currentDevice === Device.MOBILE ? 'small' : undefined}
          >
            {Object.values(TransactionType).map((type) => (
              <MenuItem
                key={type}
                value={type}
                sx={{
                  minHeight: currentDevice === Device.MOBILE ? 30 : undefined,
                }}
              >
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
            size={currentDevice === Device.MOBILE ? 'small' : undefined}
          >
            {Object.values(TransactionTranches).map((type) => (
              <MenuItem
                key={type}
                value={type}
                sx={{
                  minHeight: currentDevice === Device.MOBILE ? 30 : undefined,
                }}
              >
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
