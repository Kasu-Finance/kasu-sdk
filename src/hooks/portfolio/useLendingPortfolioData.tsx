import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingPortfolioData = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['lendingPortfolioData', account] : null,
    async ([_, userAddress]) =>
      sdk.Portfolio.getPortfolioLendingData(userAddress.toLowerCase())
  )

  return {
    portfolioSummary: data,
    error,
    isLoading: !data && !error,
    updatePortfolioSummary: mutate,
  }
}

export default useLendingPortfolioData
