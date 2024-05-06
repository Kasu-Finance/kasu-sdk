import { PortfolioRewards } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const mapKeyToLabel = {
  bonusYieldEarnings: 'Bonus Yield Earnings',
  ksuLaunchBonus: 'KSU Launch Bonus',
  protocolFees: 'Protocol Fees',
} as const satisfies Record<keyof PortfolioRewards, string>

export type PortfolioRewardsType = {
  label: string
  lastEpoch:
    | {
        ksuAmount?: string
        usdcAmount: string
      }
    | undefined
  lifeTime: {
    ksuAmount?: string
    usdcAmount: string
  }
}

const usePortfolioRewards = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['portfolioRewards', account] : null,
    async ([_, userAddress]) => {
      const rewards = sdk.Portfolio.getPortfolioRewards(
        userAddress.toLowerCase()
      )

      const mappedPortfolioRewards: PortfolioRewardsType[] = Object.entries(
        rewards
      ).map(([key, val]) => ({
        label: mapKeyToLabel[key],
        ...val,
      }))

      return mappedPortfolioRewards
    }
  )

  return {
    portfolioRewards: data,
    error,
    isLoading: !data && !error,
    updatePortfolioRewards: mutate,
  }
}

export default usePortfolioRewards
