import { Button } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { Routes } from '@/config/routes'
import { customPalette } from '@/themes/palette'
import {
  DetailedTransaction,
  DetailedTransactionReallocationRequest,
} from '@/utils/lending/getDetailedTransactions'

type DetailedTransactionRequestedTooltipProps = {
  requestType:
    | DetailedTransaction['requestType']
    | DetailedTransactionReallocationRequest['requestType']
}

const DetailedTransactionRequestedTooltip: React.FC<
  DetailedTransactionRequestedTooltipProps
> = ({ requestType }) => {
  const { t } = getTranslation()

  return requestType === 'Deposit' ? (
    <>
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.deposit.requested.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.deposit.requested.tooltip-2'
      )}
    </>
  ) : requestType === 'Withdrawal' ? (
    <>
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.requested.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.requested.tooltip-2'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.requested.tooltip-3'
      )}{' '}
      <Button
        variant='text'
        sx={{
          p: 0,
          height: 'auto',
          textTransform: 'unset',
          font: 'inherit',
          verticalAlign: 'inherit',
          display: 'inline',
          color: 'white',
        }}
        href={Routes.lending.termsAndConditions.url}
        target='_blank'
        style={{ font: 'inherit', color: customPalette.gold.dark }}
      >
        {t('modals.termsAndConditions.title')}
      </Button>{' '}
      ,
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.requested.tooltip-4'
      )}{' '}
    </>
  ) : requestType === 'Funds Returned' ? (
    t(
      'portfolio.transactions.detailedTransactions.tooltips.fundsReturned.tooltip-1'
    )
  ) : (
    <>
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.reallocation.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.reallocation.tooltip-2'
      )}{' '}
      <Button
        variant='text'
        sx={{
          p: 0,
          height: 'auto',
          textTransform: 'unset',
          font: 'inherit',
          verticalAlign: 'inherit',
          display: 'inline',
          color: 'white',
        }}
        href={Routes.lending.termsAndConditions.url}
        target='_blank'
        style={{ font: 'inherit', color: customPalette.gold.dark }}
      >
        {t('modals.termsAndConditions.title')}
      </Button>{' '}
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.reallocation.tooltip-3'
      )}
    </>
  )
}

export default DetailedTransactionRequestedTooltip
