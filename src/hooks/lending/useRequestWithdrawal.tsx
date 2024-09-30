import { useWeb3React } from '@web3-react/core'
import { ContractTransaction } from 'ethers'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useRequestWithdrawal = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const handleError = useHandleError()

  const { nextStep } = useStepperState()

  const { setTxHash } = useWithdrawModalState()

  const { setModalStatusAction } = useModalStatusState()

  const { setToast, removeToast } = useToastState()

  return async (
    lendingPool: string,
    trancheId: string,
    amount: string,
    isWithdrawMax: boolean
  ) => {
    if (!account) {
      return console.error('RequestWithdraw:: Account is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      let txResponse: ContractTransaction

      if (isWithdrawMax) {
        txResponse = await sdk.UserLending.requestWithdrawalMax(
          lendingPool,
          trancheId,
          account
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

      setModalStatusAction(ModalStatusAction.COMPLETED)

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        `${ActionType.WITHDRAW} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.WITHDRAW][ActionStatus.ERROR]
      )
    }
  }
}

export default useRequestWithdrawal
