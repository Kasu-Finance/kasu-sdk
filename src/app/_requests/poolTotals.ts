import { LendingTotals } from '@kasufinance/kasu-sdk/src/services/DataService/types'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getPoolOverview } from '@/app/_requests/pools'
import { SUPPORTED_CHAIN_IDS } from '@/config/chains'

// const CACHE_TTL = 1

/**
 * Aggregates lending totals across all supported chains.
 * Returns combined TVL, yield earned, and other metrics from Base, XDC, etc.
 */
export const getPoolsTotals = async (): Promise<LendingTotals> => {
  // Fetch totals from all supported chains in parallel
  const chainTotals = await Promise.all(
    SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      try {
        const sdk = await getKasuSDK(chainId)
        const pools = await getPoolOverview(undefined, chainId)
        return await sdk.DataService.getLendingTotals(pools)
      } catch (error) {
        console.warn(`Failed to fetch totals for chain ${chainId}:`, error)
        return null
      }
    })
  )

  // Aggregate totals across all chains
  const validTotals = chainTotals.filter((t): t is LendingTotals => t !== null)

  if (validTotals.length === 0) {
    return {
      totalValueLocked: 0,
      totalYieldEarned: 0,
      loansUnderManagement: 0,
      totalLoanFundsOriginated: 0,
      totalLossRate: 0,
    }
  }

  // Sum up all chain totals
  return validTotals.reduce(
    (acc, totals) => ({
      totalValueLocked: acc.totalValueLocked + totals.totalValueLocked,
      totalYieldEarned: acc.totalYieldEarned + totals.totalYieldEarned,
      loansUnderManagement:
        acc.loansUnderManagement + totals.loansUnderManagement,
      totalLoanFundsOriginated:
        acc.totalLoanFundsOriginated + totals.totalLoanFundsOriginated,
      // Weighted average loss rate (simplified - just average for now)
      totalLossRate: acc.totalLossRate + totals.totalLossRate,
    }),
    {
      totalValueLocked: 0,
      totalYieldEarned: 0,
      loansUnderManagement: 0,
      totalLoanFundsOriginated: 0,
      totalLossRate: 0,
    }
  )
}
// ['totals'],
// {
//   // use it to revalidate/flush cache with revalidateTag()
//   tags: ['totals'],
//   revalidate: CACHE_TTL,
// }
// )
