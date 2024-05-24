import { Box, Typography } from '@mui/material'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { MetricGroupType } from '@/constants'

import { PoolMetric } from '@/types/lending'

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
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <>
      {type === MetricGroupType.First ? (
        <MetricWithSuffix
          content={String(metric.content)}
          suffix={metric.unit || ''}
          titleKey={titleKey}
          tooltipKey={tooltipKey}
          containerSx={{ pr: isLastItem ? 0 : 2 }}
          sx={{ pb: 1 }}
        />
      ) : (
        <Box width='100%' pr={2}>
          <InfoRow
            showDivider={!isLastItem || isMobile}
            title={t(titleKey)}
            toolTipInfo={t(tooltipKey)}
            metric={
              <Typography
                variant='body1'
                align='right'
                fontSize={isMobile ? 12 : 'inherit'}
              >
                {metric.content}
              </Typography>
            }
          />
        </Box>
      )}
    </>
  )
}

export default MetricDisplay
