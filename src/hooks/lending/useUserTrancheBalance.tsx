import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useGetUserBalance = (tranches: string[]) => {
  const { account } = useWeb3React()
  const sdk = useKasuSDK()

  // Define default and empty data
  const defaultData = tranches?.map((tranche) => ({
    yieldEarned: 0,
    address: tranche,
  }))

  // Return null swrKey when account is undefined to bypass SWR fetching
  const swrKey = account
    ? ['getUserTrancheBalance', account, tranches.join('|')]
    : null

  const fetchAllBalances = async (tranches: string[]) => {
    if (!account || !Array.isArray(tranches) || tranches.length === 0) {
      // Each pool should have at least one tranche
      if (tranches.length === 0) {
        throw new Error('Tranches of the current pool are empty')
      }

      if (!account) {
        return defaultData
      }
    }

    if (isAddress(account)) {
      try {
        const balancePromises = tranches.map((trancheAddress) =>
          sdk.UserLending.getUserTrancheBalance(account, trancheAddress)
        )

        const balances = await Promise.all(balancePromises)

        return balances
      } catch (error) {
        console.error('Error fetching balances:', error)
        // Rethrow to be caught by SWR
        throw error
      }
    }
  }

  const { data, error, mutate } = useSWR(
    swrKey ? swrKey : null,
    () => fetchAllBalances(tranches),
    {
      // Use SWR's fallbackData option for an initial state
      fallbackData: defaultData,
    }
  )

  return {
    amount: data,
    error,
    isLoading: !data && !error,
    updateTranches: mutate,
  }
}

export default useGetUserBalance
