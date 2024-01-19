import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import useTokenDetails from '@/hooks/web3/useTokenDetails'

import useToastState from '@/context/toast/useToastState'
import { sleep } from '@/utils'

const useApproveToken = (
  tokenAddress: string | undefined,
  spender: string | undefined,
  amount: string
) => {
  const { provider, account } = useWeb3React()

  const { decimals } = useTokenDetails(tokenAddress)

  const [isApproved, setIsApproved] = useState(false)

  const { setToast, removeToast } = useToastState()

  const { data: allowance, mutate } = useSWR<BigNumber>(
    provider && account && tokenAddress && spender
      ? [tokenAddress, 'allowance', account, spender]
      : null,
    () => {
      return BigNumber.from(0)
    },
    {
      fallbackData: parseEther('0'),
      dedupingInterval: undefined,
      refreshInterval: undefined,
    }
  )

  useEffect(() => {
    if (!allowance || allowance.isZero()) {
      setIsApproved(false)
      return
    }

    if (allowance.gte(parseUnits(amount || '0', decimals))) {
      setIsApproved(true)
      return
    }

    setIsApproved(false)
  }, [allowance, amount, decimals])

  const approve = async (approveAmount: string) => {
    try {
      if (!tokenAddress)
        throw new Error('useApproveToken: tokenAddress not specified')
      if (!spender) throw new Error('useApproveToken: spender not specified')

      setToast({
        type: 'info',
        title: 'Processing',
        message: 'Your transaction request is being processed...',
        isClosable: false,
      })

      await sleep(3000)

      const random = Math.random() * 2

      if (Math.floor(random)) {
        throw new Error(approveAmount)
      }

      removeToast()
      setIsApproved(true)
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Approval Rejected',
        message: 'The transaction has been rejected.',
      })
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
