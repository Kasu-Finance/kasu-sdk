import { Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'
import BasicStats from '@/components/organisms/lite/BasicStats'
import LendingDecisionsPending from '@/components/organisms/lite/LendingDecisionsPending'
import PendingTransactionRequests from '@/components/organisms/lite/PendingTransactionRequests'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteModeAppProps = {
  pools: PoolOverviewWithDelegate[]
}

const LiteModeApp: React.FC<LiteModeAppProps> = ({ pools }) => {
  const { t } = getTranslation()

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={8}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <Stack spacing={4.5}>
            <Typography variant='h2' color='gold.dark'>
              {t('lite.lendingPortfolio.title')}
            </Typography>
            <Stack spacing={3}>
              <BasicStats />
              <PendingTransactionRequests />
              <LendingDecisionsPending pools={pools} />
            </Stack>
          </Stack>
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <Typography color='white'>world</Typography>
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default LiteModeApp
