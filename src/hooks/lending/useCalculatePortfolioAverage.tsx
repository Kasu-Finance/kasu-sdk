import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { BigNumber, ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import { toBigNumber } from '@/utils'

const useCalculatePortfolioAverage = (
  totalValues: {
    lastEpoch: BigNumber
    lifeTime: BigNumber
    investedAmount: BigNumber
  },
  lendingPortfolio: PortfolioLendingPool[]
) => {
  const totalTranches = lendingPortfolio.reduce((trancheCount, cur) => {
    return trancheCount + cur.tranches.length
  }, 0)

  const weightedApy = lendingPortfolio.reduce((weightedAverage, cur) => {
    const weightedTranchesApy = cur.tranches.reduce(
      (trancheApy, curTranche) =>
        trancheApy.add(
          toBigNumber(curTranche.apy).mul(
            toBigNumber(curTranche.investedAmount)
          )
        ),
      BigNumber.from(0)
    )

    return weightedAverage.add(weightedTranchesApy)
  }, BigNumber.from(0))

  return {
    lastEpoch: lendingPortfolio.length
      ? totalValues.lastEpoch.div(lendingPortfolio.length)
      : ethers.constants.Zero,
    lifeTime: lendingPortfolio.length
      ? totalValues.lifeTime.div(lendingPortfolio.length)
      : ethers.constants.Zero,
    investedAmount: totalTranches
      ? totalValues.investedAmount.div(totalTranches)
      : ethers.constants.Zero,
    weightedApy: totalValues.investedAmount.isZero()
      ? '0'
      : formatEther(weightedApy.div(totalValues.investedAmount)),
  }
}

export default useCalculatePortfolioAverage
