import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePortfolioSummary = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['portfolioSummary', account] : null,
    async ([_, userAddress]) =>
      sdk.Portfolio.getPortfolioSummary(userAddress.toLowerCase())
  )

  return {
    portfolioSummary: data,
    error,
    isLoading: !data && !error,
    updatePortfolioSummary: mutate,
  }
}

export default usePortfolioSummary
