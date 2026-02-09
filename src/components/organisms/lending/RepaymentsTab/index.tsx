import RepaymentsTabChainWrapper from '@/components/organisms/lending/RepaymentsTab/RepaymentsTabChainWrapper'

import { getRepayments } from '@/app/_requests/repayments'

type PoolDetailsProps = {
  poolId: string
}

/**
 * Server component that fetches repayment data from the default chain (Base).
 * The RepaymentsTabChainWrapper handles chain-specific rendering.
 */
const RepaymentsTab: React.FC<PoolDetailsProps> = async ({ poolId }) => {
  const repayment = await getRepayments(poolId)

  return (
    <RepaymentsTabChainWrapper
      poolId={poolId}
      serverRepayment={repayment ?? null}
    />
  )
}

export default RepaymentsTab
