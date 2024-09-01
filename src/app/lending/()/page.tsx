// src/app/lending/page.js

import { Box } from '@mui/material'
import { Suspense } from 'react'

import EmptyPoolsPlaceholder from '@/components/organisms/home/EmptyPoolsPlaceholder'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const LendingPage = async () => {
  const poolsWithDelegate = await getPoolWithDelegate()

  return (
    <Box mt={3}>
      <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
        <PoolLayoutWrapper
          pools={poolsWithDelegate}
          emptyPoolsPlaceholder={<EmptyPoolsPlaceholder isActivePool />}
        />
      </Suspense>
    </Box>
  )
}

export default LendingPage
