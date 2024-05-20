import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

export const getPoolData = (
  pool: PoolOverview,
  userPoolBalance: string
): PoolData => {
  return {
    poolName: pool.poolName,
    lendingPoolId: pool.id as `0x${string}`,
    totalUserInvestment: userPoolBalance,
    tranches: pool.tranches.map((tranche: TrancheData) => ({
      toolTip: `lending.tranche.${tranche.name.toLowerCase()}.tooltip`,
      title: tranche.name,
      trancheId: tranche.id as `0x${string}`,
      minimumDeposit: tranche.minimumDeposit,
      maximumDeposit: tranche.maximumDeposit,
    })),
  }
}

export default getPoolData
