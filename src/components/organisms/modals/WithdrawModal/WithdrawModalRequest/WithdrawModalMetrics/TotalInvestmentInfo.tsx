import { Box, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { FC } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { PoolMetric } from '@/types/lending'

interface PoolDataMetricsProps {
  poolData: PoolOverview
  totalInvestment: PoolMetric
  className?: string
}

const TotalInvestmentInfo: FC<PoolDataMetricsProps> = ({
  poolData,
  totalInvestment,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' className={className} mt={3}>
      <Box width='50%' pr={1}>
        <InfoColumn
          showDivider
          title={t('lending.withdraw.fromPool')}
          metric={
            <Typography variant='h6' pl={2} mt={0.5}>
              {poolData.poolName || 'N/A'}
            </Typography>
          }
        />
      </Box>
      <MetricWithSuffix
        key={totalInvestment.id}
        titleKey={t('lending.withdraw.metrics.totalInvestment.label')}
        tooltipKey={t('lending.withdraw.metrics.totalInvestment.tooltip')}
        suffix={totalInvestment.unit}
        content={String(totalInvestment.content)}
        containerSx={{ width: '50%' }}
        sx={{ mt: 0.5 }}
      />
    </Box>
  )
}

export default TotalInvestmentInfo
