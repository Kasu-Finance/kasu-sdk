import { Box, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

interface MetricDisplayProps {
  titleKey: string
  tooltipKey: string
  content: string
  additionalContent?: string
  suffix?: string
  isLast?: boolean
  isSingleTranche?: boolean
  isRemainingCapacity?: boolean
}

const TranchMetricDisplay: React.FC<MetricDisplayProps> = ({
  titleKey,
  tooltipKey,
  content,
  additionalContent,
  suffix,
  isLast,
  isSingleTranche,
  isRemainingCapacity,
}) => {
  const { t } = useTranslation()

  const translatedTitle = t(titleKey)
  const translatedTooltip = t(tooltipKey || '')

  const remainingCapacityContent = (
    <Box
      pl={{ xs: 0, sm: 2 }}
      display='flex'
      flexDirection='column'
      justifyContent='flex-start'
    >
      <Typography variant='h6' component='p'>
        {content} %
      </Typography>
      <Typography variant='body1' component='p'>
        {additionalContent}
        <Typography variant='caption' component='span'>
          {' '}
          {suffix}
        </Typography>
      </Typography>
    </Box>
  )

  const metricWithSuffixContent = (
    <MetricWithSuffix
      titleKey={titleKey}
      tooltipKey={tooltipKey}
      content={content}
      suffix={suffix}
      containerSx={{
        mb: isLast ? 0 : 2,
        mr: isLast ? 0 : 2,
        flexGrow: 1,
        width: 'auto',
      }}
    />
  )

  const multiTrancheContent = (
    <div>
      <ContentWithSuffix
        textAlign='right'
        content={`${content} %`}
        variant='body1'
      />
      <Typography
        textAlign='right'
        sx={{ fontSize: '12px' }}
        variant='caption'
        component='p'
      >
        {additionalContent} {suffix}
      </Typography>
    </div>
  )

  const multiTrancheMetric = isRemainingCapacity ? (
    multiTrancheContent
  ) : (
    <ContentWithSuffix
      textAlign='right'
      content={content}
      suffix={suffix}
      variant='body1'
      suffixVariant='caption'
    />
  )

  return isSingleTranche ? (
    isRemainingCapacity ? (
      <InfoColumn
        title={translatedTitle}
        toolTipInfo={translatedTooltip}
        showDivider
        containerSx={{
          flexGrow: 1,
          pr: isLast ? 0 : 2,
        }}
        metric={remainingCapacityContent}
      />
    ) : (
      <>{metricWithSuffixContent}</>
    )
  ) : (
    <InfoRow
      title={translatedTitle}
      toolTipInfo={translatedTooltip}
      showDivider={!isLast}
      metric={multiTrancheMetric}
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          px: 0,
        },
      })}
    />
  )
}

export default TranchMetricDisplay
