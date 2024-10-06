import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingPortfolioData = (poolOverviews: PoolOverview[]) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account ? ['lendingPortfolioData', account, poolOverviews] : null,
    async ([_, userAddress, poolOverviews]) =>
      await sdk.Portfolio.getPortfolioLendingData(
        userAddress.toLowerCase(),
        poolOverviews
      )
  )

  return {
    lendingPortfolioData: data,
    error,
    isLoading,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
