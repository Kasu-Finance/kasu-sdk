import { formatUnits } from 'ethers/lib/utils'
import useSWR from 'swr'
import { useAccount, useChainId } from 'wagmi'

import { UserReferralYieldRes } from '@/app/api/referral/userYields/route'

const useUserReferrals = () => {
  const { address } = useAccount()

  const chainId = useChainId()

  const { data, error, isLoading } = useSWR(
    address ? ['userReferrals', address] : null,
    async ([_, userAddress]) => {
      const res = await fetch(
        `/api/referral/userYields?${new URLSearchParams({
          userAddress,
          chainId: chainId.toString(),
        })}`
      )

      const data: UserReferralYieldRes = await res.json()

      if ('error' in data) {
        throw new Error(data.message)
      }

      return {
        referredUsers: data.totalUserRefferalsCount,
        referralYieldLastEpoch: formatUnits(data.latestEpochReferralYield, 6),
        referralYieldLifetime: formatUnits(data.lifetimeRefferalYield, 6),
      }
    }
  )

  return {
    userReferrals: data,
    error,
    isLoading,
  }
}

export default useUserReferrals
