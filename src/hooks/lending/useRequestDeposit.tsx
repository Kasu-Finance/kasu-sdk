import { useWeb3React } from '@web3-react/core'
import { BigNumber, BytesLike } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useBuildDepositData from '@/hooks/lending/useBuildDepositData'
import useBuildSwapData from '@/hooks/lending/useBuildSwapData'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import generateKycSignature from '@/actions/generateKycSignature'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { SupportedTokens } from '@/constants/tokens'
import { capitalize, toBigNumber, waitForReceipt } from '@/utils'

import { HexString } from '@/types/lending'
import { PoolOverviewWithDelegate } from '@/types/page'

const useRequestDeposit = () => {
  const sdk = useKasuSDK()

  const { account, chainId } = useWeb3React()

  const handleError = useHandleError()

  const { setTxHash, trancheId, amount, selectedToken } = useDepositModalState()

  const supportedTokens = useSupportedTokenInfo()

  const { nextStep } = useStepperState()

  const { setToast, removeToast } = useToastState()

  const buildSwapData = useBuildSwapData()

  const buildDepositData = useBuildDepositData()

  return async (
    lendingPoolId: `0x${string}`,
    selectedTranche: PoolOverviewWithDelegate['tranches'][number],
    fixedTermConfigId: string,
    currentEpochDepositedAmount: string,
    contractAcceptedSignature: string,
    contractAcceptedTimstamp: EpochTimeStamp
  ) => {
    if (!account) {
      return console.error('RequestDeposit:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestDeposit:: ChainId is undefined')
    }

    if (!supportedTokens) {
      return console.error('RequestDeposit:: SupportedTokens is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const kycSignatureParams = await sdk.UserLending.buildKycSignatureParams(
        account as HexString,
        chainId.toString()
      )

      const kycData = await generateKycSignature(kycSignatureParams)

      if (!kycData) {
        throw new Error('RequestDeposit:: Error generating signature')
      }

      const isETH = selectedToken === SupportedTokens.ETH

      const fromToken = supportedTokens[selectedToken]
      const fromAmount = parseUnits(amount, fromToken.decimals).toString()

      const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount, 6)

      const trancheMax = toBigNumber(selectedTranche.maximumDeposit, 6).sub(
        currentDepositedAmount
      )

      let maxAmount = BigNumber.from(fromAmount).gt(trancheMax)
        ? trancheMax.toString()
        : fromAmount

      let swapData: BytesLike = '0x'

      if (selectedToken !== SupportedTokens.USDC) {
        const data = await buildSwapData({
          account,
          chainId,
          currentDepositedAmount,
          fromAmount,
          fromToken: fromToken.address,
          isETH,
          minimumDeposit: selectedTranche.minimumDeposit,
          supportedTokens,
          trancheMax,
        })

        maxAmount = data.maxAmount
        swapData = data.swapData
      }

      const depositData = buildDepositData(
        contractAcceptedSignature,
        contractAcceptedTimstamp
      )

      const deposit = await sdk.UserLending.requestDepositWithKyc(
        lendingPoolId,
        trancheId,
        maxAmount.toString(),
        swapData,
        fixedTermConfigId,
        depositData,
        kycData,
        isETH ? fromAmount : '0' // when using ETH, pass the value  directly here
      )

      const receipt = await waitForReceipt(deposit)

      setTxHash(receipt.transactionHash)

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.DEPOSIT} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.DEPOSIT][ActionStatus.ERROR]
      )
    }
  }
}

export default useRequestDeposit
