import { useWeb3React } from '@web3-react/core'
import { BigNumberish, ContractTransaction } from 'ethers'
import { useState } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

const useWithdrawRequest = () => {
  const sdk = useKasuSDK()
  const { account: userAddress } = useWeb3React()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | unknown>('')
  const [data, setData] = useState<ContractTransaction | null>(null)

  const requestWithdrawal = async (
    lendingPool: string,
    tranche: string,
    amount: BigNumberish
  ) => {
    if (!userAddress) {
      console.error('User address is not available')
      setError('User address is not available')
      return
    }

    setIsLoading(true)
    try {
      const txResponse = await sdk.UserLending.requestWithdrawal(
        lendingPool,
        tranche,
        amount
      )
      setData(txResponse)
      setError('')
    } catch (err) {
      console.error('Failed to request withdrawal:', err)
      setError(err)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return { requestWithdrawal, isLoading, error, data }
}

export default useWithdrawRequest
