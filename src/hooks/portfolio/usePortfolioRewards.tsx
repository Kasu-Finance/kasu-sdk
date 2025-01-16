import { PortfolioRewards } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'
import getTranslation from '@/hooks/useTranslation'

import { toBigNumber } from '@/utils'

export type PortfolioRewardsType = {
  bonusYieldEarnings: {
    claimableBalance: {
      ksuAmount: string
    }
    lifeTime: {
      ksuAmount: string
    }
    label: string
  }
  ksuLaunchBonus: {
    lifeTime: {
      ksuAmount: string
    }
    label: string
  }
  protocolFees: {
    claimableBalance: {
      usdcAmount: string
    }
    lifeTime: {
      usdcAmount: string
    }
    label: string
  }
  totalLifetimeKsuRewards: BigNumber
}

const usePortfolioRewards = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { t } = getTranslation()

  const mapKeyToLabel = useMemo(
    () =>
      ({
        bonusYieldEarnings: t('portfolio.rewards.bonusYieldEarnings'),
        ksuLaunchBonus: t('portfolio.rewards.ksuLaunchBonus'),
        protocolFees: t('portfolio.rewards.protocolFees'),
      }) as const satisfies Record<keyof PortfolioRewards, string>,
    [t]
  )

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['portfolioRewards', account, sdk] : null,
    async ([_, userAddress, sdk]): Promise<PortfolioRewardsType> => {
      const rewards = await sdk.Portfolio.getPortfolioRewards(
        userAddress.toLowerCase()
      )

      const totalLifetimeKsuRewards = toBigNumber(
        rewards.bonusYieldEarnings.lifeTime.ksuAmount
      ).add(toBigNumber(rewards.ksuLaunchBonus.lifeTime.ksuAmount))

      return {
        bonusYieldEarnings: {
          ...rewards.bonusYieldEarnings,
          label: mapKeyToLabel['bonusYieldEarnings'],
        },
        ksuLaunchBonus: {
          ...rewards.ksuLaunchBonus,
          label: mapKeyToLabel['ksuLaunchBonus'],
        },
        protocolFees: {
          ...rewards.protocolFees,
          label: mapKeyToLabel['protocolFees'],
        },
        totalLifetimeKsuRewards,
      }
    }
  )

  return {
    portfolioRewards: data,
    error,
    isLoading,
    updatePortfolioRewards: mutate,
  }
}

export default usePortfolioRewards
