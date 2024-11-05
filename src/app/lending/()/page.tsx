// src/app/lending/page.js

import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const LendingPage = async () => {
  const { t } = getTranslation()

  const poolsWithDelegate = await getPoolWithDelegate()

  return (
    <Box mt={3}>
      <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
        <PoolLayoutWrapper
          pools={poolsWithDelegate}
          emptyPoolsPlaceholder={
            <EmptyDataPlaceholder text={t('home.no-data.activePools')} />
          }
        />
      </Suspense>
    </Box>
  )
}

export default LendingPage
