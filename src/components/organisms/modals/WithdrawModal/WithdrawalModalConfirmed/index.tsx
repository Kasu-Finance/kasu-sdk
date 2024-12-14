import { Stack, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import WithdrawalModalConfirmedActions from '@/components/organisms/modals/WithdrawModal/WithdrawalModalConfirmed/WithdrawalModalConfirmedActions'

import { ModalsKeys } from '@/context/modal/modal.types'

import {
  formatAccount,
  formatAmount,
  formatTimestamp,
  mergeSubheading,
} from '@/utils'

const WithdrawalModalConfirmed = () => {
  const { t } = getTranslation()

  const { account } = useWeb3React()

  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.WITHDRAW]

  const { amount, trancheId } = useWithdrawModalState()

  const { nextEpochTime } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  return (
    <Stack spacing={3} mt={3}>
      <Stack spacing={2}>
        <Typography variant='h4'>
          {t('lending.withdraw.confirmStep.withdrawInfo')}
        </Typography>
        <Typography variant='baseMd' component='p'>
          <Typography variant='baseMdBold'>
            {formatAmount(amount, { minDecimals: 2 })} USDC{' '}
          </Typography>
          {t('lending.withdraw.confirmStep.amountLabel')} ({formattedTime.date}{' '}
          • {formattedTime.timestamp} {formattedTime.utcOffset}){' '}
          {t('general.from')}{' '}
          <Typography variant='baseMdBold'>
            {mergeSubheading(pool.poolName, pool.subheading)}
            {pool.tranches.length > 1
              ? `, ${selectedTranche?.name} ${t('general.tranche')}`
              : null}
          </Typography>{' '}
          {t('lending.withdraw.confirmStep.subjectLiquidity')}
        </Typography>
        <Typography variant='baseMd'>
          <Typography variant='baseMdBold'>
            {formatAmount(amount, { minDecimals: 2 })} USDC{' '}
          </Typography>
          {t('lending.withdraw.confirmStep.depositedLabel')}{' '}
          <Typography variant='baseMdBold'>
            {formatAccount(account)}{' '}
          </Typography>
          {t('lending.withdraw.confirmStep.subjectLiquidity')}
        </Typography>
      </Stack>
      <WithdrawalModalConfirmedActions />
    </Stack>
  )
}

export default WithdrawalModalConfirmed
