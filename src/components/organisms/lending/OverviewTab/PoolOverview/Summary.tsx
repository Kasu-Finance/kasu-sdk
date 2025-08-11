import { Grid } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import WaveCard from '@/components/molecules/WaveCard'

import { formatAmount } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type SummaryProps = {
  pool: PoolOverviewWithDelegate
}

const Summary: React.FC<SummaryProps> = ({ pool }) => {
  const { t } = getTranslation()

  return (
    <Grid container spacing={4}>
      <Grid item flex={1}>
        <WaveCard
          title={t('lending.poolOverview.detailCard.tvl.label')}
          toolTipInfo={t('lending.poolOverview.detailCard.tvl.tooltip')}
          content={formatAmount(pool.totalValueLocked.total || '0', {
            minDecimals: 2,
          })}
          unit='USDC'
          height={126}
          minWidth={200}
        />
      </Grid>
      <Grid item flex={1}>
        <WaveCard
          title={t('lending.poolOverview.detailCard.loansUnder.label')}
          toolTipInfo={t('lending.poolOverview.detailCard.loansUnder.tooltip')}
          content={formatAmount(pool.loansUnderManagement || '0', {
            minDecimals: 2,
          })}
          unit='USDC'
          height={126}
          minWidth={200}
        />
      </Grid>
      <Grid item flex={1}>
        <WaveCard
          title={t(
            'lending.poolOverview.detailCard.totalPoolYieldEarnings.label'
          )}
          toolTipInfo={t(
            'lending.poolOverview.detailCard.totalPoolYieldEarnings.tooltip'
          )}
          content={formatAmount(pool.yieldEarned || '0', { minDecimals: 2 })}
          unit='USDC'
          height={126}
          minWidth={200}
        />
      </Grid>
      <Grid item flex={1}>
        <WaveCard
          title={t('lending.poolOverview.detailCard.totalLossRate.label')}
          toolTipInfo={t(
            'lending.poolOverview.detailCard.totalLossRate.tooltip'
          )}
          content={formatAmount(pool.delegate.historicLossRate || '0', {
            minDecimals: 2,
          })}
          unit='%'
          height={126}
          minWidth={200}
        />
      </Grid>
    </Grid>
  )
}

export default Summary
