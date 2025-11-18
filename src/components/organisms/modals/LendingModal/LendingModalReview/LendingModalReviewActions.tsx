import { Box, Button } from '@mui/material'
import { useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useGenerateContract from '@/hooks/lending/useGenerateContract'
import useRequestDeposit from '@/hooks/lending/useRequestDeposit'
import getTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import dayjs from '@/dayjs'

const LendingModalReviewActions = () => {
  const { t } = getTranslation()

  const { generatedContract, generateContract, resetGeneratedContract } =
    useGenerateContract()

  const [contractAcceptedSignature, setContractAcceptedSignature] = useState<
    string | undefined
  >(undefined)

  const { prevStep } = useStepperState()

  const { setToast } = useToastState()

  const requestDeposit = useRequestDeposit()

  const supportedToken = useSupportedTokenInfo()

  const { openModal } = useModalState()

  const {
    amount,
    selectedToken,
    trancheId,
    loanContractAccepted,
    fixedTermConfigId,
    pool,
    currentEpochDepositedAmountMap,
    setLoanContractAcccepted,
  } = useDepositModalState()

  const { isApproved, approve } = useApproveToken(
    supportedToken?.[selectedToken].address,
    sdkConfig.contracts.LendingPoolManager as `0x${string}`,
    amount
  )

  const approvalRequired = !isApproved && selectedToken !== SupportedTokens.ETH

  const handleOpen = () => {
    if (!generatedContract.contractMessage) {
      console.error('OpenContractModal:: Contract message is undefined')
      return
    }

    openModal({
      name: ModalsKeys.LOAN_CONTRACT,
      canAccept: true,
      generatedContract: generatedContract,
      acceptLoanContract: (contractSignature: string) => {
        setContractAcceptedSignature(contractSignature)
        setLoanContractAcccepted(true)
      },
    })
  }

  const handleRequestDeposit = () => {
    if (!fixedTermConfigId) {
      return console.error('RequestDeposit:: FixedTermConfigID is undefined')
    }

    if (!contractAcceptedSignature) {
      return console.error(
        'RequestDeposit:: contractAcceptedSignature is undefined'
      )
    }

    const amount =
      currentEpochDepositedAmountMap?.get(trancheId.toLowerCase()) ?? '0'

    if (
      dayjs
        .unix(generatedContract.createdAt / 1000)
        .add(5, 'minutes')
        .isBefore(dayjs())
    ) {
      setToast({
        type: 'error',
        title: 'Loan Contract Expired',
        message:
          'The Loan Contract you generated has expired. Please try again.',
      })

      resetGeneratedContract()
      setContractAcceptedSignature(undefined)
      setLoanContractAcccepted(false)
      return
    }

    const selectedTranche = pool.tranches.find(
      (tranche) => tranche.id === trancheId
    )

    if (!selectedTranche) {
      return console.error('RequestDeposit:: Selected tranche not found.')
    }

    requestDeposit(
      pool.id as `0x${string}`,
      selectedTranche,
      fixedTermConfigId,
      amount,
      contractAcceptedSignature,
      generatedContract.createdAt,
      generatedContract.contractVersion,
      generatedContract.contractType
    )
  }

  const adjust = () => {
    resetGeneratedContract()
    setLoanContractAcccepted(false)
    prevStep()
  }

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={adjust}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.amend')}
      </Button>
      {loanContractAccepted ? (
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={() =>
            !approvalRequired ? handleRequestDeposit() : approve(amount)
          }
          sx={{ textTransform: 'capitalize' }}
        >
          {!approvalRequired ? t('general.confirm') : t('general.approve')}
        </Button>
      ) : (
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onClick={
            generatedContract.status
              ? handleOpen
              : () => generateContract(amount)
          }
        >
          {generatedContract.status
            ? t('modals.loanContract.actions.view')
            : t('modals.loanContract.actions.generate')}
        </Button>
      )}
    </Box>
  )
}

export default LendingModalReviewActions
