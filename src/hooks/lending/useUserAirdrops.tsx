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
      >,
      address: string
    ) => {
      const filtered = qualifiedAirdrops.filter(
        ({ userAddress }) => userAddress.toLowerCase() === address.toLowerCase()
      )

      const grouped = groupBy(filtered, ({ epochId }) => epochId.toString())

      const requestIdGroup = Object.entries(
        groupBy(filtered, ({ requestId }) => requestId)
      ).reduce((acc, [key, value]) => {
        if (acc.has(key)) return acc

        acc.set(key, value[0].totalAcceptedInEpoch)

        return acc
      }, new Map<string, number>())

      const airdrops = Object.values(grouped).map((group) => {
        const uniqueRequestId = [
          ...new Set(group.map(({ requestId }) => requestId)),
        ]

        const lendingAmount = uniqueRequestId.reduce((total, requestId) => {
          const amount = requestIdGroup.get(requestId) ?? 0

          return total + amount
        }, 0)

        return {
          lendingAmount,
          acceptedEpoch: group[0].epochId,
          ticketsOwed: group.length,
          airDropDate: 'TGE + 90 days',
          isPaid: false,
        }
      })

      return airdrops
    },
    []
  )

  return {
    userAirdrops:
      address && qualifiedAirdrops
        ? getUserAirdrops(qualifiedAirdrops, address)
        : [],
    error,
    isLoading,
  }
}

export default useUserAirdrops
