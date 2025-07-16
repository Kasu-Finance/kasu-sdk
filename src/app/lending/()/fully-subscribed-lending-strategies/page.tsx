import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const OversubscribedLendingStrategies = async () => {
  const { t } = getTranslation()

  const [poolsWithDelegate, currentEpoch] = await Promise.all([
    getPoolWithDelegate(undefined, true, true),
    getCurrentEpoch(),
  ])

  return (
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
  )
}

export default OversubscribedLendingStrategies
