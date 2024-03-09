import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricTextUnit from '@/components/molecules/details/MetricTextUnit'

import { MetricGroupType } from '@/constants'
import { PoolMetric } from '@/mock-data/pool-details/mockResponse'

interface MetricDisplayProps {
  metric: PoolMetric
  type: MetricGroupType
  isLastItem: boolean
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  metric,
  type,
  isLastItem,
}) => {
  const { t } = useTranslation()
  const titleKey = `details.poolDetails.${metric.id}.label`
  const tooltipKey = `details.poolDetails.${metric.id}.tooltip`

  return (
    <>
      {type === MetricGroupType.First ? (
        <MetricTextUnit
          metric={metric}
          titleKey={titleKey}
          tooltipKey={tooltipKey}
          containerSx={{ pr: isLastItem ? 0 : 2 }}
          sx={{ pb: 1 }}
        />
      ) : (
        <Box width='100%' pr={2}>
          <InfoRow
            showDivider
            title={t(titleKey)}
            toolTipInfo={t(tooltipKey)}
            metric={<Typography variant='body2'>{metric.content}</Typography>}
          />
        </Box>
      )}
    </>
  )
}

export default MetricDisplay
