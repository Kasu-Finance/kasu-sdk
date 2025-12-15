import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useLockingRewards = () => {
  const sdk = useSdk()

  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()

  const addressLower = address?.toLowerCase()

  const {
    userLockDepositsInfo,
    error: userLockDepositsInfoError,
    isLoading: userLockDepositsInfoLoading,
    updateUserLockDepositsInfo,
  } = useUserLockDepositsInfo()

  const {
    data: claimableRewards,
    error: claimableRewardsError,
    isLoading: claimableRewardsLoading,
    mutate: updateClaimableRewards,
  } = useSWR(
    addressLower && sdk && chainId
      ? ['lockingClaimableRewards', chainId, addressLower]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Locking.getClaimableRewards(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  const lockingRewards = useMemo(() => {
    const rewardDecimals = 6

    if (!claimableRewards) return undefined

    const feesClaimed = userLockDepositsInfo?.feesClaimed ?? '0'

    const lifeTimeRewards = claimableRewards.add(
      parseUnits(feesClaimed, rewardDecimals)
    )

    return {
      claimableRewards: formatUnits(claimableRewards, rewardDecimals),
      lifeTimeRewards: formatUnits(lifeTimeRewards, rewardDecimals),
    }
  }, [claimableRewards, userLockDepositsInfo?.feesClaimed])

  const updateLockingRewards = async () => {
    await Promise.all([updateClaimableRewards(), updateUserLockDepositsInfo()])
  }

  return {
    lockingRewards,
    error: userLockDepositsInfoError || claimableRewardsError,
    isLoading: userLockDepositsInfoLoading || claimableRewardsLoading,
    updateLockingRewards,
  }
}

export default useLockingRewards
