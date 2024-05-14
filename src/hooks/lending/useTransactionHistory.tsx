import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useTransactionHistory = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['transactionHistory', account] : null,
    async ([_, userAdress]) =>
      sdk.UserLending.getUserRequests(userAdress as `0x${string}`)
  )

  return {
    transactionHistory: data,
    error,
    isLoading: !data && !error,
    updateTransactionHistory: mutate,
  }
}

export default useTransactionHistory
