import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'

export type PoolData = {
  poolName: string
  lendingPoolId: `0x${string}`
  totalUserInvestment: string
  tranches: {
    toolTip: string
    title: string
    trancheId: `0x${string}`
    minimumDeposit: string
    maximumDeposit: string
  }[]
}

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
