import { Stack } from '@mui/material'

import LendingRequestionTransactions from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions'
import PoolOverview from '@/components/organisms/lending/OverviewTab/PoolOverview'
import UserLending from '@/components/organisms/lending/OverviewTab/UserLending'
import UserLoyalty from '@/components/organisms/lending/OverviewTab/UserLoyalty'
import WithdrawalRequestTransactions from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions'

import getLockPeriods from '@/actions/getLockPeriods'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

type PoolOverviewProps = {
  poolId: string
}

const PoolOverviewTab: React.FC<PoolOverviewProps> = async ({ poolId }) => {
  const [poolsWithDelegate, lockPeriods, currentEpoch] = await Promise.all([
    getPoolWithDelegate(poolId),
    getLockPeriods(),
    getCurrentEpoch(),
  ])

  return (
    <Stack spacing={3} mt={3}>
      <PoolOverview pool={poolsWithDelegate[0]} currentEpoch={currentEpoch} />
      <UserLending pool={poolsWithDelegate[0]} />
      <UserLoyalty
        pools={poolsWithDelegate}
        poolId={poolId}
        currentEpoch={currentEpoch}
        lockPeriods={lockPeriods}
      />
      <LendingRequestionTransactions
        poolId={poolId}
        currentEpoch={currentEpoch}
      />
      <WithdrawalRequestTransactions
        poolId={poolId}
        currentEpoch={currentEpoch}
      />
    </Stack>
  )
}

export default PoolOverviewTab
