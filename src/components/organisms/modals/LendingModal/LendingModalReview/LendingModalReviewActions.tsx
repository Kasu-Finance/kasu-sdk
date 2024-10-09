import { Box, Button } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useRequestDeposit from '@/hooks/lending/useRequestDeposit'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'

const LendingModalReviewActions = () => {
  const { t } = useTranslation()

  const { prevStep } = useStepperState()

  const { modal, openModal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const supportedToken = useSupportedTokenInfo()

  const requestDeposit = useRequestDeposit()

  const {
    amount,
    selectedToken,
    trancheId,
    loanContractAccepted,
    fixedTermConfigId,
    setLoanContractAcccepted,
  } = useDepositModalState()

  const { currentEpochDepositedAmount } = useCurrentEpochDepositedAmount(
    pool.id,
    trancheId
  )

  const { isApproved, approve } = useApproveToken(
    supportedToken?.[selectedToken].address,
    sdkConfig.contracts.LendingPoolManager,
    amount
  )

  const approvalRequired = !isApproved && selectedToken !== SupportedTokens.ETH

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.LOAN_CONTRACT,
      acceptLoanContract: () => setLoanContractAcccepted(true),
      canAccept: true,
    })

  const handleRequestDeposit = () => {
    if (!fixedTermConfigId) {
      return console.error('RequestDeposit:: FixedTermConfigID is undefined')
    }

    if (!currentEpochDepositedAmount) {
      return console.error(
        'RequestDeposit:: currentEpochDepositedAmount is undefined'
      )
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
      currentEpochDepositedAmount
    )
  }

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={prevStep}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.adjust')}
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
          onClick={handleOpen}
        >
          View & Accept Loan Contract
        </Button>
      )}
    </Box>
  )
}

export default LendingModalReviewActions
