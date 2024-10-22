import { Divider, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount } from '@/utils'

const SubsequentTransactions = () => {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant='h5'>
        {t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.title'
        )}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-1'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-1-tooltip'
        )}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(100, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2-tooltip'
        )}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(100, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3-tooltip'
        )}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(100, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4-tooltip'
        )}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(100, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
    </>
  )
}

export default SubsequentTransactions
