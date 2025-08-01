import { parseUnits } from 'ethers/lib/utils'

import useFixApyState from '@/hooks/context/useFixApyState'
import useSdk from '@/hooks/context/useSdk'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useFixApy = () => {
  const sdk = useSdk()

  const { setToast, removeToast } = useToastState()

  const { setTxHash } = useFixApyState()

  const { nextStep } = useStepperState()

  const handleError = useHandleError()

  return async (
    lendingPoolId: string,
    trancheId: string,
    amount: string,
    fixedTermConfigId: string
  ) => {
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

      const fixApy = await sdk.UserLending.lockDepositForFixedTerm(
        lendingPoolId,
        trancheId,
        parseUnits(amount, 6),
        fixedTermConfigId
      )

      const receipt = await waitForReceipt(fixApy)

      setTxHash(receipt.transactionHash)

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.FIX_APY} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.FIX_APY][ActionStatus.ERROR]
      )
    }
  }
}

export default useFixApy
