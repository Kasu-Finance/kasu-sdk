'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
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
const SingleTrancheMetricDisplay: React.FC<MetricDisplayProps> = ({
  titleKey,
  tooltipKey,
  content,
  additionalContent,
  suffix,
  isLast,
  isRemainingCapacity,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {isRemainingCapacity ? (
        <InfoColumn
          title={t(titleKey)}
          toolTipInfo={t(tooltipKey)}
          showDivider
          containerSx={{
            width: '100%',
            pr: isLast ? 0 : 2,
          }}
          metric={
            <Box
              pl={2}
              display='flex'
              flexDirection='column'
              justifyContent='flex-start'
            >
              <Typography variant='h6' component='p' pl={2}>
                {content + ' %'}
              </Typography>
              <Typography variant='body1' component='p' pl={1}>
                {additionalContent}
                <Typography variant='caption' component='span'>
                  {' '}
                  {suffix}
                </Typography>
              </Typography>
            </Box>
          }
        />
      ) : (
        <MetricWithSuffix
          titleKey={titleKey}
          tooltipKey={tooltipKey}
          content={content}
          suffix={suffix}
          containerSx={{ mb: isLast ? 0 : 2, mr: isLast ? 0 : 2 }}
        />
      )}
    </>
  )
}

export default SingleTrancheMetricDisplay
