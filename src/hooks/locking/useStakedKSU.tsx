import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useStakedKSU = () => {
  const account = useAccount()

  const sdk = useSdk()

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
