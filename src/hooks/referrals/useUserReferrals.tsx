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

      const latestItem = data.items
        .sort((a, b) => parseFloat(b.epochId) - parseFloat(a.epochId))
        .reverse()

      return {
        referredUsers: data.totalUserReferralsCount,
        referralYields: latestItem.length ? latestItem[0].refferralYield : '0',
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
