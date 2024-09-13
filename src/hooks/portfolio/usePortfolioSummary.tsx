import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const usePortfolioSummary = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data: poolOverviews } = usePoolOverview()

  const { data, error, mutate } = useSWR(
    account && poolOverviews
      ? ['portfolioSummary', account, poolOverviews]
      : null,
    async ([_, userAddress, poolOverviews]) =>
      sdk.Portfolio.getPortfolioSummary(
        userAddress.toLowerCase(),
        poolOverviews
      ),
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    portfolioSummary: data,
    error,
    isLoading: !data && !error,
    updatePortfolioSummary: mutate,
  }
}

export default usePortfolioSummary
