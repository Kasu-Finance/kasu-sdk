import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { TOKENS } from '@/constants/tokens'

export const getPoolData = (pool, userPoolBalance): PoolData => {
  const poolBalance = userPoolBalance
    ? formatUnits(userPoolBalance.balance || '0', TOKENS.USDC.decimals)
    : '0'

  return {
    poolName: pool.poolName,
    lendingPoolId: pool.id as `0x${string}`,
    totalUserInvestment: poolBalance,
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
