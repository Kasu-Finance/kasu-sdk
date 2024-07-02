import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingPortfolioData = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data: poolOverviews } = usePoolOverview()

  const { data, error, mutate } = useSWR(
    account && poolOverviews
      ? ['lendingPortfolioData', account, poolOverviews]
      : null,
    async ([_, userAddress, poolOverviews]) =>
      await sdk.Portfolio.getPortfolioLendingData(
        userAddress.toLowerCase(),
        poolOverviews
      )
  )

  return {
    lendingPortfolioData: data,
    error,
    isLoading: !data && !error,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
