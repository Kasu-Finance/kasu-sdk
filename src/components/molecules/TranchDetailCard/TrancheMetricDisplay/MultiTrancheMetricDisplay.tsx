'use client'

import { Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'

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

const MultiTrancheMetricDisplay: React.FC<MetricDisplayProps> = ({
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
    <InfoRow
      title={t(titleKey)}
      toolTipInfo={t(tooltipKey)}
      showDivider={!isLast}
      metric={
        <>
          {isRemainingCapacity ? (
            <div>
              <ContentWithSuffix
                textAlign='right'
                content={content + ' %'}
                variant='body1'
              />
              <Typography
                textAlign='right'
                sx={{ fontSize: '12px' }}
                variant='caption'
                component='p'
              >
                {additionalContent + ' ' + suffix}
              </Typography>
            </div>
          ) : (
            <ContentWithSuffix
              textAlign='right'
              content={content}
              suffix={suffix}
              variant='body1'
              suffixVariant='caption'
            />
          )}
        </>
      }
    />
  )
}

export default MultiTrancheMetricDisplay
