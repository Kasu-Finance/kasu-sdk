import { Button } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { Routes } from '@/config/routes'
import { customPalette } from '@/themes/palette'

const WithdrawalStatusSummaryQueuedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip-2'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip-3'
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
      </Button>
      ,{' '}
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip-4'
      )}{' '}
    </>
  )
}

export default WithdrawalStatusSummaryQueuedTooltip
