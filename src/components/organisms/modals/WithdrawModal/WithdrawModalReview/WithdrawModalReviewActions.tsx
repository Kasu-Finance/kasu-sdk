import { Box, Button } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useRequestWithdrawal from '@/hooks/lending/useRequestWithdrawal'
import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'

const WithdrawModalReviewActions = () => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { trancheBalance } = modal[ModalsKeys.WITHDRAW]

  const { amount, trancheId, selectedPool } = useWithdrawModalState()

  const supportedToken = useSupportedTokenInfo()

  const requestWithdrawal = useRequestWithdrawal()

  const { prevStep } = useStepperState()

  const selectedTranche = trancheBalance.find(
    (tranche) => tranche.id === trancheId
  )

  const usdcDecimals = supportedToken?.[SupportedTokens.USDC].decimals

  const handleRequestWithdrawal = async () => {
    if (!selectedTranche) {
      return console.error('RequestWithdraw:: SelectedTranche is undefined')
    }

    const isMaxWithdrawal =
      amount ===
      formatUnits(
        selectedTranche.balanceData.availableToWithdraw || '0',
        usdcDecimals
      )

    await requestWithdrawal(
      selectedPool.id,
      selectedTranche.id,
      parseUnits(amount, usdcDecimals).toString(),
      isMaxWithdrawal
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
        {t('general.amend')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={handleRequestWithdrawal}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.confirm')}
      </Button>
    </Box>
  )
}

export default WithdrawModalReviewActions
