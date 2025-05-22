import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string
) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk
      ? ['lendingPortfolioData', account, poolOverviews, sdk]
      : null,
    async ([_, userAddress, poolOverviews, sdk]) =>
      await sdk.Portfolio.getPortfolioLendingData(
        userAddress.toLowerCase(),
        poolOverviews,
        currentEpoch
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
