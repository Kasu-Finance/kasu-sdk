import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import useToastState from '@/context/toast/useToastState'
import { sleep, userRejectedTransaction } from '@/utils'

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
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
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
      let title: string, message: string

      if (userRejectedTransaction(error)) {
        message = ACTION_MESSAGES[ActionStatus.REJECTED]
        title = `${ActionType.APPROVE} ${ActionStatus.REJECTED}`
      } else {
        message = ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.ERROR]
        title = `${ActionType.APPROVE} ${ActionStatus.ERROR}`
      }

      setToast({
        type: 'error',
        title,
        message,
      })
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
