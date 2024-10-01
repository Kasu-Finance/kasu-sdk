import { Stack } from '@mui/material'

import PoolOverview from '@/components/organisms/lending/OverviewTab/PoolOverview'
import UserLending from '@/components/organisms/lending/OverviewTab/UserLending'
import UserLoyalty from '@/components/organisms/lending/OverviewTab/UserLoyalty'
import UserTransactions from '@/components/organisms/lending/OverviewTab/UserTransactions'

import getLockPeriods from '@/actions/getLockPeriods'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

type PoolOverviewProps = {
  poolId: string
}

const PoolOverviewTab: React.FC<PoolOverviewProps> = async ({ poolId }) => {
  const [poolsWithDelegate, lockPeriods] = await Promise.all([
    getPoolWithDelegate(poolId),
    getLockPeriods(),
  ])

  return (
    <Stack spacing={3} mt={3}>
      <PoolOverview pool={poolsWithDelegate[0]} />
      <UserLending pool={poolsWithDelegate[0]} />
      <UserLoyalty
        pools={poolsWithDelegate}
        poolId={poolId}
        lockPeriods={lockPeriods}
      />
      <UserTransactions poolId={poolId} />
    </Stack>
  )
}

export default PoolOverviewTab
