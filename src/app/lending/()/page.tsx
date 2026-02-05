// src/app/lending/page.js

import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import PoolLayoutChainWrapper from '@/components/organisms/home/PoolLayoutChainWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'
import LiteHomeChainWrapper from '@/components/organisms/lite/LiteHomeChainWrapper'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const LendingPage = async () => {
  const { t } = getTranslation()

  const [poolsWithDelegate, poolOverviews, currentEpoch] = await Promise.all([
    getPoolWithDelegate(),
    getPoolOverview(),
    getCurrentEpoch(),
  ])

  return (
    <LiteModeRenderer
      renderOnLiteMode={
        <LiteHomeChainWrapper
          serverPools={poolsWithDelegate}
          serverPortfolioPools={poolOverviews}
          currentEpoch={currentEpoch}
        />
      }
      otherwise={
        <Box mt={3}>
          <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
            <PoolLayoutChainWrapper
              serverPools={poolsWithDelegate}
              currentEpoch={currentEpoch}
              emptyPoolsPlaceholder={
                <EmptyDataPlaceholder text={t('home.no-data.activePools')} />
              }
            />
          </Suspense>
        </Box>
      }
    />
  )
}

export default LendingPage
