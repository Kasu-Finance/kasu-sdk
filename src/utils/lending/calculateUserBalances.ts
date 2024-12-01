import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import { UserTrancheBalance } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { BigNumber, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

import hexToUSD from '@/utils/hexToUSD'
import toBigNumber from '@/utils/toBigNumber'

interface Tranche {
  id: string
}

export interface TrancheWithUserBalance extends Tranche {
  yieldEarned: number
  apy: string
  name: string
  balance?: BigNumber
}

export const calculateWithdrawSummary = (
  trancheBalances: (TrancheData & {
    balanceData: UserTrancheBalance
  })[]
) => {
  return trancheBalances.reduce(
    (acc, cur) => {
      acc.totalYieldEarned += acc.totalYieldEarned + cur.balanceData.yieldEarned

      acc.totalInvested = acc.totalInvested.add(
        toBigNumber(cur.balanceData.balance)
      )

      acc.totalAvailableToWithdraw = acc.totalAvailableToWithdraw.add(
        cur.balanceData.availableToWithdraw
      )

      return acc
    },
    {
      totalInvested: ethers.constants.Zero,
      totalAvailableToWithdraw: ethers.constants.Zero,
      totalYieldEarned: 0,
    }
  )
}

export const calculateUserLendingSummary = (
  trancheBalances: (TrancheData & {
    balanceData: UserTrancheBalance
  })[],
  currentFtdBalance: Map<string, number[]>
) => {
  const result = trancheBalances.reduce(
    (acc, cur) => {
      acc.totalYieldEarned += acc.totalYieldEarned + cur.balanceData.yieldEarned

      acc.totalInvested = acc.totalInvested.add(
        toBigNumber(cur.balanceData.balance)
      )

      acc.totalAvailableToWithdraw = acc.totalAvailableToWithdraw.add(
        cur.balanceData.availableToWithdraw
      )

      const currentFtdTranche = currentFtdBalance.get(cur.id.toLowerCase())

      const { totalFtdWeighted, ftdBalance } = cur.fixedTermConfig.reduce(
        (total, cur) => {
          const userFtdBalance = currentFtdTranche?.[parseFloat(cur.configId)]

          if (!userFtdBalance) return total

          const currentWeightedApy = userFtdBalance * parseFloat(cur.apy)

          return {
            totalFtdWeighted: total.totalFtdWeighted + currentWeightedApy,
            ftdBalance: total.ftdBalance + userFtdBalance,
          }
        },
        { totalFtdWeighted: 0, ftdBalance: 0 }
      )

      const variableApyBalance =
        parseFloat(cur.balanceData.balance) - ftdBalance

      const weightedVariableApy = variableApyBalance * parseFloat(cur.apy)

      acc.totalWeightedApy += totalFtdWeighted + weightedVariableApy

      return acc
    },
    {
      totalInvested: ethers.constants.Zero,
      totalAvailableToWithdraw: ethers.constants.Zero,
      totalYieldEarned: 0,
      totalWeightedApy: 0,
    }
  )

  const { totalWeightedApy, ...rest } = result

  const averageApy =
    totalWeightedApy / parseFloat(formatUnits(result.totalInvested))

  return { ...rest, averageApy }
}

export const getTranchesWithUserBalances = (
  tranches: Tranche[],
  balances: any[]
): TrancheWithUserBalance[] => {
  return tranches.map((tranche) => {
    const balance = balances.find((b) => b.address === tranche.id)

    if (!balance) {
      return tranche as TrancheWithUserBalance
    }

    return {
      ...tranche,
      ...balance,
      yieldEarned: balance.yieldEarned ?? 0,
    }
  })
}

export const calculateTotalYieldEarned = (
  tranches: TrancheWithUserBalance[]
) => {
  return tranches.reduce((total, tranche) => {
    if (tranche.yieldEarned) {
      return total + tranche.yieldEarned
    }

    return total
  }, 0)
}

export const calculateTotalInvested = (
  tranches: TrancheWithUserBalance[],
  decimal: number = 6
): string => {
  const tot = tranches.reduce((total, tranche) => {
    // Check if balance exists and is a BigNumber
    if (tranche.balance && BigNumber.isBigNumber(tranche.balance)) {
      // Convert hex balance to a BigNumber and add to total
      const balanceBigNumber = BigNumber.from(tranche.balance)
      return total.add(balanceBigNumber)
    }

    return total
  }, BigNumber.from('0x00'))

  return hexToUSD(tot, decimal)
}

export const hexToBigNumber = (hex: string) => {
  return BigNumber.from(hex)
}
