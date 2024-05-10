import { PortfolioRewards } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'
import useTranslation from '@/hooks/useTranslation'

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

  const { t } = useTranslation()

  const mapKeyToLabel = useMemo(
    () =>
      ({
        bonusYieldEarnings: t('portfolio.rewards.bonusYieldEarnings'),
        ksuLaunchBonus: t('portfolio.rewards.ksuLaunchBonus'),
        protocolFees: t('portfolio.rewards.Protocol Fees'),
      }) as const satisfies Record<keyof PortfolioRewards, string>,
    [t]
  )

  const { data, error, mutate } = useSWR(
    account ? ['portfolioRewards', account] : null,
    async ([_, userAddress]) => {
      const rewards = await sdk.Portfolio.getPortfolioRewards(
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
