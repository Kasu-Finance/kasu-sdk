import { Box, Divider, Grid, Typography } from '@mui/material'
import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import WaveCard from '@/components/molecules/WaveCard'
import NextClearingPeriodCard from '@/components/organisms/lending/RepaymentsTab/AggregatedFundsFlow/NextClearingPeriodCard'

type AggregatedFundsFlowProps = {
  repayment: PoolRepayment | undefined
}

const AggregatedFundsFlow: React.FC<AggregatedFundsFlowProps> = ({
  repayment,
}) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h5' mt={2}>
        {t('repayments.sections.aggregated.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <Typography variant='baseMd' mt={4} component='p'>
        {t('repayments.sections.aggregated.description')}
      </Typography>
      <Grid container columnSpacing={4} mt={4}>
        <Grid item xs={6}>
          <WaveCard
            height={116}
            title={t(
              'repayments.sections.aggregated.metrics.totalBorrowers.label'
            )}
            toolTipInfo={t(
              'repayments.sections.aggregated.metrics.totalBorrowers.tooltip'
            )}
            content={
              repayment ? repayment.currentTotalEndBorrowers.toString() : '-'
            }
            unit=''
          />
        </Grid>
        <Grid item xs={6}>
          <NextClearingPeriodCard />
        </Grid>
      </Grid>
    </Box>
  )
}

export default AggregatedFundsFlow
