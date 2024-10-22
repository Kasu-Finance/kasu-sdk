import { Divider, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount } from '@/utils'

const LendingRequests = () => {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant='h5'>
        {t('portfolio.transactions.lendingStatusSummary.lendingRequests.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1-tooltip'
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
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2-tooltip'
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
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3-tooltip'
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
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4-tooltip'
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
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5'
        )}
        toolTipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5-tooltip'
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

export default LendingRequests
