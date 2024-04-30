import { BigNumber } from 'ethers'

import { PortfolioRewards } from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardsTable'

import { toBigNumber } from '@/utils'

const useCalculatePortfolioRewardsTotal = (
  portfolioRewards: PortfolioRewards[]
) => {
  return portfolioRewards.reduce(
    (reward, cur) => {
      if (cur.lastEpoch) {
        if (!cur.lastEpoch.ksuAmount) {
          reward.lastEpochUsdcBonus = reward.lastEpochUsdcBonus.add(
            toBigNumber(cur.lastEpoch.usdcAmount)
          )
        } else {
          reward.lastEpochKsuBonus = {
            ksuAmount: reward.lastEpochKsuBonus.ksuAmount.add(
              toBigNumber(cur.lastEpoch.ksuAmount)
            ),
            usdAmount: reward.lastEpochKsuBonus.usdAmount.add(
              toBigNumber(cur.lastEpoch.usdcAmount)
            ),
          }
        }
      }

      if (!cur.lifetime.ksuAmount) {
        reward.lifetimeUsdcBonus = reward.lifetimeUsdcBonus.add(
          toBigNumber(cur.lifetime.usdcAmount)
        )
      } else {
        reward.lifetimeKsuBonus = reward.lifetimeKsuBonus.add(
          toBigNumber(cur.lifetime.ksuAmount)
        )
      }

      return reward
    },
    {
      lastEpochUsdcBonus: BigNumber.from(0),
      lifetimeUsdcBonus: BigNumber.from(0),
      lastEpochKsuBonus: {
        ksuAmount: BigNumber.from(0),
        usdAmount: BigNumber.from(0),
      },
      lifetimeKsuBonus: BigNumber.from(0),
    }
  )
}

export default useCalculatePortfolioRewardsTotal
