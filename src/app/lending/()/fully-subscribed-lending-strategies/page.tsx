import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'
import { Routes } from '@/config/routes'

const OversubscribedLendingStrategies = async () => {
  const { t } = getTranslation()

  const [poolsWithDelegate, currentEpoch] = await Promise.all([
    getPoolWithDelegate(undefined, true, true),
    getCurrentEpoch(),
  ])

  return (
    <LiteModeRenderer
      renderOnLiteMode={<RedirectHandler to={Routes.lending.root.url} />}
      otherwise={
        <Box mt={3}>
          <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
            <PoolLayoutWrapper
              pools={poolsWithDelegate}
              currentEpoch={currentEpoch}
              emptyPoolsPlaceholder={
                <EmptyDataPlaceholder
                  text={t(`home.no-data.oversubscribedPools`)}
                />
              }
            />
          </Suspense>
        </Box>
      }
    />
  )
}

export default OversubscribedLendingStrategies
