import { Stack } from '@mui/material'

import PoolOverview from '@/components/organisms/lending/OverviewTab/PoolOverview'
import UserLending from '@/components/organisms/lending/OverviewTab/UserLending'
import UserLoyalty from '@/components/organisms/lending/OverviewTab/UserLoyalty'
import UserTransactions from '@/components/organisms/lending/OverviewTab/UserTransactions'

import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

type PoolOverviewProps = {
  poolId: string
}

const PoolOverviewTab: React.FC<PoolOverviewProps> = async ({ poolId }) => {
  const poolsWithDelegate = await getPoolWithDelegate(poolId)

  return (
    <Stack spacing={3} mt={3}>
      <PoolOverview pool={poolsWithDelegate[0]} />
      <UserLending pool={poolsWithDelegate[0]} />
      <UserLoyalty poolId={poolId} />
      <UserTransactions />
    </Stack>
  )
}

export default PoolOverviewTab
