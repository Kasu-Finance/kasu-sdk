import { formatUnits } from 'ethers/lib/utils'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { UserReferralYieldRes } from '@/app/api/referral/userYields/route'

export type ReferredUserDetails = {
  user: string
  depositAmount: string
  referralReward: string
}

const useUserReferrals = () => {
  const { address } = usePrivyAuthenticated()

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
        referredUsersDetails: data.items.map((item) => ({
          user: item.user,
          depositAmount: formatUnits(item.firstDeposit, 6),
          referralReward: formatUnits(item.yield, 6),
        })),
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
