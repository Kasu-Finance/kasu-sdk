// src/app/lending/page.js

import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'
import LiteModeApp from '@/components/organisms/lite'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const LendingPage = async () => {
  const { t } = getTranslation()

  const [poolsWithDelegate, pools, currentEpoch] = await Promise.all([
    getPoolWithDelegate(),
    getPoolOverview(),
    getCurrentEpoch(),
  ])

  return (
    <LiteModeRenderer
      renderOnLiteMode={
        <LiteModeApp
          activePools={poolsWithDelegate}
          pools={pools}
          currentEpoch={currentEpoch}
        />
      }
      otherwise={
        <Box mt={3}>
          <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
            <PoolLayoutWrapper
              pools={poolsWithDelegate}
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
