import PoolOverviewTabChainWrapper from '@/components/organisms/lending/OverviewTab/PoolOverviewTabChainWrapper'

import getLockPeriods from '@/actions/getLockPeriods'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

type PoolOverviewProps = {
  poolId: string
}

/**
 * Server component that fetches pool data from the default chain (Base).
 * The PoolOverviewTabChainWrapper handles chain-specific rendering:
 * - On Base: Uses server data
 * - On other chains (XDC): Fetches client-side from the correct subgraph
 */
const PoolOverviewTab: React.FC<PoolOverviewProps> = async ({ poolId }) => {
  const [poolsWithDelegate, lockPeriods, currentEpoch] = await Promise.all([
    getPoolWithDelegate(poolId),
    getLockPeriods(),
    getCurrentEpoch(),
  ])

  // Server data might be empty if poolId doesn't exist on Base (XDC pool address)
  // The chain wrapper will handle fetching the correct data client-side
  const serverPool = poolsWithDelegate[0] ?? null

  return (
    <PoolOverviewTabChainWrapper
      serverPool={serverPool}
      serverPools={poolsWithDelegate}
      poolId={poolId}
      lockPeriods={lockPeriods}
      currentEpoch={currentEpoch}
    />
  )
}

export default PoolOverviewTab
