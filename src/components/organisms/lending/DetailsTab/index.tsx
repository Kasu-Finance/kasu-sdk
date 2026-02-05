import DetailsTabChainWrapper from '@/components/organisms/lending/DetailsTab/DetailsTabChainWrapper'

import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'
import { getRiskManagement } from '@/app/_requests/riskManagement'

type PoolDetailsProps = {
  poolId: string
}

/**
 * Server component that fetches pool details from the default chain (Base).
 * The DetailsTabChainWrapper handles chain-specific rendering.
 */
const PoolDetailsTab: React.FC<PoolDetailsProps> = async ({ poolId }) => {
  const [poolsWithDelegate, riskManagement] = await Promise.all([
    getPoolWithDelegate(poolId),
    getRiskManagement(poolId),
  ])

  const serverPool = poolsWithDelegate[0] ?? null
  const serverRiskManagement = riskManagement ?? null

  return (
    <DetailsTabChainWrapper
      poolId={poolId}
      serverPool={serverPool}
      serverRiskManagement={serverRiskManagement}
    />
  )
}

export default PoolDetailsTab
