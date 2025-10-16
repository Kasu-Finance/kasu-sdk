import { ContractTransaction } from 'ethers'

import useSdk from '@/hooks/context/useSdk'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useHandleError from '@/hooks/web3/useHandleError'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useRequestWithdrawal = () => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const handleError = useHandleError()

  const { nextStep } = useStepperState()

  const { setTxHash } = useWithdrawModalState()

  const { setToast, removeToast } = useToastState()

  return async (
    lendingPool: string,
    trancheId: string,
    amount: string,
    isWithdrawMax: boolean
  ) => {
    if (!address) {
      return console.error('RequestWithdraw:: Account is undefined')
    }

    try {
      if (!sdk) {
        throw new KasuSdkNotReadyError()
      }

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      let txResponse: ContractTransaction

      if (isWithdrawMax) {
        txResponse = await sdk.UserLending.requestWithdrawalMax(
          lendingPool,
          trancheId,
          address
        )
      } else {
        txResponse = await sdk.UserLending.requestWithdrawalInUSDC(
          lendingPool,
          trancheId,
          amount
        )
      }

      const receipt = await waitForReceipt(txResponse)
      setTxHash(receipt.transactionHash)

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.WITHDRAW} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.WITHDRAW][ActionStatus.ERROR]
      )
    }
  }
}

export default useRequestWithdrawal
