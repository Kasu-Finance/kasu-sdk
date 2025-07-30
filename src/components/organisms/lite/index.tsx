import { Grid2, Stack, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'
import LendingActions from '@/components/organisms/lite/LendingActions'
import LendingBasicStats from '@/components/organisms/lite/LendingBasicStats'
import LendingDecisionsPending from '@/components/organisms/lite/LendingDecisionsPending'
import LiteLendingPortfolio from '@/components/organisms/lite/LiteLendingPortfolio'
import PendingTransactionRequests from '@/components/organisms/lite/PendingTransactionRequests'
import RewardsBasicStats from '@/components/organisms/lite/RewardsBasicStats'

type LiteModeAppProps = {
  pools: PoolOverview[]
  currentEpoch: string
}

const LiteModeApp: React.FC<LiteModeAppProps> = ({ pools, currentEpoch }) => {
  const { t } = getTranslation()

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={8}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <Stack spacing={6.5}>
            <Stack spacing={4.5}>
              <Typography variant='h2' color='gold.dark'>
                {t('lite.lendingPortfolio.title')}
              </Typography>
              <Stack spacing={3}>
                <LendingBasicStats />
                <PendingTransactionRequests currentEpoch={currentEpoch} />
                <LendingDecisionsPending pools={pools} />
                <LiteLendingPortfolio
                  pools={pools}
                  currentEpoch={currentEpoch}
                />
                <LendingActions />
              </Stack>
            </Stack>
            <Stack spacing={3}>
              <Typography variant='h2' color='gold.dark'>
                {t('lite.rewardsPortfolio.title')}
              </Typography>
              <RewardsBasicStats />
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
