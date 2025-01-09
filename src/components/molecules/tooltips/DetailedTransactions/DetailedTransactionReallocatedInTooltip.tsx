import { Button } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { Routes } from '@/config/routes'
import { customPalette } from '@/themes/palette'

const DetailedTransactionReallocationInTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.detailedLendingRequestTransactions.tooltips.reallocatedIn.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedLendingRequestTransactions.tooltips.reallocatedIn.tooltip-2'
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
        'portfolio.transactions.detailedLendingRequestTransactions.tooltips.reallocatedIn.tooltip-3'
      )}
    </>
  )
}

export default DetailedTransactionReallocationInTooltip
