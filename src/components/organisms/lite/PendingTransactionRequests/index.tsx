'use client'

import {
  Box,
  Grid2,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'
import CountdownCard from '@/components/molecules/CountdownCard'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const PendingTransactionRequests = () => {
  const { nextEpochTime } = useNextEpochTime()

  return (
    <WaveBox variant='dark-middle' borderRadius={4} p={2}>
      <Stack spacing={2}>
        <Grid2 container spacing={4} pb={2}>
          <Grid2 size={7.5}>
            <Stack justifyContent='space-between' height='100%'>
              <Typography variant='h4' color='white'>
                Pending Transaction Requests
              </Typography>
              <Typography variant='baseSm' color='white'>
                The outcomes of lending and withdrawal requests will be
                determined at the end of each 7-day epoch
              </Typography>
            </Stack>
          </Grid2>
          <Grid2 size={4.5}>
            <Stack spacing={1.5}>
              <Box display='flex' alignItems='center'>
                <Typography variant='h5' color='white'>
                  Epoch Countdown
                </Typography>
                <ToolTip
                  title='info'
                  iconSx={{
                    color: 'gold.dark',
                    '&:hover': {
                      color: 'gold.extraDark',
                    },
                  }}
                />
              </Box>
              <CountdownCard
                time={nextEpochTime}
                gap={0.75}
                justifyContent='space-between'
                labelProps={{
                  variant: 'baseXsBold',
                  color: 'gray.extraDark',
                }}
                cardProps={{
                  width: 30,
                  height: 57,
                  sx: {
                    '.MuiTypography-root': {
                      ...customTypography.h4,
                    },
                  },
                }}
                separatorProps={{
                  sx: {
                    '.MuiBox-root': {
                      width: 4,
                      height: 4,
                    },
                  },
                }}
              />
            </Stack>
          </Grid2>
        </Grid2>
        <LiteModeTable
          tableHeader={
            <>
              <TableRow
                sx={{
                  '.MuiTableCell-root': {
                    py: 1,
                  },
                }}
              >
                <TableCell>Lending Strategy</TableCell>
                <TableCell align='right'>Tranche</TableCell>
                <TableCell align='right'>Request Type</TableCell>
                <TableCell align='right'>Requested</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} padding='none'>
                  <DottedDivider />
                </TableCell>
              </TableRow>
            </>
          }
          tableBody={
            <>
              <TableRow sx={{ '.MuiTableCell-root': { py: 1 } }}>
                <TableCell>Whole Ledger Funding</TableCell>
                <TableCell align='right'>Junior</TableCell>
                <TableCell align='right'>Withdrawal</TableCell>
                <TableCell align='right'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} padding='none'>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow sx={{ '.MuiTableCell-root': { py: 1 } }}>
                <TableCell>Whole Ledger Funding</TableCell>
                <TableCell align='right'>Junior</TableCell>
                <TableCell align='right'>Withdrawal</TableCell>
                <TableCell align='right'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} padding='none'>
                  <DottedDivider />
                </TableCell>
              </TableRow>
            </>
          }
        />
      </Stack>
    </WaveBox>
  )
}

export default PendingTransactionRequests
