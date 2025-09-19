import { BigNumber, BytesLike } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount, useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useKycState from '@/hooks/context/useKycState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useSdk from '@/hooks/context/useSdk'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useBuildDepositData from '@/hooks/lending/useBuildDepositData'
import useBuildSwapData from '@/hooks/lending/useBuildSwapData'
import useHandleError from '@/hooks/web3/useHandleError'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import generateKycSignature from '@/actions/generateKycSignature'
import { Routes } from '@/config/routes'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { SupportedTokens } from '@/constants/tokens'
import { capitalize, toBigNumber, waitForReceipt } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

const useRequestDeposit = () => {
  const sdk = useSdk()

  const account = useAccount()

  const { isLiteMode } = useLiteModeState()

  const pathname = usePathname()

  const router = useRouter()

  const chainId = useChainId()

  const handleError = useHandleError()

  const { setTxHash, trancheId, amount, selectedToken } = useDepositModalState()

  const { kycInfo } = useKycState()

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
    contractAcceptedTimstamp: EpochTimeStamp,
    contractVersion: number,
    contractType: 'retail' | 'exempt'
  ) => {
    if (!account.address) {
      return console.error('RequestDeposit:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestDeposit:: ChainId is undefined')
    }

    if (!supportedTokens) {
      return console.error('RequestDeposit:: SupportedTokens is undefined')
    }

    if (!kycInfo) {
      return console.error('RequestDeposit:: KycInfo is undefined')
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

      const kycSignatureParams = await sdk.UserLending.buildKycSignatureParams(
        account.address,
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
          account: account.address,
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

      const versionType =
        (contractVersion << 8) + (contractType === 'retail' ? 0 : 1)

      const depositData = buildDepositData(
        contractAcceptedSignature,
        contractAcceptedTimstamp,
        versionType
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

      if (isLiteMode && pathname !== Routes.portfolio.root.url) {
        router.push(Routes.portfolio.root.url)
      }

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
