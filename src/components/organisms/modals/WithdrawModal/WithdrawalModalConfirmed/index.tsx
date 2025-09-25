import { Stack, Typography } from '@mui/material'
import { useAccount } from 'wagmi'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'

import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import WithdrawalModalConfirmedActions from '@/components/organisms/modals/WithdrawModal/WithdrawalModalConfirmed/WithdrawalModalConfirmedActions'

import { formatAccount, formatAmount, mergeSubheading } from '@/utils'

const WithdrawalModalConfirmed = () => {
  const { t } = getTranslation()

  const account = useAccount()

  const { amount, trancheId, selectedPool } = useWithdrawModalState()

  const selectedTranche = selectedPool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  return (
    <Stack spacing={3} mt={3}>
      <Stack spacing={2}>
        <Typography variant='h4'>
          {t('lending.withdraw.confirmStep.withdrawInfo')}
        </Typography>
        <Typography variant='baseMd'>
          <Typography variant='baseMdBold'>
            {formatAmount(amount, { minDecimals: 2 })} USDC{' '}
          </Typography>
          {t('lending.withdraw.confirmStep.description-1')}{' '}
          {mergeSubheading(selectedPool.poolName, selectedPool.subheading)}
          {selectedPool.tranches.length > 1
            ? `- ${selectedTranche?.name} ${t('general.tranche')}`
            : null}{' '}
          {t('lending.withdraw.confirmStep.description-2')}{' '}
          <Typography variant='baseMdBold'>
            {t('lending.withdraw.confirmStep.description-3')}
          </Typography>{' '}
          <NextClearingPeriodInfo
            sx={{ p: 0, display: 'inline', bgcolor: 'unset' }}
          />
        </Typography>
        <Typography variant='baseMd'>
          {t('lending.withdraw.confirmStep.description-4')}{' '}
          <Typography variant='baseMdBold'>
            {formatAccount(account.address)}
          </Typography>
        </Typography>
      </Stack>
      <WithdrawalModalConfirmedActions />
    </Stack>
  )
}

export default WithdrawalModalConfirmed
