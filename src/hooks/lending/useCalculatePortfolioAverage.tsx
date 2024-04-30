import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import { UserLendingPortfolio } from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'

import { toBigNumber } from '@/utils'

const useCalculatePortfolioAverage = (
  totalValues: {
    lastEpoch: BigNumber
    lastMonth: BigNumber
    lastYear: BigNumber
    lifeTime: BigNumber
    investedAmount: BigNumber
  },
  lendingPortfolio: UserLendingPortfolio[]
) => {
  const totalTranches = lendingPortfolio.reduce((trancheCount, cur) => {
    return trancheCount + cur.lendingPool.tranches.length
  }, 0)

  const weightedApy = lendingPortfolio.reduce((weightedAverage, cur) => {
    const weightedTranchesApy = cur.lendingPool.tranches.reduce(
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
    lastEpoch: totalValues.lastEpoch.div(lendingPortfolio.length),
    lastMonth: totalValues.lastMonth.div(lendingPortfolio.length),
    lastYear: totalValues.lastYear.div(lendingPortfolio.length),
    lifeTime: totalValues.lifeTime.div(lendingPortfolio.length),
    investedAmount: totalValues.investedAmount.div(totalTranches),
    weightedApy: formatEther(weightedApy.div(totalValues.investedAmount)),
  }
}

export default useCalculatePortfolioAverage
