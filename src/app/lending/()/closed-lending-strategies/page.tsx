import { Box } from '@mui/material'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'
import { Routes } from '@/config/routes'

const ClosedLendingStrategies = async () => {
  const { t } = getTranslation()

  const [poolsWithDelegate, currentEpoch] = await Promise.all([
    getPoolWithDelegate(undefined, false),
    getCurrentEpoch(),
  ])

  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.lending.root.url)}
      otherwise={
        <Box mt={3}>
          <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
            <PoolLayoutWrapper
              pools={poolsWithDelegate}
              currentEpoch={currentEpoch}
              emptyPoolsPlaceholder={
                <EmptyDataPlaceholder text={t(`home.no-data.closedPools`)} />
              }
            />
          </Suspense>
        </Box>
      }
    />
  )
}

export default ClosedLendingStrategies
