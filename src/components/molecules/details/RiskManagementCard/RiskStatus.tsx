import { Box, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { RiskMetricIds } from '@/constants'

import { PoolMetric } from '@/types/lending'

interface RiskStatusProps {
  metrics: PoolMetric[]
}

const RiskStatus: React.FC<RiskStatusProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const lossMetrics = useMemo(() => {
    const lossMetrics = metrics.filter(
      (metric) =>
        metric.id === RiskMetricIds.FirstLoss ||
        metric.id === RiskMetricIds.LossRate
    )

    return lossMetrics
  }, [metrics])

  return (
    <Box>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        {t('details.riskManagement.riskStatus.title')}
      </Typography>
      <ColoredBox>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {lossMetrics.map((metric) => (
            <Grid key={metric.id} item xs={6}>
              <InfoColumn
                title={t(
                  `details.riskManagement.riskStatus.${metric.id}.label`
                )}
                toolTipInfo={t(
                  `details.riskManagement.riskStatus.${metric.id}.tooltip`
                )}
                showDivider
                titleContainerSx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    px: 0,
                  },
                })}
                titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                metric={
                  <TokenAmount
                    amount={metric.content.toString()}
                    symbol={metric.unit || ''}
                    px={{ sx: 0, sm: 2 }}
                    py='6px'
                    color='grey.400'
                  />
                }
              />
            </Grid>
          ))}
        </Grid>
      </ColoredBox>
    </Box>
  )
}

export default RiskStatus
