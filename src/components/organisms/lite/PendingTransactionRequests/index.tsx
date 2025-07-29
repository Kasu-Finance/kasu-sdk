'use client'

import { Box, Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'
import CountdownCard from '@/components/molecules/CountdownCard'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import PendingTransactionRequestsTableBody from '@/components/organisms/lite/PendingTransactionRequests/PendingTransactionRequestsTableBody'
import PendingTransactionRequestsTableHeader from '@/components/organisms/lite/PendingTransactionRequests/PendingTransactionRequestsTableHeader'

import { customTypography } from '@/themes/typography'
import { getPendingTransactionRequests } from '@/utils'

type PendingTransactionRequestsProps = {
  currentEpoch: string
}

const PendingTransactionRequests: React.FC<PendingTransactionRequestsProps> = ({
  currentEpoch,
}) => {
  const { nextEpochTime } = useNextEpochTime()

  const { isAuthenticated } = usePrivyAuthenticated()

  const { transactionHistory } = useTransactionHistory(currentEpoch)

  if (!transactionHistory || !isAuthenticated) return null

  const pendingTransactions = getPendingTransactionRequests(transactionHistory)

  if (!pendingTransactions.length) return null

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
          tableHeader={<PendingTransactionRequestsTableHeader />}
          tableBody={
            <PendingTransactionRequestsTableBody
              pendingTransactions={pendingTransactions}
            />
          }
        />
      </Stack>
    </WaveBox>
  )
}

export default PendingTransactionRequests
