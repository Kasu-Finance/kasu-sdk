import { useCallback } from 'react'
import { useAccount } from 'wagmi'

import useQualifiedAirdrops from '@/hooks/lending/useQualifiedAirdrops'

import { groupBy } from '@/utils'

const useUserAirdrops = () => {
  const { address } = useAccount()

  const { qualifiedAirdrops, isLoading, error } = useQualifiedAirdrops()

  const getUserAirdrops = useCallback(
    (
      qualifiedAirdrops: NonNullable<
        ReturnType<typeof useQualifiedAirdrops>['qualifiedAirdrops']
      >
    ) => {
      const filtered = qualifiedAirdrops.filter(
        ({ userAddress }) =>
          userAddress.toLowerCase() ===
          '0x7b4a6f5fad9ab79749ec7190ec27beadd434a658'.toLowerCase()
      )

      const grouped = groupBy(filtered, ({ epochId }) => epochId.toString())

      const airdrops = Object.values(grouped).map((group) => {
        return {
          lendingAmount: group[0].totalAcceptedInEpoch,
          acceptedEpoch: group[0].epochId,
          ticketsOwed: group.length,
          airDropDate: 'TGE + 90 days',
          isPaid: false,
        }
      })

      return airdrops
    },
    [address]
  )

  return {
    userAirdrops: getUserAirdrops(qualifiedAirdrops ?? []),
    error,
    isLoading,
  }
}

export default useUserAirdrops
