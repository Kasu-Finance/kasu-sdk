import { Grid2, Stack, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'
import LendingActions from '@/components/organisms/lite/LendingActions'
import LendingBasicStats from '@/components/organisms/lite/LendingBasicStats'
import LendingDecisionsPending from '@/components/organisms/lite/LendingDecisionsPending'
import LiteLendingPortfolio from '@/components/organisms/lite/LiteLendingPortfolio'
import LiteLoyaltyInfo from '@/components/organisms/lite/LiteLoyaltyInfo'
import LiteReferralBonus from '@/components/organisms/lite/LiteReferralBonus'
import LockActions from '@/components/organisms/lite/LockActions'
import LockBasicStats from '@/components/organisms/lite/LockBasicStats'
import LockingRewards from '@/components/organisms/lite/LockingRewards'
import NftRewards from '@/components/organisms/lite/NftRewards'
import PendingTransactionRequests from '@/components/organisms/lite/PendingTransactionRequests'
import RewardsBasicStats from '@/components/organisms/lite/RewardsBasicStats'

import PoolAccordion from './PoolAccordion'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteModeAppProps = {
  pools: PoolOverview[]
  lockPeriods: LockPeriod[]
  activePools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

const LiteModeApp: React.FC<LiteModeAppProps> = ({
  pools,
  currentEpoch,
  lockPeriods,
  activePools,
}) => {
  const { t } = getTranslation()

  return (
    <Grid2 container spacing={3} alignItems='stretch'>
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
                <LendingActions
                  pools={activePools}
                  currentEpoch={currentEpoch}
                />
              </Stack>
            </Stack>
            <Stack spacing={3}>
              <Typography variant='h2' color='gold.dark'>
                {t('lite.rewardsPortfolio.title')}
              </Typography>
              <Stack spacing={5}>
                <RewardsBasicStats />
                <LockingRewards />
                <NftRewards />
                <LiteReferralBonus />
              </Stack>
            </Stack>
          </Stack>
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2} height='100%'>
          <Stack spacing={4}>
            <Typography
              textAlign='center'
              maxWidth={330}
              variant='h3'
              color='gold.dark'
              mt={0.5}
            >
              {t('lite.buyAndLock.title')}
            </Typography>
            <Stack>
              <LockBasicStats />
              <LockActions lockPeriods={lockPeriods} />
            </Stack>
            <LiteLoyaltyInfo />
            <PoolAccordion pools={activePools} currentEpoch={currentEpoch} />
          </Stack>
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default LiteModeApp
