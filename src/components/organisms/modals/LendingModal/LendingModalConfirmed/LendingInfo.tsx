import { Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, formatTimestamp } from '@/utils'

const LendingInfo = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { amount, amountInUSD, trancheId } = useDepositModalState()

  const { nextEpochTime } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  return (
    <>
      <Typography variant='h4'>
        {t('modals.lending.completed.description-1')}
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {formatAmount(amountInUSD || amount || 0, { minDecimals: 2 })} USDC{' '}
        </Typography>
        {t('modals.lending.completed.description-2')} ({formattedTime.date} •{' '}
        {formattedTime.timestamp} {formattedTime.utcOffset}) {t('general.to')}{' '}
        <Typography variant='baseMdBold'>
          {pool.poolName}
          {pool.tranches.length > 1
            ? `, ${selectedTranche?.name} ${t('general.tranche')}`
            : null}
        </Typography>
      </Typography>
    </>
  )
}

export default LendingInfo
