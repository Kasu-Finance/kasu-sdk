import { PortfolioRewards } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

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
  const sdk = useSdk()

  const { currentChainId: chainId } = useChain()

  const { address } = usePrivyAuthenticated()

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

  const {
    data: rewards,
    error,
    isLoading,
    mutate,
  } = useSWR(
    address && sdk && chainId
      ? ['portfolioRewards', chainId, address.toLowerCase()]
      : null,
    async ([_, __chainId, userAddress]): Promise<PortfolioRewards> => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Portfolio.getPortfolioRewards(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  const portfolioRewards = useMemo((): PortfolioRewardsType | undefined => {
    if (!rewards) return undefined

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
  }, [mapKeyToLabel, rewards])

  return {
    portfolioRewards,
    error,
    isLoading,
    updatePortfolioRewards: mutate,
  }
}

export default usePortfolioRewards
