import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string
) => {
  const sdk = useSdk()

  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()

  const { data, error, mutate } = useSWR(
    address && sdk && chainId
      ? ['lendingPortfolioData', address, poolOverviews, sdk, chainId]
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
    isLoading: !data && !error,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
