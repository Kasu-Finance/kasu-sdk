import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useAccount, useChainId } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string
) => {
  const sdk = useKasuSDK()

  const chainId = useChainId()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk && chainId
      ? ['lendingPortfolioData', account.address, poolOverviews, sdk, chainId]
      : null,
    async ([_, userAddress, poolOverviews, sdk]) =>
      await sdk.Portfolio.getPortfolioLendingData(
        userAddress.toLowerCase(),
        poolOverviews,
        currentEpoch,
        new ethers.providers.JsonRpcProvider(
          RPC_URLS[chainId as SupportedChainIds][0]
        )
      ),
    {
      keepPreviousData: true,
    }
  )

  return {
    portfolioLendingPools: data,
    error,
    isLoading,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
