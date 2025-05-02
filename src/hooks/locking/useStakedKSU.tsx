import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useStakedKSU = () => {
  const account = useAccount()

  const sdk = useKasuSDK()

  const { data, error, isLoading } = useSWR(
    account.address && sdk ? ['stakedKasu', account.address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getUserStakedKsu(userAddress)
  )

  return {
    stakedKSU: data,
    error,
    isLoading,
  }
}

export default useStakedKSU
